"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { passwordRules, registerSchema, type RegisterValues } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), mode: "onTouched" });
  const password = useWatch({ control, name: "password" }) ?? "";

  async function onSubmit(v: RegisterValues) {
    const { error } = await authClient.signUp.email({
      name: v.name,
      email: v.email,
      password: v.password,
      image: v.photoUrl,
    });
    if (error) {
      toast.error(error.message || "Registration failed. Please try again.");
      return;
    }
    toast.success("Account created. Please log in.");
    router.push(callbackUrl === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="photoUrl">Photo URL</Label>
          <Input id="photoUrl" type="url" placeholder="https://" autoComplete="photo" aria-invalid={!!errors.photoUrl} {...register("photoUrl")} />
          <FieldError message={errors.photoUrl?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
          <ul className="mt-2.5 space-y-1" aria-label="Password requirements">
            {passwordRules.map((r) => {
              const ok = r.test(password);
              return (
                <li key={r.id} className={cn("flex items-center gap-2 text-sm", ok ? "text-success" : "text-muted")}>
                  {ok ? <Check className="size-4" /> : <Circle className="size-3 ml-0.5 mr-0.5" />}
                  {r.label}
                </li>
              );
            })}
          </ul>
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Creating account" : "Register"}
        </Button>
      </form>

      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton callbackUrl="/" label="Continue with Google" />

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary underline underline-offset-4">
          Login
        </Link>
      </p>
    </div>
  );
}
