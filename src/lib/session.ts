import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/** Server-side session lookup (cookie -> database). Returns null when logged out or on failure. */
export const getServerUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return null;
    const { id, name, email, image } = session.user;
    return { id, name, email, image: image ?? null };
  } catch {
    return null;
  }
});
