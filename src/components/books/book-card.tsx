import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";
import { AvailabilityBadge } from "./availability-badge";
import { BookCover } from "./book-cover";
import { categoryTint } from "./category-tint";

/** Vertical grid card for All Books: equal height, same cover ratio everywhere. */
export function BookCard({ book }: { book: Book }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[4px] border border-line bg-paper">
      <div className="flex justify-center px-10 py-8" style={{ backgroundColor: categoryTint[book.category] }}>
        <BookCover src={book.image} title={book.title} author={book.author} sizes="200px" className="max-w-[10.5rem]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-forest">{book.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.4em] font-serif text-[1.65rem] font-semibold leading-[1.1]">{book.title}</h3>
        <p className="mt-1.5 truncate text-muted">by {book.author}</p>
        <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} className="mt-3" />
        <Button asChild variant="outline" className="mt-auto w-full" size="md">
          <Link href={`/books/${book._id}`} aria-label={`View details for ${book.title}`} className="mt-5">
            View Details
          </Link>
        </Button>
      </div>
    </article>
  );
}
