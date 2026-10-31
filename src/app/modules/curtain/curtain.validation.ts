import { z } from 'zod';

const createCurtainValidationSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    category: z.enum(['curtains', 'sheers', 'rollers']),
    image_url: z.string({ message: 'Image URL is required' }),
    display_image_url: z.string({ message: 'Display image URL is required' }),
    material: z.string().optional(),
    price: z.number().optional(),
    inStock: z.boolean().optional(),
  }),
});

const updateCurtainValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    category: z.enum(['curtains', 'sheers', 'rollers']).optional(),
    image_url: z.string().optional(),
    display_image_url: z.string().optional(),
    material: z.string().optional(),
    price: z.number().optional(),
    inStock: z.boolean().optional(),
  }),
});

export const CurtainValidation = {
  createCurtainValidationSchema,
  updateCurtainValidationSchema,
};
