import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { CurtainRoutes } from '../modules/curtain/curtain.route';
import { DashboardRoutes } from '../modules/dashboard/dashboard.route';
import { UserRoutes } from '../modules/user/user.route';
import { VisualizerRoutes } from '../modules/visualizer/visualizer.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/curtains',
    route: CurtainRoutes,
  },
  {
    path: '/visualizer',
    route: VisualizerRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
