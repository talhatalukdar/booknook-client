import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/auth/profile-view";
import { getServerUser } from "@/lib/session";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) redirect("/login?callbackUrl=%2Fprofile");
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
      <h1 className="page-title">My <em>profile</em></h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Your account details and a summary of your reading.</p>
      <div className="mt-10">
        <ProfileView user={user} />
      </div>
    </div>
  );
}
