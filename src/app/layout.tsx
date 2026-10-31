import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getServerUser } from "@/lib/session";
import "./globals.css";

// Self-hosted (from @fontsource) so builds never depend on reaching Google Fonts.
// Instrument Serif: display headings and book titles. Instrument Sans: interface and body text.
const serif = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif-src",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});
const sans = localFont({
  src: "../fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700",
  variable: "--font-sans-src",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "BookNook | Home", template: "BookNook | %s" },
  description:
    "BookNook is a small online library. Browse the shelf, borrow a book for a few days and return it when you are done.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-control focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-deep"
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
