import { z } from 'zod';
import { SemesterRegistrationStatus } from './semesterRegistration.constant';

// ------------------ CREATE SCHEMA ------------------
const createSemesterRegistrationValidation = z.object({
  body: z.object({
    academicSemester: z.string({
      message: 'Academic Semester ID is required',
    }),

    status: z
      .enum([...SemesterRegistrationStatus] as [string, ...string[]])
      .optional(),

    startDate: z
      .string({ message: 'Start date is required' })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid date',
      }),

    endDate: z
      .string({ message: 'End date is required' })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'End date must be a valid date',
      }),

    minCredit: z
      .number({ message: 'Minimum credit is required' })
      .min(1, 'Minimum credit must be at least 1'),

    maxCredit: z
      .number({ message: 'Maximum credit is required' })
      .max(30, 'Maximum credit must not exceed 30'),
  }),
});

// ------------------ UPDATE SCHEMA ------------------
const updateSemesterRegistrationValidation = z.object({
  body: z.object({
    academicSemester: z.string().optional(),

    status: z
      .enum([...SemesterRegistrationStatus] as [string, ...string[]])
      .optional(),

    startDate: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Start date must be a valid date',
      })
      .optional(),

    endDate: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'End date must be a valid date',
      })
      .optional(),

    minCredit: z
      .number()
      .min(1, 'Minimum credit must be at least 1')
      .optional(),

    maxCredit: z
      .number()
      .max(30, 'Maximum credit must not exceed 30')
      .optional(),
  }),
});

// ------------------ EXPORT ------------------
export const SemesterRegistrationValidations = {
  createSemesterRegistrationValidation,
  updateSemesterRegistrationValidation,
};
