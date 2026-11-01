import httpStatus from 'http-status';
import catchAsync from '../../utlis/catchAsync';
import sendResponse from '../../utlis/sendResponse';
import { CurtainService } from './curtain.service';

const getAllCurtains = catchAsync(async (req, res) => {
  const result = await CurtainService.getAllCurtainsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Curtains retrieved successfully!',
    data: result,
  });
});

const getCurtainById = catchAsync(async (req, res) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const result = await CurtainService.getCurtainByIdFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Curtain retrieved successfully!',
    data: result,
  });
});

const createCurtain = catchAsync(async (req, res) => {
  const result = await CurtainService.createCurtainIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Curtain fabric added successfully!',
    data: result,
  });
});

const updateCurtain = catchAsync(async (req, res) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const result = await CurtainService.updateCurtainInDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Curtain fabric updated successfully!',
    data: result,
  });
});

const deleteCurtain = catchAsync(async (req, res) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const result = await CurtainService.deleteCurtainFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Curtain fabric deleted successfully!',
    data: result,
  });
});

const seedCurtains = catchAsync(async (req, res) => {
  const result = await CurtainService.seedCurtainsIntoDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.seeded ? 'Database seeded successfully with fabrics!' : 'Database already seeded.',
    data: result,
  });
});

const getCurtainRecommendations = catchAsync(async (req, res) => {
  const { roomImage } = req.body;
  const result = await CurtainService.getCurtainRecommendationsFromDB(roomImage);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Curtain recommendations curated by Interior Specialist successfully!',
    data: result,
  });
});

export const CurtainController = {
  getAllCurtains,
  getCurtainById,
  createCurtain,
  updateCurtain,
  deleteCurtain,
  seedCurtains,
  getCurtainRecommendations,
};
