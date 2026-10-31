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
    <footer className="bg-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-cream/70">
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
                  className="grid size-10 place-items-center rounded-full border border-cream/25 text-cream/80 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="size-[1.15rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-serif text-3xl text-cream">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-cream/70 transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-serif text-3xl text-cream">Contact</h2>
          <ul className="mt-4 space-y-3 text-cream/70">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-gold" />
              <a href="mailto:hello@booknook.example" className="hover:text-gold">
                hello@booknook.example
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-gold" />
              Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-sm text-cream/60 sm:px-8">
          © {new Date().getFullYear()} BookNook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
