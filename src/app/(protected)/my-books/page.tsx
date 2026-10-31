import type { Metadata } from "next";
import { MyBooksList } from "@/components/books/my-books-list";

export const metadata: Metadata = { title: "My Books" };

export default function MyBooksPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
      <h1 className="display !text-[clamp(2.4rem,5vw,4rem)]">My books</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Books you added. Edit them, change the number of copies, or remove them.</p>
      <div className="mt-10">
        <MyBooksList />
      </div>
    </div>
  );
}
