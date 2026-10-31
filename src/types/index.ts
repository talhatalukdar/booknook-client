// Mirrors the Express API contract (booknook-server/src/types and validators).
export const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Book {
  _id: string;
  title: string;
  author: string;
  category: Category;
  image: string;
  description: string;
  addedByUserId: string;
  addedByName: string;
  addedByEmail: string;
  totalCopies: number;
  availableCopies: number;
  addedAt: string;
  updatedAt: string;
}

export interface Borrow {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
  status: "active" | "returned";
  returnedAt: string | null;
  createdAt: string;
  overdue?: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookInput {
  title: string;
  author: string;
  category: Category;
  image: string;
  description: string;
  totalCopies: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}
