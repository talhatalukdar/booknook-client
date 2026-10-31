"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookCheck, BookMarked, BookPlus, CalendarClock, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AvatarUploader } from "./avatar-uploader";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, clearJwt, getBooks, getBorrows } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { profileSchema, type ProfileValues } from "@/lib/validations";

interface Stats {
  active: number;
  overdue: number;
  returned: number;
  added: number;
}

export function ProfileView({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  useEffect(() => {
    let live = true;
    Promise.all([getBorrows(), getBooks({ mine: true, limit: 1 })])
      .then(([borrows, mine]) => {
        if (!live) return;
        setStats({
          active: borrows.filter((b) => b.status === "active").length,
          overdue: borrows.filter((b) => b.overdue).length,
          returned: borrows.filter((b) => b.status === "returned").length,
          added: mine.pagination.total,
        });
      })
      .catch((e) => {
        if (live && !(e instanceof ApiError && e.status === 401)) setStatsError(true);
      });
    return () => {
      live = false;
    };
  }, []);

  async function onSubmit(v: ProfileValues) {
    const { error } = await authClient.updateUser({ name: v.name });
    if (error) {
      toast.error(error.message || "Could not update your profile");
      return;
    }
    clearJwt(); // the next API token must carry the new name
    toast.success("Profile updated");
    router.refresh();
  }

  const cards = stats
    ? [
        { icon: BookMarked, label: "Borrowed now", value: stats.active, note: stats.overdue ? `${stats.overdue} overdue` : undefined },
        { icon: BookCheck, label: "Returned", value: stats.returned },
        { icon: BookPlus, label: "Books added", value: stats.added },
      ]
    : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <section aria-label="Account">
        <AvatarUploader name={user.name} image={user.image} />
        <div className="mt-8 min-w-0">
          <h2 className="truncate font-serif text-5xl leading-none text-deep">{user.name}</h2>
          <p className="mt-2 truncate text-muted">{user.email}</p>
        </div>
        {user.createdAt && (
          <p className="mt-5 flex items-center gap-2 text-sm text-muted">
            <CalendarClock className="size-4" /> Member since {formatDate(user.createdAt)}
          </p>
        )}

        <h3 className="mt-12 font-serif text-4xl">Reading <em>activity</em></h3>
        {statsError ? (
          <p className="mt-3 text-muted">Your activity could not be loaded right now.</p>
        ) : !stats ? (
          <div className="mt-4 grid grid-cols-3 gap-3" aria-busy>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-[20px]" />
            ))}
          </div>
        ) : (
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {cards.map((c) => (
              <div key={c.label} className="rounded-[20px] border border-line bg-paper p-4">
                <c.icon className="size-5 text-forest" strokeWidth={1.5} />
                <dd className="mt-3 text-4xl font-semibold leading-none text-deep tabular-nums">{c.value}</dd>
                <dt className="mt-1 text-sm text-muted">{c.label}</dt>
                {c.note && <p className="mt-1 text-sm font-semibold text-danger">{c.note}</p>}
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-label="Edit profile" className="rounded-[24px] border border-line bg-paper p-6 sm:p-8">
        <h3 className="font-serif text-4xl">Edit <em>profile</em></h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly className="bg-line/50" />
            <p className="mt-1.5 flex items-center gap-2 text-sm text-muted">
              <Lock className="size-3.5" /> Your email is your login and cannot be changed here.
            </p>
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting || !isDirty}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Saving" : "Save changes"}
          </Button>
        </form>
      </section>
    </div>
  );
}
