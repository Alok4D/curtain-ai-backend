import express from 'express';
import validateRequest from '../../middlwares/validateRequest';
import { VisualizerController } from './visualizer.controller';
import { VisualizerValidation } from './visualizer.validation';

const router = express.Router();

router.post(
  '/generate',
  validateRequest(VisualizerValidation.generateVisualizationValidationSchema),
  VisualizerController.generateImage,
);

router.get('/recent', VisualizerController.getRecentVisualizations);

export const VisualizerRoutes = router;

