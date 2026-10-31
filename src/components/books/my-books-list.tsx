"use client";

import { BookPlus, CloudOff, Loader2, Pencil, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, deleteBook, getBooks, updateBook, type BookList } from "@/lib/api";
import type { BookFormValues } from "@/lib/validations";
import type { Book } from "@/types";
import { BookCover } from "./book-cover";
import { BookForm } from "./book-form";

const LIMIT = 10;

export function MyBooksList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: BookList; error?: string; last?: BookList } | null>(null);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [busy, setBusy] = useState(false);

  const key = `${page}|${reload}`;
  const loading = result?.key !== key;
  const data = result?.data ?? result?.last ?? null;
  const error = !loading ? (result?.error ?? null) : null;

  useEffect(() => {
    const ctrl = new AbortController();
    getBooks({ mine: true, sort: "newest", page, limit: LIMIT }, ctrl.signal)
      .then((d) => setResult({ key, data: d }))
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        if (e instanceof ApiError && e.status === 401) {
          router.push(`/login?callbackUrl=${encodeURIComponent("/my-books")}`);
          return;
        }
        setResult((prev) => ({ key, error: e instanceof ApiError ? e.message : "Could not load your books.", last: prev?.data ?? prev?.last }));
      });
    return () => ctrl.abort();
  }, [key, page, router]);

  async function save(values: BookFormValues) {
    if (!editing) return;
    try {
      await updateBook(editing._id, values);
      toast.success(`"${values.title}" was updated`);
      setEditing(null);
      setReload((n) => n + 1);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not update the book");
      if (e instanceof ApiError && (e.status === 404 || e.status === 403)) {
        setEditing(null);
        setReload((n) => n + 1);
      }
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteBook(deleting._id);
      toast.success(`"${deleting.title}" was deleted`);
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      setReload((n) => n + 1);
      setDeleting(null);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not delete the book");
      if (e instanceof ApiError && e.status !== 0) {
        setDeleting(null);
        setReload((n) => n + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  if (error)
    return (
      <Notice icon={<CloudOff className="size-9 text-forest" strokeWidth={1.5} />} title="Your books could not be loaded" text={error}>
        <Button variant="outline" size="sm" onClick={() => setReload((n) => n + 1)}>
          Try again
        </Button>
      </Notice>
    );
  if (!data)
    return (
      <div className="space-y-4" aria-busy>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[20px]" />
        ))}
      </div>
    );
  if (data.pagination.total === 0)
    return (
      <Notice icon={<BookPlus className="size-9 text-forest" strokeWidth={1.5} />} title="You have not added any books yet" text="Books you add show up here, where you can edit or remove them.">
        <Button asChild>
          <Link href="/add-book">Add a Book</Link>
        </Button>
      </Notice>
    );

  return (
    <>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {data.pagination.total} {data.pagination.total === 1 ? "book" : "books"} added by you
      </p>
      <ul className={loading ? "space-y-4 opacity-50" : "space-y-4"} aria-busy={loading}>
        {data.items.map((b) => {
          const onLoan = b.totalCopies - b.availableCopies;
          return (
            <li key={b._id} className="grid gap-5 rounded-[20px] border border-line bg-paper p-4 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center sm:p-5">
              <div className="flex gap-4 sm:contents">
                <div className="w-20 shrink-0 sm:w-auto">
                  <BookCover src={b.image} title={b.title} author={b.author} sizes="90px" />
                </div>
                <div className="min-w-0 sm:order-none">
                  <p className="text-sm font-semibold text-forest">{b.category}</p>
                  <h2 className="font-serif text-3xl leading-tight text-deep">
                    <Link href={`/books/${b._id}`} className="hover:underline">
                      {b.title}
                    </Link>
                  </h2>
                  <p className="truncate text-muted">by {b.author}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold text-deep">{b.availableCopies}</span> available of {b.totalCopies}
                    {onLoan > 0 && <span className="text-muted"> ({onLoan} on loan)</span>}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col">
                <Button variant="outline" size="sm" onClick={() => setEditing(b)}>
                  <Pencil /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-danger/40 text-danger hover:bg-danger/5"
                  disabled={onLoan > 0}
                  title={onLoan > 0 ? "Wait until every copy is returned" : undefined}
                  onClick={() => setDeleting(b)}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {data.pagination.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </nav>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="w-[min(44rem,calc(100vw-2rem))]">
          <DialogTitle>Edit book</DialogTitle>
          <DialogDescription>Ownership and the date added cannot be changed.</DialogDescription>
          {editing && (
            <div className="mt-6">
              <BookForm
                key={editing._id}
                initial={{
                  title: editing.title,
                  author: editing.author,
                  category: editing.category,
                  image: editing.image,
                  description: editing.description,
                  totalCopies: editing.totalCopies,
                }}
                onLoan={editing.totalCopies - editing.availableCopies}
                submitLabel="Save changes"
                onSubmit={save}
                onCancel={() => setEditing(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && !busy && setDeleting(null)}>
        <DialogContent>
          <DialogTitle>Delete this book?</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-deep">{deleting?.title}</span> will be removed from the library for everyone.
          </DialogDescription>
          <p className="mt-4 flex gap-2 rounded-2xl bg-danger/10 p-3 text-sm text-danger">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" /> This cannot be undone. Books that are currently borrowed cannot be deleted.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={busy}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={remove} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              Delete Book
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Notice({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] border border-dashed border-forest/30 px-6 py-16 text-center">
      {icon}
      <h2 className="mt-4 font-serif text-3xl">{title}</h2>
      <p className="mt-2 max-w-md text-muted">{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
