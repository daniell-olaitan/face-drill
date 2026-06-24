import React from "react";
import { Lock } from "lucide-react";
import { VisaDrillLogo } from "@/components/layout/navbar";
import { Reveal } from "@/components/ui/reveal";

// Subtle geometric decoration for the brand panel - circles, lines, dots.
function PanelDecoration() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <circle cx="380" cy="90" r="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <circle cx="380" cy="90" r="140" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <circle cx="20" cy="720" r="220" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="420" x2="400" y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="0" y1="470" x2="400" y2="290" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <circle cx="60" cy="120" r="3" fill="rgba(37,99,235,0.4)" />
      <circle cx="330" cy="640" r="4" fill="rgba(37,99,235,0.25)" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[400px_1fr]">
      {/* Left: dark brand panel */}
      <div className="hidden lg:flex flex-col bg-[#0A0A0F] bg-dot-grid-dark px-10 py-12 relative overflow-hidden">
        <PanelDecoration />
        <div className="absolute -bottom-24 -right-12 w-56 h-56 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content above decoration */}
        <div className="relative z-10 flex flex-1 flex-col">
          <VisaDrillLogo light />

          <Reveal className="flex-1 flex flex-col justify-center mt-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/20 mb-7">
              The window, before the window
            </p>
            <h2 className="text-[2rem] font-bold text-white tracking-tight leading-[1.2] mb-5">
              Three minutes<br />decide it.<br />Rehearse them.
            </h2>
            <p className="text-[13px] text-white/40 leading-relaxed mb-10 max-w-65">
              The officer is testing one thing - whether you&apos;ll come back. Practice proving
              it until the real window feels like the second time.
            </p>
            <div className="flex flex-col gap-3">
              {["US B-1/B-2 Tourist", "US F-1 Student", "UK Student Visa"].map((v) => (
                <div key={v} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  <span className="text-[13px] text-white/45">{v}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Privacy / security note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xs bg-white/3 border border-white/6 mb-5">
            <Lock className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/40 leading-relaxed">
              Your answers and details stay private. Practice in confidence - nothing is shared.
            </p>
          </div>

          <p className="text-[11px] text-white/15">© {new Date().getFullYear()} VisaDrill</p>
        </div>
      </div>

      {/* Right: form area */}
      <div className="flex flex-col bg-surface">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-border px-6 h-14 flex items-center">
          <VisaDrillLogo size="sm" />
        </div>
        <Reveal className="flex-1 flex items-center justify-center px-6 py-12">
          {children}
        </Reveal>
      </div>
    </div>
  );
}
