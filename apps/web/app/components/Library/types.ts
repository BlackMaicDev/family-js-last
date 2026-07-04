export interface Category {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  thumbnail?: string;
  isbn?: string;
  pageCount?: number;
  publisher?: string;
  price?: number;
  categories: string[];
  categoryId?: string;
  bookCategoryId?: string;
  category?: Category;
}
