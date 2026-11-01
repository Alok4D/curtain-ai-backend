export type TCurtainCategory = 'curtains' | 'sheers' | 'rollers';

export interface TCurtain {
  id?: number;
  name: string;
  category: TCurtainCategory;
  colors?: string[];
  fabric?: string;
  pattern?: string;
  style?: string[];
  opacity?: string;
  texture?: string;
  suitableRooms?: string[];
  images?: string[];
  isActive?: boolean;
  image_url?: string;
  display_image_url?: string;
  material?: string;
  inStock?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
