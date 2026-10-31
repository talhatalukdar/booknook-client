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
