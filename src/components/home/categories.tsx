import { Feather, FlaskConical, Landmark, Library, Shapes, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { categoryTint } from "@/components/books/category-tint";
import type { Book, Category } from "@/types";
import { SectionHeading } from "./section-heading";

const meta: Record<Category, { icon: LucideIcon; text: string }> = {
  Fiction: { icon: Feather, text: "Novels, stories and invented worlds" },
  Science: { icon: FlaskConical, text: "How the world works, explained well" },
  History: { icon: Landmark, text: "People, places and the past" },
  Kids: { icon: Shapes, text: "Picture books and first chapters" },
  Others: { icon: Library, text: "Everything that refuses a label" },
};

/** Real counts and real covers per category (from the shared home data). */
export function Categories({ data }: { data: { name: Category; total: number | null; covers: Book[] }[] }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionHeading eyebrow="Browse by category" title={<>Start from a <em>subject</em>.</>} text="Every category shows how many titles are on the shelf right now." />
      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-5">
        {data.map((c, i) => {
          const Icon = meta[c.name].icon;
          return (
            <li key={c.name} className={i === 0 ? "col-span-2 md:col-span-2 lg:col-span-1" : i < 3 ? "md:col-span-2 lg:col-span-1" : "md:col-span-3 lg:col-span-1"}>
              <Link
                href={`/books?category=${c.name}`}
                style={{ backgroundColor: categoryTint[c.name] }}
                className="group relative flex h-full min-h-72 flex-col justify-between overflow-hidden rounded-[20px] p-6 transition-shadow duration-300 hover:shadow-[0_24px_40px_-24px_rgba(14,52,39,0.6)]"
              >
                <div className="flex items-start justify-between">
                  <Icon className="size-7 text-forest" strokeWidth={1.3} />
                  {c.total !== null && (
                    <span className="rounded-full bg-paper/80 px-3 py-1 text-sm font-semibold text-deep">
                      {c.total} {c.total === 1 ? "title" : "titles"}
                    </span>
                  )}
                </div>
                <div className="relative mx-auto my-4 flex h-28 w-full max-w-[9rem] items-end justify-center" aria-hidden>
                  {c.covers.slice(0, 3).map((b, k, arr) => (
                    <div
                      key={b._id}
                      className="absolute bottom-0 w-[44%] transition-transform duration-500 group-hover:-translate-y-2"
                      style={{ left: `${(k - (arr.length - 1) / 2) * 26 + 28}%`, transform: `rotate(${(k - (arr.length - 1) / 2) * 7}deg)`, zIndex: k === 1 ? 2 : 1 }}
                    >
                      <BookCover src={b.image} title={b.title} author={b.author} sizes="80px" />
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-serif text-4xl leading-none">{c.name}</h3>
                  <p className="mt-2 text-sm text-ink/70">{meta[c.name].text}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
