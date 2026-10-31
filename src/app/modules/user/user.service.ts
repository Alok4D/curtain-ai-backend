import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TUser } from './user.interface';
import { User } from './user.model';

const createUserIntoDB = async (payload: Partial<TUser>) => {
  const isExisting = await User.isUserExistsByEmail(payload.email as string);
  if (isExisting) {
    throw new AppError(httpStatus.CONFLICT, 'User with this email already exists!');
  }

  const result = await User.create(payload);
  return result;
};

const getMeFromDB = async (email: string) => {
  const result = await User.findOne({ email, isDeleted: false });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  return result;
};

const updateProfileInDB = async (email: string, payload: Partial<TUser>) => {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Prevent email or role escalation via general update
  delete payload.email;
  delete payload.role;

  const result = await User.findOneAndUpdate({ email }, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const UserService = {
  createUserIntoDB,
  getMeFromDB,
  updateProfileInDB,
};
