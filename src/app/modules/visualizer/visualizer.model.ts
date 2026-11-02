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
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export const Visualization = model<TVisualization>('Visualization', visualizationSchema);
