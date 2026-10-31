import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for private routes: no session cookie => /login?callbackUrl=<original route>.
 * The cookie is only checked for presence here; real validation happens on the server
 * (getServerUser in protected layouts) and, for data, in Express via the verified JWT.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const login = new URL("/login", request.url);
  login.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/add-book/:path*", "/my-books/:path*", "/my-borrows/:path*", "/profile/:path*", "/books/:id"],
};
