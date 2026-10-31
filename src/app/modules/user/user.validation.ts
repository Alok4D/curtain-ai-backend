import { z } from 'zod';

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    email: z.string({ message: 'Valid email is required' }).email(),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'user']).optional(),
    avatarUrl: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
