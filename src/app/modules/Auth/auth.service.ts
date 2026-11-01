import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utlis/sendEmail';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { createToken } from './auth.utlis';

const loginUser = async (payload: TLoginUser) => {
  const email = (payload.email || payload.id || '').trim().toLowerCase();

  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User with this email does not exist!');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This account has been deleted!');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This account is blocked!');
  }

  const isPasswordMatch = await User.isPasswordMatched(
    payload.password,
    user.password,
  );

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Incorrect password!');
  }

  const jwtPayload = {
    userEmail: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    },
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const email = userData.userEmail || userData.email;
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const isMatch = await User.isPasswordMatched(payload.oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Current password is incorrect!');
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    { email },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token is missing!');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const email = decoded.userEmail || decoded.email;
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, decoded.iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Session expired. Please log in again.');
  }

  const jwtPayload = {
    userEmail: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgotPassword = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.isUserExistsByEmail(normalizedEmail);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User with this email was not found!');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This account is deleted!');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This account is blocked!');
  }

  // Generate 15-minute reset token
  const jwtPayload = {
    userEmail: user.email,
    role: user.role,
  };

  const resetToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '15m',
  });

  const resetLink = `${config.reset_pass_ui_link}?token=${resetToken}`;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #004642; padding: 28px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Curtain AI AI Studio</h1>
        <p style="color: #a4df3b; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Password Reset Request</p>
      </div>
      <div style="padding: 32px 28px; color: #2d3748; line-height: 1.6;">
        <p style="font-size: 16px; font-weight: 600; margin-top: 0;">Hello ${user.name || 'there'},</p>
        <p style="font-size: 14px; color: #4a5568;">We received a request to reset the password for your account associated with <strong>${user.email}</strong>.</p>
        <p style="font-size: 14px; color: #4a5568;">Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #004642; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 6px rgba(0,70,66,0.3);">Reset My Password</a>
        </div>
        <p style="font-size: 12px; color: #718096; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email. Your current password remains unchanged.</p>
        <div style="border-top: 1px solid #edf2f7; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #a0aec0; word-break: break-all;">
          If the button above does not work, copy and paste this link into your browser:<br/>
          <a href="${resetLink}" style="color: #004642;">${resetLink}</a>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail(user.email, htmlContent, 'Curtain AI AI Studio - Reset Your Password');
  } catch (emailErr) {
    console.error('Email sending failed (check Gmail App Password credentials):', emailErr);
  }

  return {
    resetToken,
    resetLink,
  };
};

const resetPassword = async (payload: { token: string; password: string }) => {
  const { token, password } = payload;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Reset token is missing or expired!');
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Reset token is invalid or has expired. Please request a new link.');
  }

  const email = decoded.userEmail || decoded.email;
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This account has been deleted!');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This account is blocked!');
  }

  const newHashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    { email },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
};
