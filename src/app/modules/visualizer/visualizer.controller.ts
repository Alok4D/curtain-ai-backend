import httpStatus from 'http-status';
import catchAsync from '../../utlis/catchAsync';
import sendResponse from '../../utlis/sendResponse';
import { VisualizerService } from './visualizer.service';

const generateImage = catchAsync(async (req, res) => {
  const userIp =
    (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userId = req.user ? (req.user as any)._id : undefined;

  const result = await VisualizerService.generateCurtainVisualization({
    ...req.body,
    userIp,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Curtain preview generated successfully!',
    data: result,
  });
});

const getRecentVisualizations = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const result = await VisualizerService.getRecentVisualizationsFromDB(limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recent room visualizer previews retrieved successfully!',
    data: result,
  });
});

export const VisualizerController = {
  generateImage,
  getRecentVisualizations,
};

