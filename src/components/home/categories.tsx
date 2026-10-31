import { Feather, FlaskConical, Landmark, Library, Shapes, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { categoryTint } from "@/components/books/category-tint";
import type { Category } from "@/types";
import { SectionHeading } from "./new-arrivals";

const categories: { name: Category; icon: LucideIcon; text: string }[] = [
  { name: "Fiction", icon: Feather, text: "Novels, stories and made-up worlds." },
  { name: "Science", icon: FlaskConical, text: "How the world works, explained well." },
  { name: "History", icon: Landmark, text: "People, places and the past." },
  { name: "Kids", icon: Shapes, text: "Picture books and first chapters." },
  { name: "Others", icon: Library, text: "Everything that refuses a label." },
];

export function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
      <SectionHeading title="Explore categories" text="Start from a subject and see what readers have shelved under it." />
      <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <li key={c.name} className="first:col-span-2 first:md:col-span-1 first:lg:col-span-1">
            <Link
              href={`/books?category=${c.name}`}
              style={{ backgroundColor: categoryTint[c.name] }}
              className="group flex h-full min-h-60 flex-col justify-between rounded-[4px] p-6 transition-shadow hover:shadow-[0_14px_30px_-16px_rgba(16,55,43,0.6)]"
            >
              <c.icon className="size-9 text-forest" strokeWidth={1.25} />
              <div>
                <h3 className="font-serif text-[2rem] font-semibold">{c.name}</h3>
                <p className="mt-1 min-h-[2.8rem] text-sm text-ink/75">{c.text}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
