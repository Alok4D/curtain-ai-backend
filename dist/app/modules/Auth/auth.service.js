"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendEmail_1 = require("../../utlis/sendEmail");
const user_model_1 = require("../user/user.model");
const auth_utlis_1 = require("./auth.utlis");
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const email = (payload.email || payload.id || '').trim().toLowerCase();
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User with this email does not exist!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This account has been deleted!');
    }
    if (user.status === 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This account is blocked!');
    }
    const isPasswordMatch = yield user_model_1.User.isPasswordMatched(payload.password, user.password);
    if (!isPasswordMatch) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Incorrect password!');
    }
    const jwtPayload = {
        userEmail: user.email,
        role: user.role,
        name: user.name,
    };
    const accessToken = (0, auth_utlis_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utlis_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
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
});
const changePassword = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const email = userData.userEmail || userData.email;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    if (user.status === 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    const isMatch = yield user_model_1.User.isPasswordMatched(payload.oldPassword, user.password);
    if (!isMatch) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Current password is incorrect!');
    }
    const newHashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield user_model_1.User.findOneAndUpdate({ email }, {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
    });
    return null;
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Refresh token is missing!');
    }
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_refresh_secret);
    const email = decoded.userEmail || decoded.email;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    if (user.status === 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.passwordChangedAt &&
        user_model_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, decoded.iat)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Session expired. Please log in again.');
    }
    const jwtPayload = {
        userEmail: user.email,
        role: user.role,
        name: user.name,
    };
    const accessToken = (0, auth_utlis_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedEmail = email.trim().toLowerCase();
    const user = yield user_model_1.User.isUserExistsByEmail(normalizedEmail);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User with this email was not found!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This account is deleted!');
    }
    if (user.status === 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This account is blocked!');
    }
    // Generate 15-minute reset token
    const jwtPayload = {
        userEmail: user.email,
        role: user.role,
    };
    const resetToken = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, {
        expiresIn: '15m',
    });
    const resetLink = `${config_1.default.reset_pass_ui_link}?token=${resetToken}`;
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
        yield (0, sendEmail_1.sendEmail)(user.email, htmlContent, 'Curtain AI AI Studio - Reset Your Password');
    }
    catch (emailErr) {
        console.error('Email sending failed (check Gmail App Password credentials):', emailErr);
    }
    return {
        resetToken,
        resetLink,
    };
});
const resetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = payload;
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Reset token is missing or expired!');
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
    }
    catch (_a) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Reset token is invalid or has expired. Please request a new link.');
    }
    const email = decoded.userEmail || decoded.email;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This account has been deleted!');
    }
    if (user.status === 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This account is blocked!');
    }
    const newHashedPassword = yield bcrypt_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
    yield user_model_1.User.findOneAndUpdate({ email }, {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
    });
    return null;
});
exports.AuthServices = {
    loginUser,
    changePassword,
    refreshToken,
    forgotPassword,
    resetPassword,
};
