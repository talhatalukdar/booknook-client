import type { Metadata } from "next";
import { AddBookForm } from "@/components/books/add-book-form";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/session";

export const metadata: Metadata = { title: "Add Book" };

export default async function AddBookPage() {
  const user = await getServerUser();
  if (!user) redirect("/login?callbackUrl=%2Fadd-book");
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
      <h1 className="page-title">Add a <em>book</em></h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Shelve a book for other readers. It appears in All Books right away.</p>
      <div className="mt-10">
        <AddBookForm account={{ name: user.name, email: user.email, image: user.image }} />
      </div>
    </div>
  );
}
