"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Curtain = exports.curtainSchema = void 0;
const mongoose_1 = require("mongoose");
exports.curtainSchema = new mongoose_1.Schema({
    id: {
        type: Number,
        unique: true,
        sparse: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ['curtains', 'sheers', 'rollers'],
        required: true,
        default: 'curtains',
    },
    colors: {
        type: [String],
        default: ['beige', 'cream'],
    },
    fabric: {
        type: String,
        default: 'linen',
        trim: true,
    },
    pattern: {
        type: String,
        default: 'plain',
        trim: true,
    },
    style: {
        type: [String],
        default: ['modern', 'minimalist'],
    },
    opacity: {
        type: String,
        default: 'semi-sheer',
        trim: true,
    },
    texture: {
        type: String,
        default: 'natural linen',
        trim: true,
    },
    suitableRooms: {
        type: [String],
        default: ['living-room', 'bedroom'],
    },
    images: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    image_url: {
        type: String,
        required: false,
    },
    display_image_url: {
        type: String,
        required: false,
    },
    material: {
        type: String,
        default: '100% Premium Belgian Linen',
    },
    inStock: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Curtain = (0, mongoose_1.model)('Curtain', exports.curtainSchema);
