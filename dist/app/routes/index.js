"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../modules/Auth/auth.route");
const curtain_route_1 = require("../modules/curtain/curtain.route");
const dashboard_route_1 = require("../modules/dashboard/dashboard.route");
const user_route_1 = require("../modules/user/user.route");
const visualizer_route_1 = require("../modules/visualizer/visualizer.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/users',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/curtains',
        route: curtain_route_1.CurtainRoutes,
    },
    {
        path: '/visualizer',
        route: visualizer_route_1.VisualizerRoutes,
    },
    {
        path: '/dashboard',
        route: dashboard_route_1.DashboardRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
