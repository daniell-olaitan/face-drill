import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import WaitlistForm from "@/components/landing/WaitlistForm";

const CATEGORIES = ["US B-1/B-2", "US F-1", "US H-1B", "US J-1"];

/* The signature visa-drill hero visual: a faux interview session preview. It is
   intentionally dark (a product screenshot) sitting on the light hero. */
const SessionPreviewCard = () => (
  <div className="relative">
    <div className="ml-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#182840] bg-[#080F1C] shadow-strong">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 border-b border-[#182840] bg-[#060C17] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1A2E47]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1A2E47]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1A2E47]" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-1.5 rounded bg-[#0D1A2E] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[11px] text-[#3E6B9A]">visadrill · US B-1/B-2 Session</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Officer header */}
        <div className="mb-5 flex items-center gap-3 border-b border-[#182840] pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#1A3060] bg-[#0D2040]">
            <span className="text-[11px] font-bold text-[#6A9AD0]">US</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white">Consular Officer</p>
            <p className="text-[11px] text-[#3E6B9A]">US Embassy, Lagos · Nonimmigrant Visas</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] text-[#3E6B9A]">Window</p>
            <p className="font-mono text-[13px] text-white">02:48</p>
          </div>
        </div>

        {/* The classic 214(b) probe */}
        <div className="mb-5 flex flex-col gap-3">
          <div className="max-w-[85%]">
            <p className="mb-1.5 text-[11px] text-[#3E6B9A]">Officer</p>
            <div className="rounded-lg bg-[#0D1A2E] px-3.5 py-2.5">
              <p className="text-[13px] leading-relaxed text-[#B8CDE0]">
                &ldquo;What ties you to your home country - what makes you come back?&rdquo;
              </p>
            </div>
          </div>
          <div className="ml-auto max-w-[85%]">
            <p className="mb-1.5 text-right text-[11px] text-[#2E5A8A]">You</p>
            <div className="rounded-lg border border-[#1A3060] bg-[#0D2040] px-3.5 py-2.5">
              <p className="text-[13px] leading-relaxed text-[#B8CDE0]">
                &ldquo;A permanent job I return to, my family, and a mortgage in Lagos. This is a two-week trip.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Score footer */}
        <div className="flex items-center gap-5 border-t border-[#182840] pt-4">
          <div>
            <p className="mb-0.5 text-[11px] text-[#3E6B9A]">Score</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[22px] font-bold leading-none text-white">84</span>
              <span className="text-[12px] text-[#3E6B9A]">/100</span>
            </div>
          </div>
          <div className="h-7 w-px bg-[#182840]" />
          <div>
            <p className="mb-0.5 text-[11px] text-[#3E6B9A]">Verdict</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <p className="text-[13px] font-semibold text-success">Likely approved</p>
            </div>
          </div>
          <div className="h-7 w-px bg-[#182840]" />
          <div>
            <p className="mb-0.5 text-[11px] text-[#3E6B9A]">Probe</p>
            <p className="text-[13px] font-semibold text-white">Return intent</p>
          </div>
        </div>
      </div>
    </div>

    {/* Floating proof chip */}
    <div className="absolute -bottom-5 -left-4 hidden items-center gap-2.5 rounded-lg border border-[#182840] bg-[#080F1C] px-3.5 py-2.5 sm:flex">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-success/20 bg-success/10">
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      </div>
      <div>
        <p className="text-[12px] font-semibold leading-tight text-white">Strong home ties</p>
        <p className="text-[11px] leading-tight text-[#3E6B9A]">Job + family + property cited</p>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Faint blue wash behind the headline */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand/[0.06] blur-3xl" />
      </div>

      <div className="container pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-brand" />
                Private beta - the waitlist is open
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="font-display mt-7 text-balance text-[2.6rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
                Face the officer{" "}
                <span className="text-brand">before it counts.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
                Your US visa interview lasts about three minutes. VisaDrill puts you across from a
                hyperreal AI consular officer who asks what they actually ask - so the real thing
                feels like your second time.
              </p>
            </Reveal>

            <Reveal delay={300} className="mt-8">
              <div className="mx-auto max-w-md lg:mx-0">
                <WaitlistForm variant="hero" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Can&apos;t wait?{" "}
                <Link
                  to="/practice"
                  className="group inline-flex items-center gap-1 font-medium text-brand transition-colors hover:text-foreground"
                >
                  Walk into a practice session now
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </p>
            </Reveal>

            <Reveal delay={350}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-start">
                {CATEGORIES.map((c, i) => (
                  <span key={c} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{c}</span>
                    {i < CATEGORIES.length - 1 && (
                      <span className="select-none text-xs text-muted-foreground/40">·</span>
                    )}
                  </span>
                ))}
                <span className="select-none text-xs text-muted-foreground/40">·</span>
                <span className="text-sm text-muted-foreground">More soon</span>
              </div>
            </Reveal>
          </div>

          {/* Session preview (desktop) */}
          <Reveal delay={200} className="hidden lg:block">
            <SessionPreviewCard />
          </Reveal>
        </div>

        {/* The stakes, in numbers */}
        <Reveal delay={150} className="mx-auto mt-16 max-w-3xl md:mt-24">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {[
              { value: "3-5 min", label: "the length of a typical visa interview" },
              { value: "~60 sec", label: "how quickly many officers form a view" },
              { value: "214(b)", label: "the law that presumes you intend to stay" },
            ].map((stat) => (
              <div key={stat.value} className="bg-card px-6 py-5 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {stat.value}
                </dd>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
