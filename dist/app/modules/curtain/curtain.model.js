"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Curtain = void 0;
const mongoose_1 = require("mongoose");
const curtainSchema = new mongoose_1.Schema({
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
    },
    image_url: {
        type: String,
        required: true,
    },
    display_image_url: {
        type: String,
        required: true,
    },
    material: {
        type: String,
        default: '100% Premium Belgian Linen',
    },
    price: {
        type: Number,
        default: 180,
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
exports.Curtain = (0, mongoose_1.model)('Curtain', curtainSchema);
