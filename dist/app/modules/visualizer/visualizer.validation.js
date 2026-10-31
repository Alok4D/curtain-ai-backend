"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualizerValidation = void 0;
const zod_1 = require("zod");
const generateVisualizationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        roomImage: zod_1.z.string({ message: 'Room photo is required' }),
        curtainImage: zod_1.z.string({ message: 'Curtain style image is required' }),
        curtainId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        curtainName: zod_1.z.string().optional(),
        drapeLength: zod_1.z.string().optional(),
        drapePosition: zod_1.z.string().optional(),
        curtainRod: zod_1.z.string().optional(),
    }),
});
exports.VisualizerValidation = {
    generateVisualizationValidationSchema,
};
