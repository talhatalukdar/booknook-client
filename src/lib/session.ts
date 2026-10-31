import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt?: string;
}

/** Server-side session lookup (cookie -> database). Returns null when logged out or on failure. */
export const getServerUser = cache(async (): Promise<SessionUser | null> => {
  // headers() must stay outside try/catch: it is what marks the route as dynamic, and a swallowed
  // dynamic-API signal would let Next prerender private pages at build time.
  const requestHeaders = await headers();
  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) return null;
    const { id, name, email, image, createdAt } = session.user;
    return { id, name, email, image: image ?? null, createdAt: new Date(createdAt).toISOString() };
  } catch {
    return null;
  }
});
