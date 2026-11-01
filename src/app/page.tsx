import { Suspense } from "react";
import { Categories } from "@/components/home/categories";
import { Community } from "@/components/home/community";
import { Glance } from "@/components/home/glance";
import { HeroSlider } from "@/components/home/hero-slider";
import { HowItWorks } from "@/components/home/how-it-works";
import { NewArrivalsList, NewArrivalsSkeleton } from "@/components/home/new-arrivals";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { SearchStrip } from "@/components/home/search-strip";
import { SectionHeading } from "@/components/home/section-heading";
import { getHomeData } from "@/lib/home-data";
import { getServerUser } from "@/lib/session";

export default async function HomePage() {
  const [data, user] = await Promise.all([getHomeData(), getServerUser()]);
  // Three hero slides, three real covers each (falls back to the illustration without enough books).
  const slideBooks = [0, 1, 2].map((i) => data?.newest.slice(i * 3, i * 3 + 3) ?? []);

  // Homepage sections are independent modules: add, remove or reorder them here.
  return (
    <>
      <HeroSlider slideBooks={slideBooks} />
      <SearchStrip />

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeading
          eyebrow="New arrivals"
          title={<>Fresh on the <em>shelf</em>.</>}
          text="The six books most recently added to the library, straight from the database."
        />
        <Suspense fallback={<NewArrivalsSkeleton />}>
          <NewArrivalsList />
        </Suspense>
      </section>

      {data && <Categories data={data.categories} />}
      {data && <Glance data={data} />}
      <RecentlyViewed userId={user?.id} />
      <HowItWorks />
      <Community />
    </>
  );
}
