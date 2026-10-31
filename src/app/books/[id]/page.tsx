import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AvailabilityBadge } from "@/components/books/availability-badge";
import { BookCover } from "@/components/books/book-cover";
import { BorrowButton } from "@/components/books/borrow-button";
import { categoryTint } from "@/components/books/category-tint";
import { ApiError, getBook } from "@/lib/api";
import { getServerUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import type { Book } from "@/types";

type Props = { params: Promise<{ id: string }> };

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
  return { title: book ? `${book.title} | Book Details` : "Book Details" };
}

export default async function BookDetailsPage({ params }: Props) {
  const { id } = await params;
  // Page-level protection (the proxy also redirects when there is no session cookie at all).
  const user = await getServerUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(`/books/${id}`)}`);

  const book = await load(id);
  if (!book) notFound();

  const facts = [
    ["Total copies", String(book.totalCopies)],
    ["Available copies", String(book.availableCopies)],
    ["Added by", book.addedByName],
    ["Added on", formatDate(book.addedAt)],
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-20">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <Link href="/books" className="font-semibold text-forest underline underline-offset-4">
          All books
        </Link>{" "}
        / {book.title}
      </nav>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex items-center justify-center rounded-[4px] p-10 sm:p-14" style={{ backgroundColor: categoryTint[book.category] }}>
          <BookCover src={book.image} title={book.title} author={book.author} sizes="(min-width:1024px) 340px, 70vw" priority className="max-w-[20rem]" />
        </div>
        <div>
          <p className="font-semibold text-forest">{book.category}</p>
          <h1 className="display mt-2 !text-[clamp(2.4rem,5vw,4rem)]">{book.title}</h1>
          <p className="mt-3 text-xl text-muted">by {book.author}</p>
          <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} className="mt-6 text-base" />

          <p className="mt-8 max-w-prose whitespace-pre-line text-lg leading-relaxed">{book.description}</p>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-paper p-4">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="mt-0.5 truncate font-semibold text-deep">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10">
            <BorrowButton book={book} user={{ name: user.name, email: user.email }} />
          </div>
        </div>
      </div>
    </div>
  );
}
