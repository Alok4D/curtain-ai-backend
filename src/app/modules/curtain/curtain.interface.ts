export type TCurtainCategory = 'curtains' | 'sheers' | 'rollers';

export interface TCurtain {
  id?: number;
  name: string;
  category: TCurtainCategory;
  image_url: string;
  display_image_url: string;
  material?: string;
  price?: number;
  inStock?: boolean;
  isDeleted?: boolean;
}

