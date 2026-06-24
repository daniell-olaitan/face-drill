"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "motion/react";
import { cn } from "@/lib/utils";

/* The five stages of a real US visa interview - the journey VisaDrill mirrors.
   As you scroll, the section pins and a plane flies the dashed route, lighting
   each stage in turn. The trail IS the process, not a holiday. */
const STAGES = [
  {
    step: "01",
    tag: "DS-160",
    title: "Build your case",
    desc: "Fill the form, pay the fee, book the appointment. Every answer you'll give is already on file before you arrive.",
  },
  {
    step: "02",
    tag: "Arrival",
    title: "The embassy",
    desc: "Security, no phones, fingerprints, then the wait - dozens of applicants in one hall, queuing for a window.",
  },
  {
    step: "03",
    tag: "The window",
    title: "Step up to the glass",
    desc: "Two to five minutes at a counter, behind glass. The officer already has your file open. The clock is running.",
  },
  {
    step: "04",
    tag: "214(b)",
    title: "The real test",
    desc: "Ties, purpose, funds, credibility. Prove you'll come back - under pressure, no script, no second take.",
  },
  {
    step: "05",
    tag: "The ruling",
    title: "The verdict",
    desc: "Decided on the spot. Passport kept means approved. Handed back through the slot means refused.",
  },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function JourneyTrail() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The plane + contrail finish a touch before the section unpins.
  const planeLeft = useTransform(scrollYProgress, [0, 0.85], ["3%", "97%"], { clamp: true });
  const fillWidth = useTransform(scrollYProgress, [0, 0.85], ["3%", "97%"], { clamp: true });
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const p = Math.min(v / 0.85, 1);
      setActive(Math.max(0, Math.min(STAGES.length - 1, Math.floor(p * STAGES.length))));
    });
    return unsub;
  }, [scrollYProgress]);

  // Reduced motion: a plain, static list - no pin, no scrub.
  if (reduce) {
    return (
      <section className="border-t border-border px-6 lg:px-10 py-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary mb-4">
            The process
          </p>
          <h2 className="text-4xl font-bold text-ink tracking-tight mb-10">
            The route to the window.
          </h2>
          <ol className="flex flex-col">
            {STAGES.map((s, i) => (
              <li
                key={s.step}
                className={cn(
                  "py-6 grid grid-cols-[auto_1fr] gap-5",
                  i > 0 && "border-t border-border"
                )}
              >
                <span className="text-sm font-bold text-ink-tertiary tabular-nums">{s.step}</span>
                <div>
                  <h3 className="text-lg font-bold text-ink">{s.title}</h3>
                  <p className="text-[15px] text-ink-secondary leading-relaxed mt-1">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[360vh] border-t border-border">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* Heading + progress counter */}
        <div className="shrink-0 max-w-7xl w-full mx-auto px-6 lg:px-10 pt-28 lg:pt-32">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary mb-4">
            The process
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-ink tracking-tight leading-[1.05]">
              The route to<br className="hidden sm:block" /> the window.
            </h2>
            <span className="text-[11px] font-mono text-ink-tertiary tabular-nums pb-1">
              {String(active + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* The flight route */}
        <div className="relative flex-1 max-w-7xl w-full mx-auto">
          <div className="absolute inset-x-6 lg:inset-x-10 top-1/2 -translate-y-1/2">
            <div className="relative h-0 border-t-2 border-dashed border-border-strong">
              {/* Contrail fill */}
              <motion.div
                className="absolute left-0 top-0 -translate-y-1/2 h-0.5 bg-brand-600"
                style={{ width: fillWidth }}
              />

              {/* Stage nodes */}
              {STAGES.map((s, i) => {
                const pos = (i / (STAGES.length - 1)) * 100;
                const lit = i <= active;
                return (
                  <div
                    key={s.step}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pos}%` }}
                  >
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-full border-2 transition-colors duration-300",
                        lit ? "bg-brand-600 border-brand-600" : "bg-surface border-border-strong"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono tabular-nums transition-colors duration-300",
                        lit ? "text-ink" : "text-ink-tertiary"
                      )}
                    >
                      {s.step}
                    </span>
                  </div>
                );
              })}

              {/* The plane */}
              <motion.div
                className="absolute top-0 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: planeLeft }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center"
                >
                  <Image
                    src="/images/Top-down_view_of_a_small_202606110012-removebg-preview.png"
                    alt=""
                    aria-hidden
                    width={22}
                    height={22}
                    className="brightness-0 opacity-85 rotate-90"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Active stage - cross-fades as the plane reaches each node */}
        <div className="shrink-0 max-w-7xl w-full mx-auto px-6 lg:px-10 pb-20 lg:pb-28 min-h-47.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] font-mono font-bold text-ink-tertiary tabular-nums">
                  {STAGES[active].step}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] px-2 py-0.5 rounded-[3px] border border-brand-600/30 text-brand-700 bg-brand-50">
                  {STAGES[active].tag}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-2">
                {STAGES[active].title}
              </h3>
              <p className="text-base text-ink-secondary leading-relaxed">
                {STAGES[active].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
