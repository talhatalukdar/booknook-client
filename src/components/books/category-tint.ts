import type { Category } from "@/types";

// Soft tile colours behind covers and on category tiles (Fitzcarraldo-style uniform tiles).
export const categoryTint: Record<Category, string> = {
  Fiction: "#EFE6D2",
  Science: "#DDE8DF",
  History: "#F0DFD1",
  Kids: "#F6E7BE",
  Others: "#E3E8EC",
};
