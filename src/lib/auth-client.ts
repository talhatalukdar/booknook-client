"use client";

import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Same-origin: the auth routes live in this Next.js app (/api/auth/*).
export const authClient = createAuthClient({ plugins: [jwtClient()] });
