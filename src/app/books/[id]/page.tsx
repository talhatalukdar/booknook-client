import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { availabilityState } from "@/components/books/availability-badge";
import { BookCard } from "@/components/books/book-card";
import { BookCover } from "@/components/books/book-cover";
import { BorrowButton } from "@/components/books/borrow-button";
import { categoryTint } from "@/components/books/category-tint";
import { RecordView } from "@/components/books/record-view";
import { ApiError, getBook, getBooks } from "@/lib/api";
import { getServerUser } from "@/lib/session";
import { cn, formatDate } from "@/lib/utils";
import type { Book } from "@/types";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ borrow?: string }> };

async function load(id: string): Promise<Book | null> {
  try {
    return await getBook(id);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 400 || e.status === 404)) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await load((await params).id).catch(() => null);
  return { title: book ? `Book Details: ${book.title}` : "Book Details" };
}

export default async function BookDetailsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { borrow } = await searchParams;
  // Page-level protection (the proxy also redirects when there is no session cookie at all).
  const user = await getServerUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(`/books/${id}${borrow ? `?borrow=${borrow}` : ""}`)}`);

  const book = await load(id);
  if (!book) notFound();

  const state = availabilityState(book.availableCopies);
  const pct = Math.round((book.availableCopies / Math.max(book.totalCopies, 1)) * 100);
  const related = await getBooks({ category: book.category, sort: "newest", limit: 5 })
    .then((r) => r.items.filter((b) => b._id !== book._id).slice(0, 4))
    .catch(() => [] as Book[]);

  const facts = [
    ["Total copies", String(book.totalCopies)],
    ["Available copies", String(book.availableCopies)],
    ["Added by", book.addedByName],
    ["Added on", formatDate(book.addedAt)],
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
      <RecordView book={{ id: book._id, title: book.title, author: book.author, image: book.image }} />
      <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted">
        <Link href="/books" className="font-semibold text-deep underline underline-offset-4">
          All books
        </Link>{" "}
        / {book.category}
      </nav>

      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div
          className="mx-auto w-full max-w-md rounded-t-full rounded-b-[28px] px-[20%] pb-12 pt-[28%]"
          style={{ backgroundColor: categoryTint[book.category] }}
        >
          <BookCover src={book.image} title={book.title} author={book.author} sizes="(min-width:1024px) 340px, 70vw" priority />
        </div>

        <div>
          <p className="eyebrow">{book.category}</p>
          <h1 className="page-title mt-3 !text-[clamp(2.8rem,6vw,5rem)]">{book.title}</h1>
          <p className="mt-3 font-serif text-3xl italic text-forest">by {book.author}</p>

          <div className="mt-8 rounded-[20px] border border-line bg-paper p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={cn("flex items-center gap-2 text-lg font-semibold", state.text)}>
                <span aria-hidden className={cn("size-2.5 rounded-full", state.dot)} />
                {state.label}
              </p>
              <p className="text-sm text-muted">
                {book.availableCopies} of {book.totalCopies} on the shelf
              </p>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line" role="img" aria-label={`${pct}% of copies available`}>
              <div className={cn("h-full rounded-full", state.dot)} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-6">
              <BorrowButton book={book} user={{ name: user.name, email: user.email }} autoOpen={borrow === "1"} />
            </div>
          </div>

          <p className="mt-10 max-w-prose whitespace-pre-line text-lg leading-relaxed text-ink/90">{book.description}</p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 border-t border-deep/20">
            {facts.map(([k, v]) => (
              <div key={k} className="border-b border-deep/10 py-4">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="mt-0.5 truncate font-semibold text-deep">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28" aria-label={`More in ${book.category}`}>
          <h2 className="section-title">
            More in <em>{book.category}</em>
          </h2>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {related.map((b) => (
              <li key={b._id}>
                <BookCard book={b} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
