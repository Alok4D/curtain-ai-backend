import express from 'express';
import auth from '../../middlwares/auth';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

router.get('/stats', auth('admin'), DashboardController.getOverviewStats);

export const DashboardRoutes = router;

