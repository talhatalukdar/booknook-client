"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Library } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { BookCover } from "@/components/books/book-cover";
import { categoryTint } from "@/components/books/category-tint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";
import { ShelfArt } from "./shelf-art";

const slides: { title: React.ReactNode; text: string }[] = [
  {
    title: (
      <>
        Find your next <em>book</em>, borrow it, bring it back.
      </>
    ),
    text: "BookNook is a small online library. Browse what other readers have shelved, borrow a copy for a few days and return it when you are done.",
  },
  {
    title: (
      <>
        Every book here was shelved by a <em>reader</em>.
      </>
    ),
    text: "Add the books you have finished with and see exactly how many copies are on the shelf before you borrow one.",
  },
  {
    title: (
      <>
        Borrow today. Return when you are <em>ready</em>.
      </>
    ),
    text: "Pick a return date anywhere from one to thirty days away. Every copy is counted, so availability is always the real number.",
  },
];

/** Three arch-shaped panels with real covers from the database (Paper Haven style). */
function ArchTrio({ books }: { books: Book[] }) {
  return (
    <div className="mx-auto grid w-full max-w-xl grid-cols-3 items-end gap-3 sm:gap-5" aria-label="Recently added books">
      {books.map((b, i) => (
        <Link
          key={b._id}
          href={`/books/${b._id}`}
          aria-label={`${b.title} by ${b.author}`}
          className={cn(
            "group relative block rounded-t-full rounded-b-[18px] px-[16%] pb-6 pt-[34%] transition-transform duration-500 hover:-translate-y-2",
            i === 1 ? "sm:-translate-y-6 sm:hover:-translate-y-8" : "",
          )}
          style={{ backgroundColor: categoryTint[b.category] }}
        >
          <BookCover src={b.image} title={b.title} author={b.author} sizes="160px" priority={i === 0} />
        </Link>
      ))}
    </div>
  );
}

export function HeroSlider({ slideBooks }: { slideBooks: Book[][] }) {
  const reduce = useReducedMotion();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  return (
    <section aria-label="Welcome to BookNook" className="relative overflow-hidden">
      <div aria-hidden className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-sand" />
      <h1 className="sr-only">BookNook, a small online library</h1>
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-8 lg:pt-16">
        <Swiper
          className="hero-swiper"
          modules={[A11y, Autoplay, EffectFade, Keyboard, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={800}
          loop
          keyboard
          autoplay={reduce ? false : { delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ el: ".hero-pagination", clickable: true }}
          onSwiper={setSwiper}
          a11y={{ prevSlideMessage: "Previous slide", nextSlideMessage: "Next slide" }}
        >
          {slides.map((s, i) => {
            const books = slideBooks[i] ?? [];
            return (
              <SwiperSlide key={i}>
                <div className="grid items-center gap-10 lg:min-h-[32rem] lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
                  <div>
                    <h2 className="display max-w-[14ch] sm:max-w-[16ch]">{s.title}</h2>
                    <p className="mt-6 max-w-lg text-lg text-muted">{s.text}</p>
                    <div className="mt-9 flex flex-wrap gap-3">
                      <Button asChild size="lg">
                        <Link href="/books">
                          <Library className="!size-5" /> Browse Books
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                        <Link href="#how-it-works">
                          How it works <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  {books.length === 3 ? (
                    <ArchTrio books={books} />
                  ) : (
                    <ShelfArt variant={i} className="mx-auto h-auto max-h-72 w-full max-w-lg lg:max-h-none" />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="hero-pagination flex gap-2" />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Previous slide" onClick={() => swiper?.slidePrev()}>
              <ChevronLeft className="size-5" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Next slide" onClick={() => swiper?.slideNext()}>
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
