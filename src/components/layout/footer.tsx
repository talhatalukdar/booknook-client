import { Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from "@/components/shared/social-icons";

const explore = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
  { href: "/add-book", label: "Add a Book" },
  { href: "/my-borrows", label: "My Borrows" },
];
const socials = [
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: LinkedInIcon },
  { href: "https://x.com", label: "X", Icon: XIcon },
];

export function Footer() {
  return (
    <footer className="surface-night text-canvas">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-5 text-canvas/70">
            A small online library where readers shelve the books they love and lend them to the
            next person.
          </p>
          <ul className="mt-6 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`BookNook on ${label}`}
                  className="grid size-10 place-items-center rounded-lg border border-canvas/20 text-canvas/75 transition-colors hover:border-teal hover:bg-teal/10 hover:text-teal"
                >
                  <Icon className="size-[1.15rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-3xl font-semibold text-canvas">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-canvas/70 transition-colors hover:text-teal">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-3xl font-semibold text-canvas">Contact</h2>
          <ul className="mt-4 space-y-3 text-canvas/70">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-teal" />
              <a href="mailto:hello@booknook.example" className="hover:text-teal">
                hello@booknook.example
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-teal" />
              Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-canvas/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-sm text-canvas/60 sm:px-8">
          © {new Date().getFullYear()} BookNook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
