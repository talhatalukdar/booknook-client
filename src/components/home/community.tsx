import { HandHeart, LibraryBig, Repeat2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const points = [
  { icon: HandHeart, title: "Lend what you have finished", text: "A book on your own shelf helps nobody. Add it, set the number of copies and let someone else read it." },
  { icon: LibraryBig, title: "Know what is really there", text: "Availability comes straight from the library's records, so a book marked available can be borrowed." },
  { icon: Repeat2, title: "Pass it on", text: "Returns restore the copy at once. The next reader is never waiting on a book that is already back." },
];

export function Community() {
  return (
    <section className="bg-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-28">
        <div>
          <h2 className="section-title text-cream">A library is better when it is shared.</h2>
          <p className="mt-5 max-w-md text-lg text-cream/75">
            BookNook runs on readers who add, borrow and return. Bring a book, take a book, and keep the shelf moving.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" size="lg">
              <Link href="/add-book">Add a Book</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/books">Browse the shelf</Link>
            </Button>
          </div>
        </div>
        <ul className="divide-y divide-cream/15 border-y border-cream/15">
          {points.map((p) => (
            <li key={p.title} className="flex gap-5 py-7">
              <p.icon className="mt-1 size-7 shrink-0 text-gold" strokeWidth={1.4} />
              <div>
                <h3 className="font-serif text-[1.7rem] font-semibold text-cream">{p.title}</h3>
                <p className="mt-1.5 text-cream/70">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
