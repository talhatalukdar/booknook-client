// Recently viewed books: stored per browser only (localStorage), never sent anywhere.
export interface RecentBook {
  id: string;
  title: string;
  author: string;
  image: string;
}
const KEY = "booknook:recent";
const MAX = 6;

export function readRecent(): RecentBook[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((b) => b && typeof b.id === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function recordRecent(book: RecentBook) {
  try {
    const next = [book, ...readRecent().filter((b) => b.id !== book.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode): ignore */
  }
}

export const RECENT_EMPTY = "[]";
export function readRecentRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? RECENT_EMPTY;
  } catch {
    return RECENT_EMPTY;
  }
}
export function parseRecent(raw: string): RecentBook[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((b) => b && typeof b.id === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}
export function subscribeRecent(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
