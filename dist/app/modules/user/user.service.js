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
exports.UserService = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = require("./user.model");
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExisting = yield user_model_1.User.isUserExistsByEmail(payload.email);
    if (isExisting) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User with this email already exists!');
    }
    const result = yield user_model_1.User.create(payload);
    return result;
});
const getMeFromDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findOne({ email, isDeleted: false });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    return result;
});
const updateProfileInDB = (email, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email, isDeleted: false });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    // Prevent email or role escalation via general update
    delete payload.email;
    delete payload.role;
    const result = yield user_model_1.User.findOneAndUpdate({ email }, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
exports.UserService = {
    createUserIntoDB,
    getMeFromDB,
    updateProfileInDB,
};
