import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || 'curtainz_access_secret',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || 'curtainz_refresh_secret',
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '365d',
  openai_api_key: process.env.OPENAI_API_KEY,
  image_model: process.env.IMAGE_MODEL || 'gpt-image-2.5-sunburst',
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
};
