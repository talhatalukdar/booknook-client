import { Quote } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4.25rem)] max-w-[88rem] lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between bg-deep p-12 text-cream lg:flex">
        <Quote className="size-10 text-gold" strokeWidth={1.25} />
        <div>
          <p className="font-serif text-5xl leading-[1.08]">
            A book kept on a shelf is a book waiting for a reader.
          </p>
          <p className="mt-6 max-w-sm text-cream/70">
            Join BookNook to add the books you have finished, borrow the ones you have not, and keep the library moving.
          </p>
        </div>
        <p className="text-sm text-cream/50">BookNook, a small online library</p>
      </aside>
      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="section-title">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
