"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError, createBook } from "@/lib/api";
import type { BookFormValues } from "@/lib/validations";
import { BookForm } from "./book-form";

export function AddBookForm({ account }: { account: { name: string; email: string; image: string | null } }) {
  const router = useRouter();

  async function onSubmit(values: BookFormValues) {
    try {
      // Only book fields are sent. Owner id/name/email are derived from the JWT on the server.
      const book = await createBook(values);
      toast.success(`"${book.title}" was added to the library`);
      router.push(`/books/${book._id}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        router.push(`/login?callbackUrl=${encodeURIComponent("/add-book")}`);
        return;
      }
      toast.error(e instanceof ApiError ? e.message : "Could not add the book");
    }
  }

  return <BookForm account={account} submitLabel="Add Book" onSubmit={onSubmit} />;
}
