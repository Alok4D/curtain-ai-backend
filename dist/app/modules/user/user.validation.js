"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: 'Name is required' }),
        email: zod_1.z.string({ message: 'Valid email is required' }).email(),
        password: zod_1.z
            .string({ message: 'Password is required' })
            .min(6, 'Password must be at least 6 characters'),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(['admin', 'user']).optional(),
        avatarUrl: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        bio: zod_1.z.string().optional(),
    }),
});
const updateUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        avatarUrl: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        bio: zod_1.z.string().optional(),
    }),
});
exports.UserValidation = {
    createUserValidationSchema,
    updateUserValidationSchema,
};
