import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const points = [
  { title: "Lend what you have finished", text: "A book on your own shelf helps nobody. Add it, set the number of copies and let someone else read it." },
  { title: "Know what is really there", text: "Availability comes straight from the library's records, so a book marked available can be borrowed." },
  { title: "Pass it on", text: "Returns restore the copy at once. The next reader is never waiting on a book that is already back." },
];

export function Community() {
  return (
    <section className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-[88rem] overflow-hidden rounded-3xl surface-night text-canvas">
        <div className="grid gap-12 px-6 py-20 sm:px-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-28">
          <div>
            <p className="eyebrow !text-teal">Reading community</p>
            <h2 className="section-title mt-3 text-canvas">
              A library is better when it is <em className="!text-teal">shared</em>.
            </h2>
            <p className="mt-5 max-w-md text-lg text-canvas/75">
              BookNook runs on readers who add, borrow and return. Bring a book, take a book, keep the shelf moving.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="teal" size="lg">
                <Link href="/add-book">
                  Add a Book <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link href="/books">Browse the shelf</Link>
              </Button>
            </div>
          </div>
          <ul className="divide-y divide-canvas/15 border-y border-canvas/15">
            {points.map((p) => (
              <li key={p.title} className="py-6">
                <h3 className="font-display text-3xl text-canvas">{p.title}</h3>
                <p className="mt-1.5 text-canvas/70">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
