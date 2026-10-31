import httpStatus from 'http-status';
import catchAsync from '../../utlis/catchAsync';
import sendResponse from '../../utlis/sendResponse';
import { DashboardService } from './dashboard.service';

const getOverviewStats = catchAsync(async (req, res) => {
  const result = await DashboardService.getDashboardOverviewStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard overview stats retrieved successfully!',
    data: result,
  });
});

export const DashboardController = {
  getOverviewStats,
};

