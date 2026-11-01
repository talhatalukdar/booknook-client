import type { Category } from "@/types";

// Soft tile colours behind covers and on category tiles (Fitzcarraldo-style uniform tiles).
export const categoryTint: Record<Category, string> = {
  Fiction: "#E4ECED",
  Science: "#D8F4F8",
  History: "#DCE6E8",
  Kids: "#E8F6F9",
  Others: "#E9ECEC",
};
