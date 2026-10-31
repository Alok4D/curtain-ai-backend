"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurtainValidation = void 0;
const zod_1 = require("zod");
const createCurtainValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: 'Name is required' }),
        category: zod_1.z.enum(['curtains', 'sheers', 'rollers']),
        image_url: zod_1.z.string({ message: 'Image URL is required' }),
        display_image_url: zod_1.z.string({ message: 'Display image URL is required' }),
        material: zod_1.z.string().optional(),
        price: zod_1.z.number().optional(),
        inStock: zod_1.z.boolean().optional(),
    }),
});
const updateCurtainValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        category: zod_1.z.enum(['curtains', 'sheers', 'rollers']).optional(),
        image_url: zod_1.z.string().optional(),
        display_image_url: zod_1.z.string().optional(),
        material: zod_1.z.string().optional(),
        price: zod_1.z.number().optional(),
        inStock: zod_1.z.boolean().optional(),
    }),
});
exports.CurtainValidation = {
    createCurtainValidationSchema,
    updateCurtainValidationSchema,
};
