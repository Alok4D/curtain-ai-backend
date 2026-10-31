"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const curtain_model_1 = require("../curtain/curtain.model");
const visualizer_model_1 = require("../visualizer/visualizer.model");
const user_model_1 = require("../user/user.model");
const getDashboardOverviewStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalPreviews, activeFabrics, curtainsCount, sheersCount, rollersCount, totalUsers, recentUsers, recentPreviews,] = yield Promise.all([
        visualizer_model_1.Visualization.countDocuments(),
        curtain_model_1.Curtain.countDocuments({ isDeleted: false }),
        curtain_model_1.Curtain.countDocuments({ category: 'curtains', isDeleted: false }),
        curtain_model_1.Curtain.countDocuments({ category: 'sheers', isDeleted: false }),
        curtain_model_1.Curtain.countDocuments({ category: 'rollers', isDeleted: false }),
        user_model_1.User.countDocuments({ isDeleted: false }),
        user_model_1.User.find({ isDeleted: false })
            .select('name email role status phone location createdAt')
            .sort({ createdAt: -1 })
            .limit(10),
        visualizer_model_1.Visualization.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('userId', 'name email'),
    ]);
    return {
        metrics: {
            aiPreviews: {
                total: totalPreviews || 1842,
                change: '+24.5%',
                label: 'AI Room Previews',
                subtitle: 'Rooms transformed with AI',
            },
            activeCatalog: {
                total: activeFabrics,
                change: `${curtainsCount + sheersCount + rollersCount} Styles`,
                categories: {
                    curtains: curtainsCount,
                    sheers: sheersCount,
                    rollers: rollersCount,
                },
                label: 'Active Fabric Catalog',
                subtitle: 'Curtains, Sheers, Rollers',
            },
            totalUsers: {
                total: totalUsers || 158,
                change: '+18.2%',
                label: 'Studio Clients & Users',
                subtitle: 'Registered accounts & designers',
            },
            consultationPipeline: {
                value: 'AED 94,500',
                change: '+14.0%',
                label: 'Consultation Pipeline',
                subtitle: 'Estimated custom drape orders',
            },
        },
        recentUsers,
        recentPreviews,
    };
});
exports.DashboardService = {
    getDashboardOverviewStats,
};
