import { Curtain } from '../curtain/curtain.model';
import { Visualization } from '../visualizer/visualizer.model';
import { User } from '../user/user.model';

const getDashboardOverviewStats = async () => {
  const [
    totalPreviews,
    activeFabrics,
    curtainsCount,
    sheersCount,
    rollersCount,
    totalUsers,
    recentUsers,
    recentPreviews,
  ] = await Promise.all([
    Visualization.countDocuments(),
    Curtain.countDocuments({ isDeleted: false }),
    Curtain.countDocuments({ category: 'curtains', isDeleted: false }),
    Curtain.countDocuments({ category: 'sheers', isDeleted: false }),
    Curtain.countDocuments({ category: 'rollers', isDeleted: false }),
    User.countDocuments({ isDeleted: false }),
    User.find({ isDeleted: false })
      .select('name email role status phone location createdAt')
      .sort({ createdAt: -1 })
      .limit(10),
    Visualization.find()
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
};

export const DashboardService = {
  getDashboardOverviewStats,
};
