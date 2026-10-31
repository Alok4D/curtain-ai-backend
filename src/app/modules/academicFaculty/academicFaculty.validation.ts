import { z } from 'zod';

const createAcademicFacultyZodValidation = z.object({
  body: z.object({
    name: z
      .string()
      .nonempty('Faculty name is required')
      .trim()
      .min(2, 'Faculty name must be at least 2 characters long')
      .max(50, 'Faculty name cannot exceed 50 characters'),
  }),
});

const updateAcademicFacultyZodValidation = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Faculty name must be at least 2 characters long')
    .max(50, 'Faculty name cannot exceed 50 characters')
    .optional(),
});

export const academicFacultyValidations = {
  createAcademicFacultyZodValidation,
  updateAcademicFacultyZodValidation,
};
