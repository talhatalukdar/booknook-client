import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getServerUser } from "@/lib/session";
import "./globals.css";

// Khand (headings) is self-hosted from @fontsource. General Sans (UI and body) is loaded by an
// @font-face in globals.css from public/fonts, see public/fonts/README.md.
const display = localFont({
  src: [
    { path: "../fonts/khand-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/khand-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-khand",
  display: "swap",
  fallback: ["Arial Narrow", "Impact", "sans-serif"],
});

export const metadata: Metadata = {
  // Absolute base for the Open Graph / Twitter image URLs (the production site URL).
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  title: { default: "BookNook | Home", template: "BookNook | %s" },
  description:
    "BookNook is a small online library. Browse the shelf, borrow a book for a few days and return it when you are done.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  return (
    <html lang="en" className={display.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-control focus:bg-teal focus:px-4 focus:py-2 focus:font-semibold focus:text-night"
        >
          Skip to content
        </a>
        <Navbar initialUser={user} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
