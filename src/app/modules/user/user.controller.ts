import httpStatus from 'http-status';
import catchAsync from '../../utlis/catchAsync';
import sendResponse from '../../utlis/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(async (req, res) => {
  const result = await UserService.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully!',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const { userEmail } = req.user;
  const result = await UserService.getMeFromDB(userEmail);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully!',
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { userEmail } = req.user;
  const result = await UserService.updateProfileInDB(userEmail, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile updated successfully!',
    data: result,
  });
});

export const UserController = {
  createUser,
  getMe,
  updateProfile,
};
