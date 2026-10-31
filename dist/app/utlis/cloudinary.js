"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("../config"));
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinary_cloud_name,
    api_key: config_1.default.cloudinary_api_key,
    api_secret: config_1.default.cloudinary_api_secret,
});
const uploadToCloudinary = (fileOrBase64_1, ...args_1) => __awaiter(void 0, [fileOrBase64_1, ...args_1], void 0, function* (fileOrBase64, folder = 'curtain-ai') {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(fileOrBase64, {
            folder: `curtainz/${folder}`,
            resource_type: 'auto',
        });
        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
        };
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Failed to upload image to Cloudinary');
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
exports.default = cloudinary_1.v2;
