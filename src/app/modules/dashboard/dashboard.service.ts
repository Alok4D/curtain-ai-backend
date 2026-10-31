import { Curtain } from '../curtain/curtain.model';
import { Visualization } from '../visualizer/visualizer.model';

const getDashboardOverviewStats = async () => {
  const [totalPreviews, activeFabrics, curtainsCount, sheersCount, rollersCount, recentPreviews] =
    await Promise.all([
      Visualization.countDocuments(),
      Curtain.countDocuments({ isDeleted: false }),
      Curtain.countDocuments({ category: 'curtains', isDeleted: false }),
      Curtain.countDocuments({ category: 'sheers', isDeleted: false }),
      Curtain.countDocuments({ category: 'rollers', isDeleted: false }),
      Visualization.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'name email'),
    ]);

  return {
    metrics: {
      aiPreviews: {
        total: totalPreviews,
        label: 'AI Room Previews',
        subtitle: 'Rooms transformed with AI',
      },
      activeCatalog: {
        total: activeFabrics,
        categories: {
          curtains: curtainsCount,
          sheers: sheersCount,
          rollers: rollersCount,
        },
        label: 'Active Fabric Catalog',
        subtitle: 'Curtains, Sheers, Rollers',
      },
      consultationPipeline: {
        value: 'AED 94,500',
        change: '+14.0%',
        subtitle: 'Estimated custom orders',
      },
    },
    recentPreviews,
  };
};

export const DashboardService = {
  getDashboardOverviewStats,
};

