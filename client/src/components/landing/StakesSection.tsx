import Reveal from "@/components/motion/Reveal";

const PILLARS = [
  { pillar: "Ties", q: "What pulls you back home - a job, family, property, studies?" },
  { pillar: "Purpose", q: "Is your reason specific, credible, and consistent?" },
  { pillar: "Funds", q: "Can you afford this trip without working illegally?" },
  { pillar: "Credibility", q: "Does your story hold - and match what you filed?" },
];

const StakesSection = () => {
  return (
    <section id="why" className="scroll-mt-20 border-t border-border">
      <div className="container py-20 md:py-28">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            The real test
          </p>
        </Reveal>

        <div className="mt-10 grid items-start gap-12 lg:grid-cols-[48%_52%] lg:gap-16 xl:gap-20">
          <Reveal>
            <h2 className="font-display text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              You walk in presumed an <span className="text-brand">immigrant.</span>
            </h2>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Under Section 214(b) of US law, every applicant is presumed to intend to stay. The
                burden is entirely on you to prove otherwise - in a few minutes, at a window. Most
                refusals aren&apos;t about your paperwork. They&apos;re about the answers you give
                under pressure.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-8 border-l-2 border-foreground pl-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">214(b)</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The clause that refuses more applicants than any other. It assumes immigrant intent;
                  you overcome it by proving real, specific ties that pull you home.
                </p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                The four things being weighed
              </p>
            </Reveal>
            <div className="mt-2">
              {PILLARS.map((p, i) => (
                <Reveal key={p.pillar} delay={150 + i * 80}>
                  <div
                    className={`grid grid-cols-[7rem_1fr] items-baseline gap-4 py-4 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <span className="text-sm font-bold text-foreground">{p.pillar}</span>
                    <p className="text-[15px] leading-snug text-muted-foreground">{p.q}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={150}>
              <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
                These four pillars of 214(b) are the exact four VisaDrill scores you on. All of them
                are learnable - most people who fail weren&apos;t unqualified, just unrehearsed.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StakesSection;
