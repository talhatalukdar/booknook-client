import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getServerUser } from "@/lib/session";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const callbackUrl = safeCallbackUrl((await searchParams).callbackUrl);
  if (await getServerUser()) redirect(callbackUrl);
  return (
    <AuthShell title="Welcome back" subtitle="Login to borrow books and manage your shelf.">
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
