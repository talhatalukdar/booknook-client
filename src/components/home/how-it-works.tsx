import { BookMarked, BookOpen, Search, Undo2 } from "lucide-react";
import { SectionHeading } from "./new-arrivals";

const steps = [
  { icon: Search, title: "Discover", text: "Search the shelf or filter by category to find something worth reading." },
  { icon: BookMarked, title: "Borrow", text: "Pick a return date up to thirty days away. One copy leaves the shelf, instantly." },
  { icon: BookOpen, title: "Read", text: "Keep it for as long as you chose. Overdue loans are flagged on your borrows page." },
  { icon: Undo2, title: "Return", text: "Hand it back in one click and the copy goes straight back on the shelf." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionHeading title="How BookNook works" text="Four steps from finding a book to giving it back." />
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute left-14 right-[-1rem] top-6 hidden border-t border-dashed border-forest/30 lg:block" />
              )}
              <div className="relative flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-forest text-cream">
                  <s.icon className="size-5" />
                </span>
                <span className="font-serif text-2xl font-semibold text-gold">{i + 1}</span>
              </div>
              <h3 className="mt-5 font-serif text-3xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
