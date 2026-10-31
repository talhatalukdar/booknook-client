import { cache } from "react";
import { getBooks } from "@/lib/api";
import { CATEGORIES, type Book, type Category } from "@/types";

export interface HomeData {
  newest: Book[]; // latest nine, used for the hero covers
  total: number;
  categories: { name: Category; total: number; covers: Book[] }[];
}

/** One shared, request-scoped fetch for the hero and the stats (all real data from the API). */
export const getHomeData = cache(async (): Promise<HomeData | null> => {
  try {
    const [all, ...cats] = await Promise.all([
      getBooks({ sort: "newest", limit: 9 }),
      ...CATEGORIES.map((name) => getBooks({ category: name, sort: "newest", limit: 3 })),
    ]);
    return {
      newest: all.items,
      total: all.pagination.total,
      categories: CATEGORIES.map((name, i) => ({ name, total: cats[i]!.pagination.total, covers: cats[i]!.items })),
    };
  } catch {
    return null;
  }
});
