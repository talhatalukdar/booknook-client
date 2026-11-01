import { BookMarked } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";
import { AvailabilityBadge } from "./availability-badge";
import { BookCover } from "./book-cover";
import { categoryTint } from "./category-tint";

/**
 * The one book card used everywhere (home, All Books, related books).
 * Arch-shaped tinted panel + floating cover (Paper Haven), serif title, availability and actions.
 * Unavailable books get a disabled "Not Available" control instead of Borrow; the Express API
 * still enforces stock on every borrow request.
 */
export function BookCard({ book }: { book: Book }) {
  const unavailable = book.availableCopies <= 0;
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/books/${book._id}`}
        tabIndex={-1}
        aria-hidden
        className="relative block rounded-t-full rounded-b-2xl px-[18%] pb-7 pt-[22%] transition-[box-shadow,filter] duration-300 group-hover:shadow-[0_26px_44px_-26px_rgba(26,28,27,0.55)] group-hover:brightness-[1.02]"
        style={{ backgroundColor: categoryTint[book.category] }}
      >
        <div
          className={cn(
            "transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-1",
            unavailable && "opacity-70 saturate-[0.35]",
          )}
        >
          <BookCover src={book.image} title={book.title} author={book.author} sizes="(min-width:1024px) 220px, 40vw" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <span className="inline-flex w-fit items-center rounded-md bg-mist px-2.5 py-1 text-xs font-medium tracking-wide text-brand">{book.category}</span>
        <h3 className="mt-3 line-clamp-2 min-h-[2.1em] font-display text-[1.7rem] font-bold leading-[1.02] text-night sm:text-[1.95rem]">
          {book.title}
        </h3>
        <p className="mt-1.5 truncate text-muted">{book.author}</p>
        <AvailabilityBadge available={book.availableCopies} className="mt-3" />
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button asChild variant="outline" size="sm">
            <Link href={`/books/${book._id}`} aria-label={`View details for ${book.title}`}>
              View Details
            </Link>
          </Button>
          {unavailable ? (
            <Button size="sm" variant="outline" disabled aria-disabled className="border-line bg-line/60 text-muted">
              Not Available
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href={`/books/${book._id}?borrow=1`} aria-label={`Borrow ${book.title}`}>
                <BookMarked /> Borrow
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
