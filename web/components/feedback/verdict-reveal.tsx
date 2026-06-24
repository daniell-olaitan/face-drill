"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const STAMP: Record<string, { border: string; text: string }> = {
  likely_approve: { border: "border-emerald-500/70", text: "text-emerald-600" },
  borderline: { border: "border-amber-500/70", text: "text-amber-600" },
  likely_refuse: { border: "border-red-500/70", text: "text-red-600" },
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, run: boolean) {
  const [n, setN] = React.useState(run ? 0 : target);
  React.useEffect(() => {
    if (!run) {
      setN(target);
      return;
    }
    let raf = 0;
    let startedAt = 0;
    const duration = 1000;
    const tick = (t: number) => {
      if (!startedAt) startedAt = t;
      const p = Math.min(1, (t - startedAt) / duration);
      setN(Math.round(target * easeOutCubic(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

export function VerdictReveal({
  verdict,
  label,
  score,
  description,
  summary,
}: {
  verdict: string;
  label: string;
  score: number;
  description: string;
  summary?: string;
}) {
  const reduce = useReducedMotion();
  const stamp = STAMP[verdict] ?? STAMP.borderline;
  const count = useCountUp(score, !reduce);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-8 mb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-4">
            Session verdict
          </p>
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.55, rotate: -16 }}
            animate={{ opacity: 1, scale: 1, rotate: -3.5 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 240, damping: 14, delay: 0.2 }
            }
            className={cn(
              "inline-flex items-center border-[3px] rounded-sm px-5 py-2.5 sm:px-6 sm:py-3",
              stamp.border
            )}
          >
            <span
              className={cn(
                "font-bold uppercase tracking-[0.1em] text-2xl sm:text-[2rem] leading-none",
                stamp.text
              )}
            >
              {label}
            </span>
          </motion.div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-tertiary mb-1.5">
            Overall score
          </p>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-5xl font-bold text-ink tracking-tight tabular-nums">
              {count}
            </span>
            <span className="text-xl text-ink-tertiary font-normal">/100</span>
          </div>
        </div>
      </div>
      <p className="text-base text-ink-secondary leading-relaxed max-w-2xl">{description}</p>
      {summary && (
        <p className="mt-4 text-sm text-ink-secondary leading-relaxed max-w-2xl border-t border-border pt-5">
          {summary}
        </p>
      )}
    </div>
  );
}
