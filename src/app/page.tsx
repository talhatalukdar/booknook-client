import { Suspense } from "react";
import { Categories } from "@/components/home/categories";
import { Community } from "@/components/home/community";
import { HeroSlider } from "@/components/home/hero-slider";
import { HowItWorks } from "@/components/home/how-it-works";
import { NewArrivalsList, NewArrivalsSkeleton, SectionHeading } from "@/components/home/new-arrivals";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionHeading
          title="New arrivals"
          text="The six books most recently added to the shelf, straight from the library."
        />
        <Suspense fallback={<NewArrivalsSkeleton />}>
          <NewArrivalsList />
        </Suspense>
      </section>
      <HowItWorks />
      <Categories />
      <Community />
    </>
  );
}
