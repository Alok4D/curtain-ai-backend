import { z } from 'zod';

const userValidationSchema = z.object({
  password: z
    .string()
    .max(20, { message: 'Password cannot be more than 20 characters' })
    .optional()
    .refine((val) => typeof val === 'string' || val === undefined, {
      message: 'Password must be a string',
    }),
});

export const UserValidation = {
  userValidationSchema,
};
