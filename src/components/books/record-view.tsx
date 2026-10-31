"use client";

import { useEffect } from "react";
import { recordRecent, type RecentBook } from "@/lib/recent";

export function RecordView({ book }: { book: RecentBook }) {
  useEffect(() => {
    recordRecent(book);
  }, [book]);
  return null;
}
