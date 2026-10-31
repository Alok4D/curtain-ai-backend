import { z } from 'zod';

/**
 * ✅ Validation schema for creating a new Academic Department
 */
const createAcademicDepartmentZodValidation = z.object({
  name: z
    .string()
    .nonempty({ message: 'Department name is required' })
    .trim()
    .min(2, { message: 'Department name must be at least 2 characters long' })
    .max(50, { message: 'Department name cannot exceed 50 characters' }),

  academicFaculty: z
    .string()
    .nonempty({ message: 'Academic faculty ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid faculty ObjectId' }),
});

/**
 * ✅ Validation schema for updating an Academic Department
 * (All fields are optional for PATCH/PUT)
 */
const updateAcademicDepartmentZodValidation = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Department name must be at least 2 characters long' })
    .max(50, { message: 'Department name cannot exceed 50 characters' })
    .optional(),

  academicFaculty: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid faculty ObjectId' })
    .optional(),
});

export const academicDepartmentValidations = {
  createAcademicDepartmentZodValidation,
  updateAcademicDepartmentZodValidation,
};
