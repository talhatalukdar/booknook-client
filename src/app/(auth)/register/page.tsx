import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getServerUser } from "@/lib/session";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const callbackUrl = safeCallbackUrl((await searchParams).callbackUrl);
  if (await getServerUser()) redirect(callbackUrl);
  return (
    <AuthShell title="Create your account" subtitle="Register to add, borrow and return books.">
      <RegisterForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
