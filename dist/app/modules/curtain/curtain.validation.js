"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurtainValidation = void 0;
const zod_1 = require("zod");
const createCurtainValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: 'Name is required' }),
        category: zod_1.z.enum(['curtains', 'sheers', 'rollers']).default('curtains'),
        colors: zod_1.z.array(zod_1.z.string()).optional(),
        fabric: zod_1.z.string().optional(),
        pattern: zod_1.z.string().optional(),
        style: zod_1.z.array(zod_1.z.string()).optional(),
        opacity: zod_1.z.string().optional(),
        texture: zod_1.z.string().optional(),
        suitableRooms: zod_1.z.array(zod_1.z.string()).optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        isActive: zod_1.z.boolean().optional(),
        image_url: zod_1.z.string().optional(),
        display_image_url: zod_1.z.string().optional(),
        material: zod_1.z.string().optional(),
        inStock: zod_1.z.boolean().optional(),
    }),
});
const updateCurtainValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        category: zod_1.z.enum(['curtains', 'sheers', 'rollers']).optional(),
        colors: zod_1.z.array(zod_1.z.string()).optional(),
        fabric: zod_1.z.string().optional(),
        pattern: zod_1.z.string().optional(),
        style: zod_1.z.array(zod_1.z.string()).optional(),
        opacity: zod_1.z.string().optional(),
        texture: zod_1.z.string().optional(),
        suitableRooms: zod_1.z.array(zod_1.z.string()).optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        isActive: zod_1.z.boolean().optional(),
        image_url: zod_1.z.string().optional(),
        display_image_url: zod_1.z.string().optional(),
        material: zod_1.z.string().optional(),
        inStock: zod_1.z.boolean().optional(),
    }),
});
const recommendCurtainValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        roomImage: zod_1.z.string({ message: 'Room image is required' }),
    }),
});
const autoFillCurtainSpecsValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        image: zod_1.z.string({ message: 'Curtain image is required' }),
    }),
});
exports.CurtainValidation = {
    createCurtainValidationSchema,
    updateCurtainValidationSchema,
    recommendCurtainValidationSchema,
    autoFillCurtainSpecsValidationSchema,
};
