"use client";

import { BookX, CloudOff, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, getBooks, type BookList } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import { BookCard } from "./book-card";

const LIMIT = 12;
const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A to Z" },
] as const;

export function BooksExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = (params.get("sort") as "newest" | "oldest" | "title") || "newest";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [search, setSearch] = useState(q);
  const [result, setResult] = useState<{ key: string; data?: BookList; error?: string; last?: BookList } | null>(null);
  const [reload, setReload] = useState(0);
  const key = `${q}|${category}|${sort}|${page}|${reload}`;
  const loading = result?.key !== key;
  const data = result?.data ?? result?.last ?? null;
  const error = !loading ? (result?.error ?? null) : null;

  const update = useCallback(
    (next: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      if (!("page" in next)) sp.delete("page");
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  // Debounce typing into the URL.
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search.trim() || null }), 350);
    return () => clearTimeout(t);
  }, [search, q, update]);

  useEffect(() => {
    const ctrl = new AbortController();
    getBooks({ q: q || undefined, category: category || undefined, sort, page, limit: LIMIT }, ctrl.signal)
      .then((d) => setResult({ key, data: d }))
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setResult((prev) => ({
          key,
          error: e instanceof ApiError ? e.message : "Could not load books.",
          last: prev?.data ?? prev?.last,
        }));
      });
    return () => ctrl.abort();
  }, [key, q, category, sort, page]);

  const filtered = Boolean(q || category);
  const clear = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            aria-label="Search books by title or author"
            placeholder="Search by title or author"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Sort books"
          value={sort}
          onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
          className="h-11 rounded-control border border-line bg-paper px-3.5 text-sm font-medium text-ink"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        {["", ...CATEGORIES].map((c) => (
          <button
            key={c || "all"}
            type="button"
            aria-pressed={category === c}
            onClick={() => update({ category: c || null })}
            className={cn(
              "h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors",
              category === c ? "border-forest bg-forest text-cream" : "border-line bg-paper text-forest hover:border-forest/50",
            )}
          >
            {c || "All"}
          </button>
        ))}
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <X /> Clear filters
          </Button>
        )}
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {data && !loading ? `${data.pagination.total} ${data.pagination.total === 1 ? "book" : "books"}` : "\u00a0"}
      </p>

      {error ? (
        <State icon={<CloudOff className="size-9 text-forest" strokeWidth={1.5} />} title="The shelf could not be loaded" text={error}>
          <Button variant="outline" size="sm" onClick={() => setReload((n) => n + 1)}>
            Try again
          </Button>
        </State>
      ) : loading && !data ? (
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[27rem] rounded-[4px]" />
          ))}
        </Grid>
      ) : data && data.items.length === 0 ? (
        <State
          icon={<BookX className="size-9 text-forest" strokeWidth={1.5} />}
          title={filtered ? "No books match your search" : "No books on the shelf yet"}
          text={filtered ? "Try a different title, author or category." : "Add the first book to start the library."}
        >
          {filtered && (
            <Button variant="outline" size="sm" onClick={clear}>
              Clear filters
            </Button>
          )}
        </State>
      ) : (
        data && (
          <>
            <div className={cn("transition-opacity", loading && "opacity-50")} aria-busy={loading}>
              <Grid>
                {data.items.map((b) => (
                  <BookCard key={b._id} book={b} />
                ))}
              </Grid>
            </div>
            {data.pagination.totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                  Previous
                </Button>
                <span className="text-sm text-muted">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => update({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </nav>
            )}
          </>
        )
      )}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function State({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="mt-3 flex flex-col items-center rounded-[4px] border border-dashed border-forest/30 px-6 py-16 text-center">
      {icon}
      <h2 className="mt-4 font-serif text-2xl">{title}</h2>
      <p className="mt-2 max-w-md text-muted">{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
