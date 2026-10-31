import type { Category } from "@/types";

// Soft tile colours behind covers and on category tiles (Fitzcarraldo-style uniform tiles).
export const categoryTint: Record<Category, string> = {
  Fiction: "#E9E1CF",
  Science: "#D9E5DD",
  History: "#EADCCF",
  Kids: "#F3E3BC",
  Others: "#E2E5DC",
};
