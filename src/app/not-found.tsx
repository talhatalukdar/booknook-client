import { BookX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center sm:px-8">
      <BookX className="size-14 text-forest" strokeWidth={1.2} />
      <h1 className="display mt-6">This page is not on the shelf.</h1>
      <p className="mt-5 max-w-md text-lg text-muted">
        The page you are looking for may have been moved, returned or never catalogued.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">Back to Home</Link>
      </Button>
    </section>
  );
}
