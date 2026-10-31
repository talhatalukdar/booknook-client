import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getServerUser } from "@/lib/session";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

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
