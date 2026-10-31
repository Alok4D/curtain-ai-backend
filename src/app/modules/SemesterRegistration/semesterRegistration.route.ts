import express from 'express';
import validateRequest from '../../middlwares/validateRequest';
import { SemesterRegistrationValidations } from './semesterRegistration.validation';
import { SemesterRegistrationController } from './semesterRegistration.controller';

const router = express.Router();

router.post(
  '/create-Semester-Registration',
  validateRequest(
    SemesterRegistrationValidations.createSemesterRegistrationValidation,
  ),
  SemesterRegistrationController.createSemesterRegistration,
);

router.get(
  '/:id',
  SemesterRegistrationController.getSingleSemesterRegistrations,
);

router.get('/', SemesterRegistrationController.getAllSemesterRegistrations);

router.patch(
  '/:id',
  validateRequest(
    SemesterRegistrationValidations.updateSemesterRegistrationValidation,
  ),
  SemesterRegistrationController.updateSemesterRegistrations,
);

export const semesterRegistrationRoutes = router;
