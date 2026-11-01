import { BookPlus, CloudOff } from "lucide-react";
import Link from "next/link";
import { BookCard } from "@/components/books/book-card";
import { RetryButton } from "@/components/shared/retry-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getBooks } from "@/lib/api";

const GRID = "mt-12 grid auto-rows-fr grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16";

export function NewArrivalsSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading new arrivals">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[30rem] rounded-[20px]" />
      ))}
    </div>
  );
}

/** Latest six books from MongoDB (GET /books?sort=newest&limit=6): exactly two rows of three on desktop. */
export async function NewArrivalsList() {
  let books;
  try {
    ({ items: books } = await getBooks({ sort: "newest", limit: 6 }));
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Something went wrong while loading the shelf.";
    return (
      <div className="mt-12 flex flex-col items-center rounded-[20px] border border-dashed border-primary/30 px-6 py-16 text-center">
        <CloudOff className="size-9 text-primary" strokeWidth={1.5} />
        <h3 className="mt-4 font-display text-3xl">The shelf could not be loaded</h3>
        <p className="mt-2 max-w-md text-muted">{message}</p>
        <div className="mt-6">
          <RetryButton />
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center rounded-[20px] border border-dashed border-primary/30 px-6 py-16 text-center">
        <BookPlus className="size-9 text-primary" strokeWidth={1.5} />
        <h3 className="mt-4 font-display text-3xl">The shelf is empty for now</h3>
        <p className="mt-2 max-w-md text-muted">Be the first to add a book and start the library.</p>
        <Button asChild className="mt-6">
          <Link href="/add-book">Add a Book</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className={GRID}>
        {books.map((b) => (
          <li key={b._id}>
            <BookCard book={b} />
          </li>
        ))}
      </ul>
      <div className="mt-14 flex justify-center">
        <Button asChild size="lg">
          <Link href="/books">See All Books</Link>
        </Button>
      </div>
    </>
  );
}
