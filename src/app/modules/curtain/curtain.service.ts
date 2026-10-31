import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TCurtain } from './curtain.interface';
import { Curtain } from './curtain.model';
import { initialCurtainsSeedData } from './curtain.seed';
import { uploadToCloudinary } from '../../utlis/cloudinary';

const getAllCurtainsFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isDeleted: false };

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.searchTerm) {
    const searchRegex = new RegExp(query.searchTerm as string, 'i');
    filter.$or = [
      { name: searchRegex },
      { material: searchRegex },
      { category: searchRegex },
    ];
  }

  const curtains = await Curtain.find(filter).sort({ id: -1, createdAt: -1 });
  return curtains;
};

const getCurtainByIdFromDB = async (id: string | number) => {
  const isNumeric = !isNaN(Number(id));
  const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };

  const curtain = await Curtain.findOne(query);
  if (!curtain) {
    throw new AppError(httpStatus.NOT_FOUND, 'Curtain fabric not found!');
  }
  return curtain;
};

const createCurtainIntoDB = async (payload: TCurtain) => {
  if (!payload.id) {
    const lastItem = await Curtain.findOne().sort({ id: -1 });
    payload.id = lastItem?.id ? lastItem.id + 1 : Date.now();
  }

  // Auto-upload to Cloudinary if image is provided as base64 DataURL
  if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
    try {
      const uploadRes = await uploadToCloudinary(payload.display_image_url, 'curtains');
      payload.display_image_url = uploadRes.secure_url;
      if (!payload.image_url || payload.image_url.startsWith('data:image')) {
        payload.image_url = uploadRes.secure_url;
      }
    } catch (uploadErr) {
      console.warn('Curtain photo upload to Cloudinary failed:', uploadErr);
    }
  }

  const result = await Curtain.create(payload);
  return result;
};

const updateCurtainInDB = async (id: string | number, payload: Partial<TCurtain>) => {
  const isNumeric = !isNaN(Number(id));
  const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };

  // Auto-upload to Cloudinary if image is updated as base64 DataURL
  if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
    try {
      const uploadRes = await uploadToCloudinary(payload.display_image_url, 'curtains');
      payload.display_image_url = uploadRes.secure_url;
      if (payload.image_url && payload.image_url.startsWith('data:image')) {
        payload.image_url = uploadRes.secure_url;
      }
    } catch (uploadErr) {
      console.warn('Curtain photo upload to Cloudinary failed:', uploadErr);
    }
  }

  const result = await Curtain.findOneAndUpdate(query, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Curtain fabric not found to update!');
  }

  return result;
};

const deleteCurtainFromDB = async (id: string | number) => {
  const isNumeric = !isNaN(Number(id));
  const query = isNumeric ? { id: Number(id) } : { _id: id };

  const result = await Curtain.findOneAndUpdate(query, { isDeleted: true }, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Curtain fabric not found to delete!');
  }

  return result;
};

const seedCurtainsIntoDB = async () => {
  const count = await Curtain.countDocuments({ isDeleted: false });
  if (count === 0) {
    await Curtain.insertMany(initialCurtainsSeedData);
    return { seeded: true, count: initialCurtainsSeedData.length };
  }
  return { seeded: false, count };
};

export const CurtainService = {
  getAllCurtainsFromDB,
  getCurtainByIdFromDB,
  createCurtainIntoDB,
  updateCurtainInDB,
  deleteCurtainFromDB,
  seedCurtainsIntoDB,
};

