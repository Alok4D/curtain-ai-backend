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
        default: 'Floor-skimming',
    },
    drapePosition: {
        type: String,
        default: 'Framing sides',
    },
    curtainRod: {
        type: String,
        default: 'Matte black minimalist curtain rod',
    },
    headerStyle: {
        type: String,
        default: 'Wave Header',
    },
    fabricOpacity: {
        type: String,
        default: 'Auto',
    },
    pleatDensity: {
        type: String,
        default: 'Medium',
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
