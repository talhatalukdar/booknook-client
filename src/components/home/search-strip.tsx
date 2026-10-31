"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/types";

/** Search by title/author with a category filter; hands off to the All Books page (Discover style). */
export function SearchStrip() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (category) sp.set("category", category);
    router.push(`/books${sp.size ? `?${sp}` : ""}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <form
        onSubmit={submit}
        role="search"
        className="flex flex-col gap-2 rounded-[28px] border border-line bg-paper p-2 shadow-[0_18px_40px_-24px_rgba(14,52,39,0.45)] sm:flex-row sm:items-center sm:rounded-full"
      >
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 rounded-full bg-sand px-5 text-sm font-semibold text-deep sm:w-52"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="relative flex-1">
          <span className="sr-only">Search by title or author</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[1.15rem] -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a book by title or author"
            className="h-12 w-full rounded-full bg-transparent pl-11 pr-4 text-base placeholder:text-muted/80 focus-visible:outline-2 focus-visible:outline-gold"
          />
        </label>
        <Button type="submit" size="lg" className="sm:px-9">
          Search
        </Button>
      </form>
    </div>
  );
}
