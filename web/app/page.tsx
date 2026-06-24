import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "@/components/home/waitlist-form";
import { JourneyTrail } from "@/components/home/journey-trail";
import { TwoWindows } from "@/components/home/two-windows";
import { PageCanvas } from "@/components/home/page-canvas";
import { Reveal, RevealGroup, RevealItem, ParallaxImage } from "@/components/ui/reveal";
import { buttonVariants } from "@/components/ui/button-variants";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "VisaDrill - Visa Interview Practice",
  description:
    "A US visa interview lasts two to five minutes. Practice it with an AI consular officer until you walk in calm. Real questions, real pressure, honest verdict.",
};

const PROOF_POINTS = [
  {
    label: "Real pressure",
    desc: "An AI officer trained on your specific visa category - not a friendly Q&A bot. It doubts you, follows up, and waits for you to crack, the way a real window does.",
  },
  {
    label: "No scripts",
    desc: "Questions adapt to your answers. Hesitate on your finances and it digs into your finances. Contradict your own brief and it catches you - the way real scrutiny does.",
  },
  {
    label: "An honest verdict",
    desc: "Scored across six criteria with a clear ruling and the specific lines to fix. Not “good job.” The truth, while you still have time to act on it.",
  },
];

/* The window, made real - an applicant at the consular glass, the photo
   dissolving into the section (composited, not framed) with our plate + chip. */
function ConsularWindow() {
  return (
    <div className="relative w-full max-w-140 mx-auto">
      <ParallaxImage
        src="/images/Photorealistic_shot_of_a_young_202606110015.jpeg"
        alt="A visa applicant slides his passport across the consular window"
        sizes="(max-width: 1024px) 90vw, 560px"
        className="aspect-16/11 rounded-sm"
        imgClassName="grayscale-[0.35] contrast-[1.05] mask-fade-lb"
      >
        {/* Window plate overlay */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
            Window 04
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/45">
            Nonimmigrant Visas
          </span>
        </div>
      </ParallaxImage>

      {/* Floating refusal-slip chip - the stakes */}
      <div className="absolute -bottom-4 -right-3 bg-[#06080F] border border-white/8 rounded-sm px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
        <div>
          <p className="text-[11px] font-semibold text-white/80 leading-tight">214(b) - refused</p>
          <p className="text-[10px] text-white/30 leading-tight">No appeal · reapply only</p>
        </div>
      </div>
    </div>
  );
}

function SessionPreviewCard() {
  return (
    <div className="relative">
      {/* Main window */}
      <div className="bg-[#080F1C] border border-[#182840] rounded-[8px] overflow-hidden w-full max-w-120 ml-auto">
        {/* Chrome bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#182840] bg-[#060C17]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A2E47]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A2E47]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A2E47]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 bg-[#0D1A2E] rounded-[3px] px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-[#3E6B9A]">visadrill.com · US B-1/B-2 Session</span>
            </div>
          </div>
        </div>

        {/* Interview area */}
        <div className="p-5">
          {/* Officer header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#182840]">
            <div className="w-9 h-9 rounded-xs bg-[#0D2040] border border-[#1A3060] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#6A9AD0]">US</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white">Consular Officer</p>
              <p className="text-[11px] text-[#3E6B9A]">US Embassy, Lagos · Nonimmigrant Visas</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-[#3E6B9A]">Window</p>
              <p className="text-[13px] font-mono text-white">02:48</p>
            </div>
          </div>

          {/* Messages - the classic 214(b) probe */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="max-w-[85%]">
              <p className="text-[11px] text-[#3E6B9A] mb-1.5">Officer</p>
              <div className="bg-[#0D1A2E] rounded-xs px-3.5 py-2.5">
                <p className="text-[13px] text-[#B8CDE0] leading-relaxed">
                  &ldquo;What ties you to your home country - what makes you come back?&rdquo;
                </p>
              </div>
            </div>
            <div className="max-w-[85%] ml-auto">
              <p className="text-[11px] text-[#2E5A8A] mb-1.5 text-right">You</p>
              <div className="bg-[#0D2040] border border-[#1A3060] rounded-xs px-3.5 py-2.5">
                <p className="text-[13px] text-[#B8CDE0] leading-relaxed">
                  &ldquo;A permanent job I return to, my family, and a mortgage in Lagos. This is a two-week trip.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Score footer */}
          <div className="border-t border-[#182840] pt-4 flex items-center gap-5">
            <div>
              <p className="text-[11px] text-[#3E6B9A] mb-0.5">Score</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-[22px] font-bold text-white leading-none">84</span>
                <span className="text-[12px] text-[#3E6B9A]">/100</span>
              </div>
            </div>
            <div className="w-px h-7 bg-[#182840]" />
            <div>
              <p className="text-[11px] text-[#3E6B9A] mb-0.5">Verdict</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[13px] font-semibold text-emerald-400">Likely Approved</p>
              </div>
            </div>
            <div className="w-px h-7 bg-[#182840]" />
            <div>
              <p className="text-[11px] text-[#3E6B9A] mb-0.5">Probe</p>
              <p className="text-[13px] font-semibold text-white">Return intent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chip - bottom left */}
      <div className="absolute -bottom-5 -left-4 bg-[#080F1C] border border-[#182840] rounded-sm px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[3px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-white leading-tight">Strong home ties</p>
          <p className="text-[11px] text-[#3E6B9A] leading-tight">Job + family + property cited</p>
        </div>
      </div>

      {/* Floating chip - top right */}
      <div className="absolute -top-4 -right-3 bg-[#080F1C] border border-[#182840] rounded-sm px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-[2px] bg-brand-600/20 flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-brand-400">AI</span>
        </div>
        <div>
          <p className="text-[11px] text-[#3E6B9A] leading-none mb-0.5">Intent read</p>
          <p className="text-[12px] font-bold text-white leading-none">Genuine</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative isolate flex flex-col min-h-screen bg-canvas-base overflow-x-clip">
      {/* One gradient canvas the whole page scrolls over. `isolate` keeps its
          -z-10 layer above the base gradient but behind all content. */}
      <PageCanvas />
      <Navbar />

      {/* ── HERO ── */}
      <section className="flex-1 flex items-center px-6 lg:px-10 xl:px-16 pb-24 pt-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[54%_46%] gap-16 xl:gap-28 items-center">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary mb-8">
              AI Visa Interview Practice
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold text-ink tracking-tight leading-[1.03] mb-7">
              The three<br />
              minutes that<br />
              decide{" "}
              <span className="text-brand-600">everything.</span>
            </h1>
            <p className="text-lg sm:text-xl text-ink-secondary leading-[1.7] max-w-130 mb-10">
              A US visa interview lasts two to five minutes, at a window, behind glass.
              The officer is testing one thing - whether you&apos;ll come back. VisaDrill is
              that window. Rehearse it until you walk in calm.
            </p>
            <div className="flex items-center gap-6 flex-wrap mb-10">
              <a href="#waitlist" className={buttonVariants({ variant: "dark", size: "xl" })}>
                Get early access
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors"
              >
                Step up to the window
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {["US B-1/B-2", "US F-1", "UK Student"].map((v, i, arr) => (
                <span key={v} className="flex items-center gap-3">
                  <span className="text-sm text-ink-tertiary">{v}</span>
                  {i < arr.length - 1 && (
                    <span className="text-ink-tertiary/40 text-xs select-none">·</span>
                  )}
                </span>
              ))}
              <span className="text-ink-tertiary/40 text-xs select-none">·</span>
              <span className="text-sm text-ink-tertiary">More soon</span>
            </div>
          </Reveal>

          <div className="hidden lg:flex items-center justify-end">
            <Reveal className="w-full pr-4 xl:pr-8" delay={0.15}>
              <SessionPreviewCard />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="border-t border-b border-border">
        <RevealGroup className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
          {[
            { n: "2-5 min", label: "How short a real interview is" },
            { n: "214(b)", label: "Why most applicants are refused" },
            { n: "6", label: "Criteria we score you on" },
            { n: "Free", label: "To run your first session" },
          ].map(({ n, label }) => (
            <RevealItem key={label} className="flex flex-col items-center justify-center py-9 px-4 gap-1.5 text-center">
              <span className="text-2xl font-bold text-ink">{n}</span>
              <span className="text-[11px] text-ink-tertiary leading-tight">{label}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* ── THE PROCESS (animated trail) ── */}
      <JourneyTrail />

      {/* ── THE WINDOW (cinematic beat) ── */}
      <section className="bg-[#0A0A0F] bg-dot-grid-dark px-6 lg:px-10 py-24 lg:py-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[48%_52%] gap-16 xl:gap-24 items-center">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-8">
              The window
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white tracking-tight leading-[1.06] mb-7">
              You get one<br />
              shot at the<br />
              <span className="text-brand-500">glass.</span>
            </h2>
            <p className="text-lg text-white/45 leading-[1.75] max-w-115">
              In a real interview there are no retries. The officer decides in minutes, hands your
              passport back through the slot, and that&apos;s the slip. VisaDrill is the one place
              you can step up to the window again - and again - until it stops shaking you.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center lg:justify-end">
            <ConsularWindow />
          </Reveal>
        </div>
      </section>

      {/* ── THE REAL TEST (§214b) ── */}
      <section className="border-t border-border px-6 lg:px-10 py-24">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary mb-12">
            The real test
          </p>
          <div className="grid lg:grid-cols-[48%_52%] gap-12 xl:gap-20 items-start">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-ink tracking-tight leading-[1.08]">
                You walk in<br />
                presumed an<br />
                <span className="text-brand-600">immigrant.</span>
              </h2>
            </Reveal>
            <div>
              <p className="text-lg text-ink-secondary leading-[1.75] mb-8">
                Under US law, every visa applicant is presumed to intend to stay. The burden is
                entirely on you to prove otherwise - and you get a few minutes at a window to do it.
                Most refusals aren&apos;t about your paperwork. They&apos;re about the answers you
                gave under pressure.
              </p>

              {/* §214(b) definition block */}
              <div className="border-l-2 border-ink pl-5 mb-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink mb-2">
                  214(b)
                </p>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  The clause that refuses more applicants than any other. It assumes immigrant intent.
                  You overcome it by proving real, specific ties that pull you home.
                </p>
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary mb-5">
                The four things being weighed
              </p>
              <RevealGroup className="flex flex-col">
                {[
                  { pillar: "Ties", q: "What pulls you back home - job, family, property?" },
                  { pillar: "Purpose", q: "Is your reason specific, credible, consistent?" },
                  { pillar: "Funds", q: "Can you afford this without working illegally?" },
                  { pillar: "Credibility", q: "Does your story hold - and match what you filed?" },
                ].map(({ pillar, q }, i) => (
                  <RevealItem
                    key={pillar}
                    className={`grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-4 ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="text-sm font-bold text-ink">{pillar}</span>
                    <p className="text-[15px] text-ink-secondary leading-snug">{q}</p>
                  </RevealItem>
                ))}
              </RevealGroup>
              <p className="text-[13px] text-ink-tertiary mt-6 leading-relaxed">
                These are the four pillars of 214(b) - and the exact four VisaDrill scores you on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF ── */}
      <section className="border-t border-border px-6 lg:px-10 py-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-ink tracking-tight leading-[1.2]">
              Qualified isn&apos;t the same as prepared.
            </h2>
            <ParallaxImage
              src="/images/Editorial_documentary_photography_of_a_202606110014.jpeg"
              alt="A visa applicant waiting with her documents in the embassy hall"
              sizes="(max-width: 1024px) 90vw, 560px"
              className="mt-9 aspect-4/3 rounded-sm border border-border"
              imgClassName="grayscale-[0.5] contrast-[1.03]"
            >
              <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-black/5" />
              <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-sm border border-border rounded-sm px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-secondary">
                  The wait before the window
                </span>
              </div>
            </ParallaxImage>
          </div>
          <RevealGroup className="flex flex-col">
            {PROOF_POINTS.map(({ label, desc }) => (
              <RevealItem key={label} className="border-t border-border py-6 grid sm:grid-cols-[9rem_1fr] gap-4">
                <span className="text-sm font-semibold text-ink">{label}</span>
                <p className="text-sm text-ink-secondary leading-relaxed">{desc}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── THE PAYOFF - two windows (pinned cold→warm morph) ── */}
      <TwoWindows />

      {/* ── WAITLIST ── bright conversion beat between the dark payoff and the dark footer */}
      <section
        id="waitlist"
        className="relative overflow-hidden border-t border-border px-6 py-32 lg:py-40"
      >
        {/* Oversized faint backdrop word for depth */}
        <span
          aria-hidden
          className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[28vw] font-bold tracking-tighter text-ink/3 leading-none whitespace-nowrap"
        >
          READY.
        </span>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-tertiary mb-7">
              Early access · Free to start
            </p>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ink tracking-tight leading-[1.02] mb-7">
              Don&apos;t walk in<br />
              <span className="text-brand-600">cold.</span>
            </h2>
            <p className="text-lg text-ink-secondary leading-relaxed max-w-lg mx-auto mb-10">
              The window doesn&apos;t give second chances. VisaDrill gives you as many as you need -
              rehearse until the real thing feels like the second time.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="max-w-md mx-auto">
            <WaitlistForm />
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-9 flex items-center justify-center gap-x-5 gap-y-2 flex-wrap text-[11px] font-medium uppercase tracking-[0.14em] text-ink-tertiary">
              <span>Free to start</span>
              <span className="w-1 h-1 rounded-full bg-ink-tertiary/40" />
              <span>No card required</span>
              <span className="w-1 h-1 rounded-full bg-ink-tertiary/40" />
              <span>Verdict in minutes</span>
              <span className="w-1 h-1 rounded-full bg-ink-tertiary/40" />
              <span>US &amp; UK visas</span>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
