import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import catchAsync from '../utlis/catchAsync';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized to access this resource!');
    }

    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;

    const email = decoded.userEmail || decoded.email;
    const { role, iat } = decoded;

    const user = await User.isUserExistsByEmail(email);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User does not exist!');
    }

    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user account is deleted!');
    }

    if (user.status === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user account is blocked!');
    }

    if (
      user.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        iat as number,
      )
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Password was changed recently. Please log in again.');
    }

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.FORBIDDEN, 'You do not have permission to perform this action!');
    }

    req.user = {
      ...decoded,
      userEmail: email,
      role,
    };

    next();
  });
};

export default auth;
