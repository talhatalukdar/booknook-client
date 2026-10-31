"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { BookCover } from "@/components/books/book-cover";
import { parseRecent, RECENT_EMPTY, readRecentRaw, subscribeRecent } from "@/lib/recent";
import { SectionHeading } from "./section-heading";

/** Books this browser opened recently. Hidden until there is something to show. */
export function RecentlyViewed() {
  const raw = useSyncExternalStore(subscribeRecent, readRecentRaw, () => RECENT_EMPTY);
  const items = useMemo(() => parseRecent(raw), [raw]);
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <SectionHeading eyebrow="Pick up where you left off" title={<>Recently <em>viewed</em></>} />
      <ul className="mt-10 grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-6">
        {items.map((b) => (
          <li key={b.id}>
            <Link href={`/books/${b.id}`} className="group block">
              <div className="transition-transform duration-300 group-hover:-translate-y-1.5">
                <BookCover src={b.image} title={b.title} author={b.author} sizes="160px" />
              </div>
              <p className="mt-3 line-clamp-2 font-serif text-xl leading-tight text-deep">{b.title}</p>
              <p className="truncate text-sm text-muted">{b.author}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
