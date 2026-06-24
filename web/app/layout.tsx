import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import "./globals.css";

// Body / UI - clean and readable
const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

// Display / headlines - geometric and confident
const nexa = localFont({
  src: [
    { path: "../public/fonts/nexa/NexaLight.otf",   weight: "300", style: "normal" },
    { path: "../public/fonts/nexa/NexaBook.otf",    weight: "400", style: "normal" },
    { path: "../public/fonts/nexa/NexaRegular.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/nexa/NexaBold.otf",    weight: "700", style: "normal" },
    { path: "../public/fonts/nexa/NexaHeavy.otf",   weight: "800", style: "normal" },
    { path: "../public/fonts/nexa/NexaBlack.otf",   weight: "900", style: "normal" },
  ],
  variable: "--font-nexa",
  display: "swap",
  // Nexa's baked-in line-gap makes headings look "padded" - zero it out.
  declarations: [{ prop: "line-gap-override", value: "0%" }],
});

export const metadata: Metadata = {
  title: {
    default: "VisaDrill - AI Visa Interview Practice",
    template: "%s | VisaDrill",
  },
  description:
    "Practice with an AI consular officer that adapts to your visa type, gives instant feedback, and helps you walk into your visa interview confident and prepared.",
  keywords: [
    "visa interview practice",
    "AI visa coach",
    "US visa interview",
    "UK visa interview",
    "consular officer simulation",
    "interview prep",
    "VisaDrill",
  ],
  openGraph: {
    title: "VisaDrill - AI Visa Interview Practice",
    description:
      "Practice with an AI consular officer. Get real feedback. Walk in confident.",
    type: "website",
    locale: "en_US",
    siteName: "VisaDrill",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisaDrill - AI Visa Interview Practice",
    description:
      "Practice with an AI consular officer. Get real feedback. Walk in confident.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mulish.variable} ${nexa.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-surface text-ink">
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-mulish)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
