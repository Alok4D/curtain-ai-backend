import express from 'express';
import auth from '../../middlwares/auth';
import validateRequest from '../../middlwares/validateRequest';
import { CurtainController } from './curtain.controller';
import { CurtainValidation } from './curtain.validation';

const router = express.Router();

router.get('/', CurtainController.getAllCurtains);
router.get('/seed', CurtainController.seedCurtains);
router.get('/:id', CurtainController.getCurtainById);

router.post(
  '/',
  auth('admin'),
  validateRequest(CurtainValidation.createCurtainValidationSchema),
  CurtainController.createCurtain,
);

router.patch(
  '/:id',
  auth('admin'),
  validateRequest(CurtainValidation.updateCurtainValidationSchema),
  CurtainController.updateCurtain,
);

router.delete('/:id', auth('admin'), CurtainController.deleteCurtain);

export const CurtainRoutes = router;

