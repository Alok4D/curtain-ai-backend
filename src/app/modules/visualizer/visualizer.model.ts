import { Schema, model } from 'mongoose';
import { TVisualization } from './visualizer.interface';

const visualizationSchema = new Schema<TVisualization>(
  {
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
      type: Schema.Types.Mixed,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export const Visualization = model<TVisualization>('Visualization', visualizationSchema);

