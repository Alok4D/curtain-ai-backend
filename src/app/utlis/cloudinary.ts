import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const uploadToCloudinary = async (
  fileOrBase64: string,
  folder: string = 'curtain-ai'
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const result = await cloudinary.uploader.upload(fileOrBase64, {
      folder: `Curtain AI/${folder}`,
      resource_type: 'auto',
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error?.message || 'Failed to upload image to Cloudinary');
  }
};

export default cloudinary;

