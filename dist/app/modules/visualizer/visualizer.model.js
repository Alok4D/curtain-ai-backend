"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visualization = void 0;
const mongoose_1 = require("mongoose");
const visualizationSchema = new mongoose_1.Schema({
    roomImageUrl: {
        type: String,
        required: true,
    },
    curtainImageUrl: {
        type: String,
        required: true,
    },
    generatedImageUrl: {
        type: String,
        required: true,
    },
    curtainName: {
        type: String,
        default: 'Custom Fabric',
    },
    curtainId: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    drapeLength: {
        type: String,
        default: 'just touching the floor',
    },
    drapePosition: {
        type: String,
        default: 'pulled open to the sides framing the window with natural daylight coming through',
    },
    curtainRod: {
        type: String,
        default: 'matte black minimalist curtain rod mounted just below the ceiling',
    },
    userIp: {
        type: String,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
exports.Visualization = (0, mongoose_1.model)('Visualization', visualizationSchema);
