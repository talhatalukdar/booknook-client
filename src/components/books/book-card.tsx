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
        className="relative block rounded-t-full rounded-b-[20px] px-[18%] pb-7 pt-[22%] transition-colors duration-300"
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
        {unavailable && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-deep px-3 py-1 text-xs font-semibold text-cream">
            Currently unavailable
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <p className="text-sm font-semibold text-amber">{book.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.1em] font-serif text-[1.65rem] leading-[1.05] text-deep sm:text-[1.9rem]">
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
