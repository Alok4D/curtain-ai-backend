import express from 'express';
import { AcademicFacultyControllers } from './academicFaculty.controller';
import validateRequest from '../../middlwares/validateRequest';
import { academicFacultyValidations } from './academicFaculty.validation';

const router = express.Router();

router.post(
  '/create-academic-faculty',
  validateRequest(
    academicFacultyValidations.createAcademicFacultyZodValidation,
  ),
  AcademicFacultyControllers.createAcademicFaculty,
);

router.get('/:id', AcademicFacultyControllers.getSingleAcademicFaculty);

router.patch(
  '/:id',
  validateRequest(
    academicFacultyValidations.updateAcademicFacultyZodValidation,
  ),
  AcademicFacultyControllers.updateAcademicFaculty,
);

router.get('/', AcademicFacultyControllers.getAllAcademicFaculties);

export const AcademicFacultyRoutes = router;
