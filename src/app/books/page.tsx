import type { Metadata } from "next";
import { Suspense } from "react";
import { BooksExplorer } from "@/components/books/books-explorer";

export const metadata: Metadata = { title: "All Books" };

export default function BooksPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <h1 className="page-title">All <em>books</em></h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Everything on the shelf right now. Search by title or author, or narrow it down by category.
      </p>
      <div className="mt-10">
        <Suspense>
          <BooksExplorer />
        </Suspense>
      </div>
    </div>
  );
}
