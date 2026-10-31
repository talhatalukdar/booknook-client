import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types";
import { AvailabilityBadge } from "./availability-badge";
import { BookCover } from "./book-cover";
import { categoryTint } from "./category-tint";

/** Horizontal card used by New Arrivals (two columns on desktop). Fixed cover width = equal heights. */
export function BookRowCard({ book }: { book: Book }) {
  return (
    <article className="grid h-full grid-cols-[8.5rem_1fr] overflow-hidden rounded-[4px] border border-line bg-paper sm:grid-cols-[10.5rem_1fr]">
      <div
        className="flex items-center justify-center p-4 sm:p-5"
        style={{ backgroundColor: categoryTint[book.category] }}
      >
        <BookCover src={book.image} title={book.title} author={book.author} sizes="140px" />
      </div>
      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <p className="text-sm font-semibold text-forest">{book.category}</p>
        <h3 className="mt-1 line-clamp-2 font-serif text-[1.65rem] font-semibold leading-[1.1] text-deep">
          {book.title}
        </h3>
        <p className="mt-1.5 truncate text-muted">by {book.author}</p>
        <AvailabilityBadge available={book.availableCopies} className="mt-4" />
        <div className="mt-auto pt-5">
          <Button asChild variant="outline" size="sm">
            <Link href={`/books/${book._id}`} aria-label={`View details for ${book.title}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
