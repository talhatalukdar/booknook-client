"use client";

import { useEffect } from "react";
import { recordRecent, type RecentBook } from "@/lib/recent";

export function RecordView({ book, userId }: { book: RecentBook; userId: string }) {
  useEffect(() => {
    recordRecent(userId, book);
  }, [book, userId]);
  return null;
}
