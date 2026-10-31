import { Schema, model } from 'mongoose';
import { TCurtain } from './curtain.interface';

const curtainSchema = new Schema<TCurtain>(
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
  },
  {
    timestamps: true,
  },
);

export const Curtain = model<TCurtain>('Curtain', curtainSchema);

