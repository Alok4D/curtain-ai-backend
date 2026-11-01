import { Schema, model } from 'mongoose';
import { TCurtain } from './curtain.interface';

export const curtainSchema = new Schema<TCurtain>(
  {
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
  },
  {
    timestamps: true,
  },
);

export const Curtain = model<TCurtain>('Curtain', curtainSchema);
