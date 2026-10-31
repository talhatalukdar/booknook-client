import { authClient } from "@/lib/auth-client";
import type { ApiEnvelope, Book, BookInput, Borrow, Pagination } from "@/types";

/**
 * Typed client for the Express API (booknook-server). Only the 8 documented endpoints exist:
 *   GET /books, GET /books/:id, POST /books, PATCH /books/:id, DELETE /books/:id,
 *   POST /borrows, GET /borrows, DELETE /borrows/:id
 */
function apiBase() {
  const url = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (url) return url;
  if (process.env.NODE_ENV !== "production") return "http://localhost:5000";
  throw new ApiError(500, "NEXT_PUBLIC_API_URL is not configured");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---- JWT handling: kept in memory only (never localStorage), refreshed before expiry. ----
let cached: { token: string; expMs: number } | null = null;

function tokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 5 * 60_000;
  } catch {
    return Date.now() + 5 * 60_000;
  }
}

export async function getJwt(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cached && cached.expMs - Date.now() > 60_000) return cached.token;
  const { data, error } = await authClient.token();
  if (error || !data?.token) {
    cached = null;
    throw new ApiError(401, "Your session has expired. Please log in again.");
  }
  cached = { token: data.token, expMs: tokenExpiry(data.token) };
  return data.token;
}

export function clearJwt() {
  cached = null;
}

// ---- request core ------------------------------------------------------------------------
interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, signal } = opts;

  const send = async (forceRefresh: boolean) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) headers.Authorization = `Bearer ${await getJwt(forceRefresh)}`;
    try {
      return await fetch(`${apiBase()}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
        signal,
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") throw e;
      throw new ApiError(0, "Cannot reach the library server. Check your connection and try again.");
    }
  };

  let res = await send(false);
  if (res.status === 401 && auth) res = await send(true); // token may have just expired

  const json = (await res.json().catch(() => null)) as (ApiEnvelope<T> & { message: string }) | null;
  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`);
  }
  return json.data;
}

// ---- books ---------------------------------------------------------------------------------
export interface BookQuery {
  q?: string;
  category?: string;
  sort?: "newest" | "oldest" | "title";
  page?: number;
  limit?: number;
  mine?: boolean;
}

export interface BookList {
  items: Book[];
  pagination: Pagination;
}

export function getBooks(query: BookQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.mine) params.set("mine", "true");
  const qs = params.toString();
  return request<BookList>(`/books${qs ? `?${qs}` : ""}`, { auth: query.mine, signal });
}

export const getBook = (id: string) => request<Book>(`/books/${encodeURIComponent(id)}`);
export const createBook = (input: BookInput) =>
  request<Book>("/books", { method: "POST", body: input, auth: true });
export const updateBook = (id: string, input: Partial<BookInput>) =>
  request<Book>(`/books/${encodeURIComponent(id)}`, { method: "PATCH", body: input, auth: true });
export const deleteBook = (id: string) =>
  request<null>(`/books/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });

// ---- borrows -------------------------------------------------------------------------------
export const borrowBook = (bookId: string, returnDate: string) =>
  request<{ borrow: Borrow; availableCopies: number }>("/borrows", {
    method: "POST",
    body: { bookId, returnDate },
    auth: true,
  });
export const getBorrows = () => request<Borrow[]>("/borrows", { auth: true });
export const returnBorrow = (id: string) =>
  request<{ borrow: Borrow; availableCopies: number | null }>(`/borrows/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
