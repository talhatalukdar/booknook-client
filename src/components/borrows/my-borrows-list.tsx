"use client";

import { CloudOff, Library, Loader2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookCover } from "@/components/books/book-cover";
import { Notice } from "@/components/books/my-books-list";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getBorrows, returnBorrow } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import type { Borrow } from "@/types";

function StatusBadge({ b }: { b: Borrow }) {
  const s =
    b.status === "returned"
      ? { label: "Returned", cls: "bg-primary/10 text-primary" }
      : b.overdue
        ? { label: "Overdue", cls: "bg-danger/10 text-danger" }
        : { label: "Borrowed", cls: "bg-teal/25 text-[#6d5214]" };
  return <span className={cn("inline-flex h-7 items-center rounded-full px-3 text-sm font-semibold", s.cls)}>{s.label}</span>;
}

export function MyBorrowsList() {
  const router = useRouter();
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<{ key: number; data?: Borrow[]; error?: string; last?: Borrow[] } | null>(null);
  const [returning, setReturning] = useState<Borrow | null>(null);
  const [busy, setBusy] = useState(false);

  const loading = result?.key !== reload;
  const data = result?.data ?? result?.last ?? null;
  const error = !loading ? (result?.error ?? null) : null;

  useEffect(() => {
    let live = true;
    getBorrows()
      .then((d) => live && setResult({ key: reload, data: d }))
      .catch((e) => {
        if (!live) return;
        if (e instanceof ApiError && e.status === 401) {
          router.push(`/login?callbackUrl=${encodeURIComponent("/my-borrows")}`);
          return;
        }
        setResult((prev) => ({ key: reload, error: e instanceof ApiError ? e.message : "Could not load your borrows.", last: prev?.data ?? prev?.last }));
      });
    return () => {
      live = false;
    };
  }, [reload, router]);

  async function confirmReturn() {
    if (!returning) return;
    setBusy(true);
    try {
      await returnBorrow(returning._id);
      toast.success(`"${returning.bookTitle}" was returned. Thank you!`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not return the book");
    } finally {
      setBusy(false);
      setReturning(null);
      setReload((n) => n + 1); // always re-read the real state (also after a 409 duplicate return)
    }
  }

  if (error)
    return (
      <Notice icon={<CloudOff className="size-9 text-primary" strokeWidth={1.5} />} title="Your borrows could not be loaded" text={error}>
        <Button variant="outline" size="sm" onClick={() => setReload((n) => n + 1)}>
          Try again
        </Button>
      </Notice>
    );
  if (!data)
    return (
      <div className="space-y-3" aria-busy>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[20px]" />
        ))}
      </div>
    );
  if (data.length === 0)
    return (
      <Notice icon={<Library className="size-9 text-primary" strokeWidth={1.5} />} title="You have not borrowed anything yet" text="Pick a book from the shelf and it will show up here.">
        <Button asChild>
          <Link href="/books">Browse Books</Link>
        </Button>
      </Notice>
    );

  const active = data.filter((b) => b.status === "active").length;
  const cols = "md:grid-cols-[4.5rem_minmax(0,1.6fr)_1fr_1fr_8rem_9rem]";

  return (
    <>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {active} currently borrowed, {data.length - active} returned
      </p>
      <div className={cn("hidden gap-4 px-5 pb-2 text-sm font-semibold text-muted md:grid", cols)} aria-hidden>
        <span />
        <span>Book</span>
        <span>Borrowed on</span>
        <span>Return date</span>
        <span>Status</span>
        <span />
      </div>
      <ul className={cn("space-y-3", loading && "opacity-50")} aria-busy={loading}>
        {data.map((b) => (
          <li key={b._id} className={cn("grid items-center gap-x-4 gap-y-3 rounded-[20px] border border-line bg-paper p-4 sm:px-5", "grid-cols-[4.5rem_1fr]", cols)}>
            <div className="w-[4.5rem]">
              <BookCover src={b.bookImage} title={b.bookTitle} author="" sizes="72px" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-3xl font-bold leading-tight text-night">
                <Link href={`/books/${b.bookId}`} className="hover:underline">
                  {b.bookTitle}
                </Link>
              </h2>
            </div>
            <p className="col-span-2 text-sm md:col-span-1 md:text-base">
              <span className="text-muted md:hidden">Borrowed on </span>
              {formatDate(b.borrowDate)}
            </p>
            <p className="col-span-2 text-sm md:col-span-1 md:text-base">
              <span className="text-muted md:hidden">{b.status === "returned" ? "Returned on " : "Return by "}</span>
              {formatDate(b.status === "returned" && b.returnedAt ? b.returnedAt : b.returnDate)}
            </p>
            <div className="col-span-2 md:col-span-1">
              <StatusBadge b={b} />
            </div>
            <div className="col-span-2 md:col-span-1 md:justify-self-end">
              {b.status === "active" ? (
                <Button variant="outline" size="sm" onClick={() => setReturning(b)}>
                  <Undo2 /> Return Book
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!returning} onOpenChange={(o) => !o && !busy && setReturning(null)}>
        <DialogContent>
          <DialogTitle>Return this book?</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-night">{returning?.bookTitle}</span> goes back on the shelf and becomes available to other readers.
          </DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={busy}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={confirmReturn} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {busy ? "Returning" : "Return Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
