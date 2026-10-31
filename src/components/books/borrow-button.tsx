"use client";

import { BookMarked, CalendarDays, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { ApiError, borrowBook, getBorrows } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Book } from "@/types";
import { BookCover } from "./book-cover";

// Days are counted in UTC so the date sent always matches the server's 1 to 30 day window.
const utcDate = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

export function BorrowButton({ book, user }: { book: Book; user: { name: string; email: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false);
  const [returnDate, setReturnDate] = useState(() => utcDate(7));
  const min = useMemo(() => utcDate(1), []);
  const max = useMemo(() => utcDate(30), []);

  // Real check against the user's own borrows (GET /borrows); the server enforces it again.
  useEffect(() => {
    getBorrows()
      .then((rows) => setAlreadyBorrowed(rows.some((b) => b.bookId === book._id && b.status === "active")))
      .catch(() => undefined);
  }, [book._id]);

  const soldOut = book.availableCopies <= 0;

  async function confirm() {
    if (returnDate < min || returnDate > max) {
      toast.error("Choose a return date between 1 and 30 days from today");
      return;
    }
    setBusy(true);
    try {
      await borrowBook(book._id, returnDate);
      toast.success(`You borrowed "${book.title}". Return it by ${formatDate(returnDate)}.`);
      setAlreadyBorrowed(true);
      setOpen(false);
      router.refresh(); // updates the available copies shown on the page
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        router.push(`/login?callbackUrl=${encodeURIComponent(`/books/${book._id}`)}`);
        return;
      }
      if (e instanceof ApiError && e.status === 409 && /already borrowed/i.test(e.message)) setAlreadyBorrowed(true);
      toast.error(e instanceof ApiError ? e.message : "Could not borrow this book");
      // 404 (book removed), 409 (stock changed or duplicate): reload the real availability.
      if (e instanceof ApiError && (e.status === 404 || e.status === 409)) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (soldOut || alreadyBorrowed) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        {alreadyBorrowed ? "You have borrowed this book" : "Not Available"}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <BookMarked className="!size-5" /> Borrow This Book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Borrow this book</DialogTitle>
        <DialogDescription>Confirm the details below. One copy leaves the shelf until you return it.</DialogDescription>

        <div className="mt-6 grid grid-cols-[6rem_1fr] gap-5">
          <BookCover src={book.image} title={book.title} author={book.author} sizes="96px" />
          <div className="min-w-0">
            <p className="font-serif text-2xl leading-tight text-deep">{book.title}</p>
            <p className="mt-1 text-muted">by {book.author}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="bn-name">Your name</Label>
            <Input id="bn-name" value={user.name} readOnly className="bg-line/50" />
          </div>
          <div>
            <Label htmlFor="bn-email">Your email</Label>
            <Input id="bn-email" value={user.email} readOnly className="bg-line/50" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bn-borrow">Borrow date</Label>
              <Input id="bn-borrow" value={formatDate(new Date())} readOnly className="bg-line/50" />
            </div>
            <div>
              <Label htmlFor="bn-return">Return date</Label>
              <Input id="bn-return" type="date" min={min} max={max} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays className="size-4" /> You can keep it for 1 to 30 days. Default is 7.
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" disabled={busy}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={confirm} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Borrowing" : "Confirm Borrow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
