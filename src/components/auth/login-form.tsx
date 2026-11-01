"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginValues } from "@/lib/validations";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  async function onSubmit(v: LoginValues) {
    const { error } = await authClient.signIn.email({ email: v.email, password: v.password });
    if (error) {
      toast.error(error.message || "Invalid email or password");
      return;
    }
    toast.success("Welcome back");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => toast.info("Password reset is not available yet")}
              className="cursor-pointer text-sm font-medium text-primary underline underline-offset-4"
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput id="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Logging in" : "Login"}
        </Button>
      </form>

      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton callbackUrl={callbackUrl} label="Login with Google" />

      <p className="text-center text-sm text-muted">
        New to BookNook?{" "}
        <Link
          href={callbackUrl === "/" ? "/register" : `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-primary underline underline-offset-4"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
