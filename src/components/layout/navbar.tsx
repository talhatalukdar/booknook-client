"use client";

import { LogOut, Menu, Search, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/shared/avatar";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { clearJwt } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
];
const privateLinks = [
  { href: "/add-book", label: "Add Book" },
  { href: "/my-books", label: "My Books" },
  { href: "/my-borrows", label: "My Borrows" },
];

export function Navbar({ initialUser }: { initialUser: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);

  // While the client session loads, trust the server-rendered user so the nav never flashes.
  const user = isPending
    ? initialUser
    : data?.user
      ? { id: data.user.id, name: data.user.name, email: data.user.email, image: data.user.image ?? null }
      : null;

  const links = user ? [...publicLinks, ...privateLinks] : publicLinks;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  async function logout() {
    await authClient.signOut();
    clearJwt();
    setOpen(false);
    toast.success("You have been logged out");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 text-ink backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative rounded-lg px-3.5 py-2 text-[0.95rem] font-medium text-ink/65 transition-colors hover:bg-night/5 hover:text-night",
                isActive(l.href) &&
                  "text-night after:absolute after:inset-x-3.5 after:-bottom-[1.1rem] after:h-0.5 after:rounded-full after:bg-night",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/books"
            aria-label="Search books"
            className="grid size-10 place-items-center rounded-lg text-ink/70 transition-colors hover:bg-night/5 hover:text-night"
          >
            <Search className="size-5" />
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="cursor-pointer rounded-full"
                aria-label={`Account menu for ${user.name}`}
              >
                <Avatar name={user.name} src={user.image} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  <p className="truncate font-semibold text-night">{user.name}</p>
                  <p className="truncate text-xs font-normal text-muted">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>
                  <LogOut /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm" className="text-night">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-night hover:bg-night/5 lg:hidden" aria-label="Open menu">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="mb-8 flex items-center justify-between">
                <SheetTitle className="font-display text-3xl">Menu</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="text-canvas hover:bg-canvas/10" aria-label="Close menu">
                    <X className="size-5" />
                  </Button>
                </SheetClose>
              </div>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
              <nav aria-label="Mobile" className="flex flex-col">
                {links.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={cn(
                        "border-b border-canvas/10 py-3.5 font-display text-4xl font-semibold text-canvas/85",
                        isActive(l.href) && "text-teal",
                      )}
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              {!user && (
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <SheetClose asChild>
                    <Button asChild variant="outline-light">
                      <Link href="/login">Login</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild variant="teal">
                      <Link href="/register">Register</Link>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
