import { Quote } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: React.ReactNode; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4.25rem)] max-w-[88rem] gap-0 p-3 sm:p-5 lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden rounded-[28px] bg-forest p-12 text-cream lg:flex">
        <div aria-hidden className="absolute -bottom-24 -right-16 flex items-end gap-4 opacity-60">
          <span className="block h-72 w-32 rounded-t-full bg-deep" />
          <span className="block h-96 w-32 rounded-t-full bg-gold/30" />
          <span className="block h-60 w-32 rounded-t-full bg-deep" />
        </div>
        <Quote className="relative size-10 text-gold" strokeWidth={1.25} />
        <div className="relative">
          <p className="font-serif text-6xl leading-[1.02] text-cream">
            A book kept on a shelf is a book <em className="!text-gold">waiting</em> for a reader.
          </p>
          <p className="mt-6 max-w-sm text-cream/75">
            Join BookNook to add the books you have finished, borrow the ones you have not, and keep the library moving.
          </p>
        </div>
        <p className="relative text-sm text-cream/55">BookNook, a small online library</p>
      </aside>
      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="page-title">{title}</h1>
          <p className="mt-3 text-lg text-muted">{subtitle}</p>
          <div className="mt-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
