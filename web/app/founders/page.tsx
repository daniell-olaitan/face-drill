import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageCanvas } from "@/components/home/page-canvas";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Founders - VisaDrill" };

const FOUNDERS = [
  {
    name: "Temidire Adesiji",
    role: "Founder & CEO",
    initials: "TA",
    bio: [
      "Temidire built VisaDrill after watching friends and family struggle through visa interview anxiety - not because they were unqualified, but because they walked in unprepared.",
      "He believes the best way to walk in confident is to have been in the room before. Even if that room is a simulation.",
    ],
    linkedin: "#",
  },
  {
    name: "Jedidiah Oladele",
    role: "Co-founder & CTO",
    initials: "JO",
    bio: [
      "Jedidiah leads the technical architecture behind VisaDrill's AI interview engine. He's obsessed with making AI feel less like a chatbot and more like a real officer asking hard questions.",
      "His work spans the Tavus video integration, the scoring model, and the session infrastructure that powers every practice run.",
    ],
    linkedin: "#",
  },
];

export default function FoundersPage() {
  return (
    <div className="relative isolate flex flex-col min-h-screen bg-canvas-base overflow-x-clip">
      <PageCanvas />
      <Navbar />

      {/* ── PAGE HEADER ───────────────────────────────── */}
      <section className="px-6 lg:px-10 pt-20 pb-16 border-b border-border">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-end">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary mb-7">
              The team
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-bold text-ink tracking-tight leading-[1.04]">
              Meet the<br />
              <span className="text-brand-600">founders.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12} className="self-end">
            <p className="text-lg text-ink-secondary leading-relaxed max-w-lg">
              Two builders who got tired of watching qualified people get refused at the window -
              not for lack of merit, but for never having stood there before.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOUNDERS ─────────────────────────────────── */}
      <section className="flex-1 px-6 lg:px-10 py-4">
        <RevealGroup className="max-w-7xl mx-auto" stagger={0.14}>
          {FOUNDERS.map((founder, i) => (
            <RevealItem
              key={founder.name}
              className={`grid lg:grid-cols-[36%_64%] gap-10 lg:gap-20 py-16 ${
                i < FOUNDERS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Left: identity */}
              <div>
                <div className="w-14 h-14 rounded-sm bg-brand-600/10 border border-brand-600/20 flex items-center justify-center mb-7">
                  <span className="text-xl font-bold text-brand-600">{founder.initials}</span>
                </div>
                <h2 className="text-2xl font-bold text-ink tracking-tight mb-1">
                  {founder.name}
                </h2>
                <p className="text-sm font-semibold text-brand-600 mb-6">{founder.role}</p>
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-ink-tertiary hover:text-ink transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  LinkedIn
                </a>
              </div>

              {/* Right: bio */}
              <div className="flex flex-col gap-5 justify-center">
                {founder.bio.map((para, j) => (
                  <p key={j} className="text-[1.0625rem] text-ink-secondary leading-[1.8]">
                    {para}
                  </p>
                ))}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── MISSION ──────────────────────────────────── */}
      <section className="bg-[#0A0A0F] bg-dot-grid-dark px-6 lg:px-10 py-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-6">
              Our mission
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.15]">
              Close the gap between<br />qualified and approved.
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="self-end">
            <p className="text-[1.0625rem] text-white/50 leading-[1.8]">
              The visa window shouldn&apos;t be a lottery of nerve. Under 214(b) the burden is on the
              applicant to prove they&apos;ll return - in minutes, under pressure, often for the first
              time in their life. VisaDrill closes the gap between being qualified and being approved,
              by letting you stand at that window before it counts.
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
