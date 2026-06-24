"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildLiveDebrief,
  dimensionScores,
  readinessScore,
  verdictFor,
  type TranscriptTurn,
} from "@/lib/interview/score";

const LAST_SCORE_KEY = "visadrill.lastLiveScore";

const toneText = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-danger",
} as const;

const barColor = (score: number): string =>
  score >= 70 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-danger";

interface LiveDebriefProps {
  /** The captured interview transcript (officer + applicant turns). */
  transcript: TranscriptTurn[];
  /** Return to the start (practice again). */
  onDone: () => void;
}

/**
 * Scores a finished interview entirely in the browser with the free heuristic
 * engine - no Supabase, no Anthropic. Shows a verdict, an approval-readiness
 * score (with a since-last-time delta saved in localStorage), per-area bars, and
 * per-question notes built from the captured transcript.
 */
export function LiveDebrief({ transcript, onDone }: LiveDebriefProps) {
  const debrief = React.useMemo(() => buildLiveDebrief(transcript), [transcript]);
  const readiness = debrief ? readinessScore(debrief) : 0;
  const dimensions = debrief ? dimensionScores(debrief) : [];
  const [prevScore, setPrevScore] = React.useState<number | null>(null);
  const savedRef = React.useRef(false);

  // Capture the previous score for the progress delta, then save this one (once).
  React.useEffect(() => {
    if (!debrief || savedRef.current) return;
    savedRef.current = true;
    try {
      const raw = localStorage.getItem(LAST_SCORE_KEY);
      setPrevScore(raw === null ? null : Number(raw));
      localStorage.setItem(LAST_SCORE_KEY, String(readiness));
    } catch {
      /* localStorage unavailable - skip the delta */
    }
  }, [debrief, readiness]);

  const verdict = verdictFor(readiness);
  const delta = prevScore !== null ? readiness - prevScore : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-dark px-5 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">
          Interview debrief
        </p>

        {/* Verdict + readiness */}
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center md:p-8">
          {debrief ? (
            <>
              <p className={cn("text-2xl font-bold tracking-tight md:text-3xl", toneText[verdict.tone])}>
                {verdict.label}
              </p>
              <p className="mt-3 text-sm font-medium text-white/80">
                Approval readiness: <span className="font-semibold">{readiness}/100</span>
                {delta !== null && delta !== 0 && (
                  <span className="ml-2 text-xs text-white/45">
                    ({delta > 0 ? "+" : ""}
                    {delta} since last time)
                  </span>
                )}
              </p>
              {debrief.headline && (
                <p className="mt-4 text-sm leading-relaxed text-white/55">{debrief.summary}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-white/55">
              No answers were captured to score. Run another rep and answer the questions out loud.
            </p>
          )}
        </div>

        {/* Per-area scores */}
        {dimensions.length > 0 && (
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-base font-semibold tracking-tight text-white">By area</h2>
            <div className="mt-4 flex flex-col gap-3">
              {dimensions.map((d) => (
                <div key={d.phase}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/85">{d.label}</span>
                    <span className="font-medium text-white/50">{d.score}/100</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className={cn("h-full rounded-full", barColor(d.score))} style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-question feedback */}
        {debrief && debrief.items.length > 0 && (
          <div className="mt-5 space-y-4">
            {debrief.items.map((item) => (
              <article key={item.question.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-base font-semibold leading-snug tracking-tight text-white">
                  &ldquo;{item.question.text}&rdquo;
                </h3>
                <p className="mt-3 border-l-2 border-white/15 pl-4 text-sm italic leading-relaxed text-white/55">
                  {item.record.answer.trim() ? `"${item.record.answer.trim()}"` : "No answer recorded."}
                </p>
                {(item.notes.landed.length > 0 || item.notes.tighten.length > 0) && (
                  <ul className="mt-4 space-y-2.5">
                    {item.notes.landed.map((note) => (
                      <li key={note} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {note}
                      </li>
                    ))}
                    {item.notes.tighten.map((note) => (
                      <li key={note} className="flex gap-2.5 text-sm leading-relaxed text-white/85">
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 rounded-md bg-white/[0.04] p-4">
                  <p className="text-sm leading-relaxed text-white/55">
                    <span className="font-medium text-white/80">Coach&apos;s note: </span>
                    {item.question.coachTip}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center justify-center rounded-xs bg-white px-9 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            Practice again
          </button>
        </div>
      </div>
    </div>
  );
}
