import { z } from "zod";

export const passwordRules = [
  { id: "upper", label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "length", label: "At least 6 characters", test: (v: string) => v.length >= 6 },
] as const;

const password = z
  .string()
  .min(1, "Password is required")
  .refine((v) => /[A-Z]/.test(v), "Password must include an uppercase letter")
  .refine((v) => /[a-z]/.test(v), "Password must include a lowercase letter")
  .refine((v) => v.length >= 6, "Password must be at least 6 characters");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  photoUrl: z
    .string()
    .trim()
    .min(1, "Photo URL is required")
    .url("Enter a valid URL")
    .refine((v) => /^https?:\/\//i.test(v), "URL must start with http:// or https://"),
  password,
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

// ---- Add / edit book ----------------------------------------------------------------------
import { CATEGORIES } from "@/types";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

// Identity fields (owner id, name, email, addedAt, availableCopies) are intentionally absent:
// the Express API derives them from the verified JWT and its own state.
export const bookFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150, "Title is too long"),
  author: z.string().trim().min(2, "Author must be at least 2 characters").max(100, "Author name is too long"),
  category: z.enum(CATEGORIES, { error: "Choose a category" }),
  image: z.string().min(1, "Upload a cover image").url("Upload a cover image"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be at most 2000 characters"),
  totalCopies: z
    .number({ error: "Enter the number of copies" })
    .int("Copies must be a whole number")
    .min(1, "At least 1 copy")
    .max(1000, "At most 1000 copies"),
});
export type BookFormValues = z.infer<typeof bookFormSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
});
export type ProfileValues = z.infer<typeof profileSchema>;
