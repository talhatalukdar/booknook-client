import type { Metadata } from "next";
import { MyBorrowsList } from "@/components/borrows/my-borrows-list";

export const metadata: Metadata = { title: "My Borrows" };

export default function MyBorrowsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
      <h1 className="page-title">My <em>borrows</em></h1>
      <p className="mt-3 max-w-xl text-lg text-muted">Everything you have borrowed, with return dates and your history.</p>
      <div className="mt-10">
        <MyBorrowsList />
      </div>
    </div>
  );
}
