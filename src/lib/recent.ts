// Recently viewed books are stored per user (key includes the account id), in this browser only.
export interface RecentBook {
  id: string;
  title: string;
  author: string;
  image: string;
}
const PREFIX = "booknook:recent:";
const LEGACY_KEY = "booknook:recent"; // old shared key that leaked history between accounts
const MAX = 6;
export const RECENT_EMPTY = "[]";

const keyFor = (userId: string) => `${PREFIX}${userId}`;

function dropLegacy() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
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

export function readRecentRaw(userId: string | undefined): string {
  if (!userId) return RECENT_EMPTY; // logged out: never show anyone's history
  try {
    return localStorage.getItem(keyFor(userId)) ?? RECENT_EMPTY;
  } catch {
    return RECENT_EMPTY;
  }
}

export function recordRecent(userId: string, book: RecentBook) {
  try {
    dropLegacy();
    const current = parseRecent(localStorage.getItem(keyFor(userId)) ?? RECENT_EMPTY);
    const next = [book, ...current.filter((b) => b.id !== book.id)].slice(0, MAX);
    localStorage.setItem(keyFor(userId), JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode): ignore */
  }
}

export function subscribeRecent(cb: () => void) {
  dropLegacy();
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
