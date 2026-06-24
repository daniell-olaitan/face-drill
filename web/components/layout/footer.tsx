import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VisaDrillLogo } from "./navbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/demo", label: "Demo" },
  { href: "/founders", label: "Founders" },
  { href: "/#waitlist", label: "Waitlist" },
  { href: "/sign-in", label: "Sign in" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-splash border-t border-white/6">
      {/* dot-grid texture + top sheen */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-dot-grid-dark opacity-60" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-16">
        {/* ── BRAND + CTA ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12">
          <div className="max-w-md">
            <VisaDrillLogo light />
            <p className="text-[15px] text-white/55 mt-4 leading-relaxed">
              AI-powered visa interview practice. Stand at the window before it counts - and walk in
              confident, not hopeful.
            </p>
          </div>
          <Link
            href="/#waitlist"
            className={cn(
              buttonVariants({ variant: "white", size: "md" }),
              "group self-start lg:self-end"
            )}
          >
            Get early access
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── LINKS ── */}
        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/6 py-7">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-white/45 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── LEGAL ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-white/6 py-7">
          <p className="text-[11px] text-white/35">
            © {new Date().getFullYear()} VisaDrill. All rights reserved.
          </p>
          <p className="text-[11px] text-white/35">
            Built for applicants who refuse to walk in cold.
          </p>
        </div>

        {/* ── GIANT WATERMARK ── ink spilled across the base */}
        <div aria-hidden className="relative overflow-hidden pt-4">
          <span className="block text-center font-display font-bold leading-none tracking-tight text-white/[0.035] text-[clamp(3.5rem,20vw,15rem)] whitespace-nowrap translate-y-[0.22em]">
            VisaDrill
          </span>
        </div>
      </div>
    </footer>
  );
}
