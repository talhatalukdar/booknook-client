import { BookMarked, BookOpen, Search, Undo2 } from "lucide-react";
import { SectionHeading } from "./section-heading";

const steps = [
  { icon: Search, title: "Discover", text: "Search the shelf or filter by category to find something worth reading." },
  { icon: BookMarked, title: "Borrow", text: "Pick a return date up to thirty days away. One copy leaves the shelf instantly." },
  { icon: BookOpen, title: "Read", text: "Keep it as long as you chose. Overdue loans are flagged on your borrows page." },
  { icon: Undo2, title: "Return", text: "Hand it back in one click and the copy goes straight back on the shelf." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionHeading eyebrow="How BookNook works" title={<>Four steps, no <em>fuss</em>.</>} text="From finding a book to giving it back." />
      <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="border-t border-deep/25 pt-6">
            <div className="flex items-start justify-between">
              <span className="font-serif text-7xl leading-none text-gold">{i + 1}</span>
              <s.icon className="size-6 text-forest" strokeWidth={1.4} />
            </div>
            <h3 className="mt-6 font-serif text-4xl">{s.title}</h3>
            <p className="mt-2 text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
