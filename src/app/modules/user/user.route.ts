import express from 'express';
import auth from '../../middlwares/auth';
import validateRequest from '../../middlwares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser,
);

router.get('/me', auth('admin', 'user'), UserController.getMe);

router.patch(
  '/me',
  auth('admin', 'user'),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateProfile,
);

export const UserRoutes = router;
