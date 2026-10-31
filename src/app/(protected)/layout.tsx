import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/session";

// Real session validation for every private page. The proxy only checks that a cookie exists;
// this catches expired or revoked sessions.
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await getServerUser())) redirect("/login");
  return children;
}
