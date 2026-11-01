"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL,
    bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET || 'Curtain AI_access_secret',
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || 'Curtain AI_refresh_secret',
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '365d',
    openai_api_key: process.env.OPENAI_API_KEY,
    image_model: process.env.IMAGE_MODEL || 'gpt-image-2.5-sunburst',
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    client_url: process.env.CLIENT_URL || 'http://localhost:3000',
    email_host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    email_port: Number(process.env.EMAIL_PORT) || 465,
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    email_from: process.env.EMAIL_FROM || 'MetaGen AI <alokroy602701@gmail.com>',
    reset_pass_ui_link: `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password`,
};
