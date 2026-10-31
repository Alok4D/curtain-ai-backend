import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    id: z.string().optional(),
    password: z.string({ message: 'Password is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      message: 'Old password is required',
    }),
    newPassword: z.string({ message: 'New password is required' }).min(6),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      message: 'Refresh token is required!',
    }),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
};
