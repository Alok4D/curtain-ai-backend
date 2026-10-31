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
exports.CurtainService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const curtain_model_1 = require("./curtain.model");
const curtain_seed_1 = require("./curtain.seed");
const cloudinary_1 = require("../../utlis/cloudinary");
const getAllCurtainsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { isDeleted: false };
    if (query.category && query.category !== 'all') {
        filter.category = query.category;
    }
    if (query.searchTerm) {
        const searchRegex = new RegExp(query.searchTerm, 'i');
        filter.$or = [
            { name: searchRegex },
            { material: searchRegex },
            { category: searchRegex },
        ];
    }
    const curtains = yield curtain_model_1.Curtain.find(filter).sort({ id: -1, createdAt: -1 });
    return curtains;
});
const getCurtainByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isNumeric = !isNaN(Number(id));
    const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };
    const curtain = yield curtain_model_1.Curtain.findOne(query);
    if (!curtain) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Curtain fabric not found!');
    }
    return curtain;
});
const createCurtainIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.id) {
        const lastItem = yield curtain_model_1.Curtain.findOne().sort({ id: -1 });
        payload.id = (lastItem === null || lastItem === void 0 ? void 0 : lastItem.id) ? lastItem.id + 1 : Date.now();
    }
    // Auto-upload to Cloudinary if image is provided as base64 DataURL
    if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
        try {
            const uploadRes = yield (0, cloudinary_1.uploadToCloudinary)(payload.display_image_url, 'curtains');
            payload.display_image_url = uploadRes.secure_url;
            if (!payload.image_url || payload.image_url.startsWith('data:image')) {
                payload.image_url = uploadRes.secure_url;
            }
        }
        catch (uploadErr) {
            console.warn('Curtain photo upload to Cloudinary failed:', uploadErr);
        }
    }
    const result = yield curtain_model_1.Curtain.create(payload);
    return result;
});
const updateCurtainInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isNumeric = !isNaN(Number(id));
    const query = isNumeric ? { id: Number(id), isDeleted: false } : { _id: id, isDeleted: false };
    // Auto-upload to Cloudinary if image is updated as base64 DataURL
    if (payload.display_image_url && payload.display_image_url.startsWith('data:image')) {
        try {
            const uploadRes = yield (0, cloudinary_1.uploadToCloudinary)(payload.display_image_url, 'curtains');
            payload.display_image_url = uploadRes.secure_url;
            if (payload.image_url && payload.image_url.startsWith('data:image')) {
                payload.image_url = uploadRes.secure_url;
            }
        }
        catch (uploadErr) {
            console.warn('Curtain photo upload to Cloudinary failed:', uploadErr);
        }
    }
    const result = yield curtain_model_1.Curtain.findOneAndUpdate(query, payload, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Curtain fabric not found to update!');
    }
    return result;
});
const deleteCurtainFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isNumeric = !isNaN(Number(id));
    const query = isNumeric ? { id: Number(id) } : { _id: id };
    const result = yield curtain_model_1.Curtain.findOneAndUpdate(query, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Curtain fabric not found to delete!');
    }
    return result;
});
const seedCurtainsIntoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield curtain_model_1.Curtain.countDocuments({ isDeleted: false });
    if (count === 0) {
        yield curtain_model_1.Curtain.insertMany(curtain_seed_1.initialCurtainsSeedData);
        return { seeded: true, count: curtain_seed_1.initialCurtainsSeedData.length };
    }
    return { seeded: false, count };
});
exports.CurtainService = {
    getAllCurtainsFromDB,
    getCurtainByIdFromDB,
    createCurtainIntoDB,
    updateCurtainInDB,
    deleteCurtainFromDB,
    seedCurtainsIntoDB,
};
