import { Types } from 'mongoose';

export interface TVisualizationInput {
  roomImage: string;
  curtainImage: string;
  curtainId?: number | Types.ObjectId;
  curtainName?: string;
  drapeLength?: string;
  drapePosition?: string;
  curtainRod?: string;
  userIp?: string;
  userId?: Types.ObjectId;
}

export interface TVisualization {
  roomImageUrl: string;
  curtainImageUrl: string;
  generatedImageUrl: string;
  curtainName?: string;
  curtainId?: number | Types.ObjectId;
  drapeLength: string;
  drapePosition: string;
  curtainRod: string;
  userIp?: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

