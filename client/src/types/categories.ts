export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
}

export interface UpdateCategoryData {
  name: string;
  slug: string;
}
