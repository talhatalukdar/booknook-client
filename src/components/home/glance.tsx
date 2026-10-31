import { formatDate } from "@/lib/utils";
import type { HomeData } from "@/lib/home-data";
import { SectionHeading } from "./section-heading";

/** Library at a glance: every number is computed from the live database via the API. */
export function Glance({ data }: { data: HomeData }) {
  const stocked = data.categories.filter((c) => c.total > 0).length;
  const latest = data.newest[0];
  const stats = [
    { value: String(data.total), label: data.total === 1 ? "title on the shelf" : "titles on the shelf" },
    { value: `${stocked} of ${data.categories.length}`, label: "categories with books" },
    ...(latest ? [{ value: formatDate(latest.addedAt), label: `latest addition: ${latest.title}` }] : []),
  ];
  return (
    <section className="bg-deep text-cream">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionHeading light eyebrow="The library at a glance" title={<>What is on the <em>shelf</em> today.</>} />
        <dl className="mt-14 grid gap-px overflow-hidden rounded-[20px] bg-cream/15 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-deep p-8">
              <dd className="font-serif text-5xl leading-none sm:text-6xl">{s.value}</dd>
              <dt className="mt-3 text-cream/70">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
