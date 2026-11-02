import { z } from 'zod';

const generateVisualizationValidationSchema = z.object({
  body: z.object({
    roomImage: z.string({ message: 'Room photo is required' }),
    curtainImage: z.string({ message: 'Curtain style image is required' }),
    curtainId: z.union([z.number(), z.string()]).optional(),
    curtainName: z.string().optional(),
    drapeLength: z.string().optional(),
    drapePosition: z.string().optional(),
    curtainRod: z.string().optional(),
    headerStyle: z.string().optional(),
    fabricOpacity: z.string().optional(),
    pleatDensity: z.string().optional(),
  }),
});

export const VisualizerValidation = {
  generateVisualizationValidationSchema,
};
