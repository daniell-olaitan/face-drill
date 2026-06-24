"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X, ArrowRight, Plus } from "lucide-react";

export function VisaDrillLogo({
  size = "md",
  light = false,
}: {
  size?: "sm" | "md";
  light?: boolean;
}) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0 group">
      <div
        className={cn(
          "rounded-[5px] bg-brand-600 flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-80",
          size === "sm" ? "w-7 h-7" : "w-8 h-8"
        )}
      >
        <svg
          width={size === "sm" ? "14" : "16"}
          height={size === "sm" ? "14" : "16"}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.55" />
          <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.55" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" />
        </svg>
      </div>
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          size === "sm" ? "text-sm" : "text-[15px]",
          light ? "text-white" : "text-ink"
        )}
      >
        VisaDrill
      </span>
    </Link>
  );
}

const NAV_LINKS = [
  { href: "/demo", label: "Demo" },
  { href: "/founders", label: "Founders" },
];

export function Navbar({ floating = false }: { floating?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [scrolled, setScrolled] = React.useState(false);

  // Close the mobile menu on route change. Adjusting state during render
  // (React's "storing info from previous renders" pattern) avoids the
  // cascading re-render that a setState-in-effect would trigger.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className={cn(
            "pointer-events-auto w-full transition-[max-width] duration-500 ease-out",
            scrolled ? "max-w-2xl" : "max-w-4xl"
          )}
        >
          <nav
            className={cn(
              "relative flex items-center justify-between gap-4 border border-white/8 rounded-[18px] backdrop-blur-2xl transition-all duration-500 ease-out",
              scrolled
                ? "bg-[#0a0a10]/95 px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                : "bg-[#0a0a10]/80 px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            )}
            aria-label="Main navigation"
          >
            {/* glass sheen */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/10"
            />

            <VisaDrillLogo light />

            {/* Center links with a hover highlight that slides between them */}
            <div
              className="hidden md:flex items-center gap-1"
              onMouseLeave={() => setHovered(null)}
            >
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHovered(link.href)}
                    className={cn(
                      "relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                      active ? "text-white" : "text-white/50 hover:text-white"
                    )}
                  >
                    {hovered === link.href && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-md bg-white/7"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex items-center text-[13px] font-medium text-white/50 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/#waitlist"
                className={cn(buttonVariants({ variant: "white", size: "sm" }), "group hidden sm:inline-flex")}
              >
                Get early access
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="md:hidden mt-2 bg-[#0a0a10]/95 backdrop-blur-2xl border border-white/8 rounded-[14px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center px-5 py-4 text-sm font-medium text-white/55 hover:text-white hover:bg-white/4 transition-colors border-b border-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-5 py-4 text-sm font-medium text-white/55 hover:text-white hover:bg-white/4 transition-colors border-b border-white/5"
                >
                  Sign in
                </Link>
                <div className="px-5 py-4">
                  <Link
                    href="/#waitlist"
                    onClick={() => setMenuOpen(false)}
                    className={cn(buttonVariants({ variant: "white", size: "lg" }), "w-full")}
                  >
                    Get early access
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {/* Layout spacer so content clears the fixed island. Omitted for
          immersive pages that float the navbar over full-bleed content. */}
      {!floating && <div aria-hidden className="h-18 shrink-0" />}
    </>
  );
}

export function AppNavbar() {
  const pathname = usePathname();
  return (
    <>
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="pointer-events-auto relative w-full max-w-4xl flex items-center justify-between gap-3 bg-[#0a0a10]/90 backdrop-blur-2xl border border-white/8 rounded-lg sm:rounded-[18px] px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          aria-label="App navigation"
        >
          {/* glass sheen */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/10"
          />

          <VisaDrillLogo light size="sm" />

          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
            <Link
              href="/dashboard"
              className={cn(
                "text-[13px] font-medium whitespace-nowrap transition-colors",
                pathname === "/dashboard" ? "text-white" : "text-white/45 hover:text-white"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors px-3 sm:px-4 py-1.5 rounded-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New session</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </motion.nav>
      </div>
      <div aria-hidden className="h-18 shrink-0" />
    </>
  );
}
