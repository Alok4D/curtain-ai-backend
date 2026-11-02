import { z } from 'zod';

const createCurtainValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    category: z.enum(['curtains', 'sheers', 'rollers']).default('curtains'),
    colors: z.array(z.string()).optional(),
    fabric: z.string().optional(),
    pattern: z.string().optional(),
    style: z.array(z.string()).optional(),
    opacity: z.string().optional(),
    texture: z.string().optional(),
    suitableRooms: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    image_url: z.string().optional(),
    display_image_url: z.string().optional(),
    material: z.string().optional(),
    inStock: z.boolean().optional(),
  }),
});

const updateCurtainValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    category: z.enum(['curtains', 'sheers', 'rollers']).optional(),
    colors: z.array(z.string()).optional(),
    fabric: z.string().optional(),
    pattern: z.string().optional(),
    style: z.array(z.string()).optional(),
    opacity: z.string().optional(),
    texture: z.string().optional(),
    suitableRooms: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    image_url: z.string().optional(),
    display_image_url: z.string().optional(),
    material: z.string().optional(),
    inStock: z.boolean().optional(),
  }),
});

const recommendCurtainValidationSchema = z.object({
  body: z.object({
    roomImage: z.string({ message: 'Room image is required' }),
  }),
});

const autoFillCurtainSpecsValidationSchema = z.object({
  body: z.object({
    image: z.string({ message: 'Curtain image is required' }),
  }),
});

export const CurtainValidation = {
  createCurtainValidationSchema,
  updateCurtainValidationSchema,
  recommendCurtainValidationSchema,
  autoFillCurtainSpecsValidationSchema,
};
