import { BookPlus, CloudOff } from "lucide-react";
import Link from "next/link";
import { BookRowCard } from "@/components/books/book-row-card";
import { RetryButton } from "@/components/shared/retry-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getBooks } from "@/lib/api";

export function SectionHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="section-title">{title}</h2>
      {text && <p className="mt-3 text-lg text-muted">{text}</p>}
    </div>
  );
}

export function NewArrivalsSkeleton() {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2" aria-busy="true" aria-label="Loading new arrivals">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-60 rounded-[4px]" />
      ))}
    </div>
  );
}

/** Latest six books straight from MongoDB via GET /books?sort=newest&limit=6. */
export async function NewArrivalsList() {
  let books;
  try {
    ({ items: books } = await getBooks({ sort: "newest", limit: 6 }));
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "Something went wrong while loading the shelf.";
    return (
      <div className="mt-10 flex flex-col items-center rounded-[4px] border border-dashed border-forest/30 px-6 py-14 text-center">
        <CloudOff className="size-9 text-forest" strokeWidth={1.5} />
        <h3 className="mt-4 font-serif text-2xl font-semibold">The shelf could not be loaded</h3>
        <p className="mt-2 max-w-md text-muted">{message}</p>
        <div className="mt-6">
          <RetryButton />
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-[4px] border border-dashed border-forest/30 px-6 py-14 text-center">
        <BookPlus className="size-9 text-forest" strokeWidth={1.5} />
        <h3 className="mt-4 font-serif text-2xl font-semibold">The shelf is empty for now</h3>
        <p className="mt-2 max-w-md text-muted">Be the first to add a book and start the library.</p>
        <Button asChild className="mt-6">
          <Link href="/add-book">Add a Book</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="mt-10 grid auto-rows-fr gap-5 md:grid-cols-2">
        {books.map((b) => (
          <li key={b._id}>
            <BookRowCard book={b} />
          </li>
        ))}
      </ul>
      <div className="mt-10 flex justify-center">
        <Button asChild size="lg">
          <Link href="/books">See All Books</Link>
        </Button>
      </div>
    </>
  );
}
