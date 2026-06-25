import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/visadrill/reveal";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  PHASE_LABELS,
  questionsForCategory,
  type VisaCategory,
} from "@/lib/questionBank";

const TABS: { id: VisaCategory; label: string }[] = [
  { id: "b1b2", label: CATEGORY_LABELS.b1b2 },
  { id: "f1", label: CATEGORY_LABELS.f1 },
  { id: "h1b", label: CATEGORY_LABELS.h1b },
  { id: "j1", label: CATEGORY_LABELS.j1 },
];

export function QuestionBank() {
  const [category, setCategory] = useState<VisaCategory>("b1b2");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const questions = questionsForCategory(category).slice(0, 8);

  return (
    <section id="questions" className="scroll-mt-24 border-t border-border px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary">
            The question bank
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            The questions are <span className="text-brand-600">not a secret.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">
            Officers draw from a short, predictable set. What separates approvals from refusals is how
            ready the answers are. Tap any question to see what the officer is really listening for.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="mx-auto mt-10 max-w-3xl">
        <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Visa category">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={category === tab.id}
              onClick={() => {
                setCategory(tab.id);
                setExpandedId(null);
              }}
              className={cn(
                "rounded-[6px] border px-4 py-2 text-sm font-medium transition-colors",
                category === tab.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border bg-surface text-ink-secondary hover:border-ink/25 hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ul className="mt-6 overflow-hidden rounded-[6px] border border-border bg-surface">
          {questions.map((question, index) => {
            const expanded = expandedId === question.id;
            return (
              <li key={question.id} className={cn(index > 0 && "border-t border-border")}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : question.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-raised md:px-7 md:py-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-snug text-ink md:text-base">
                      &ldquo;{question.text}&rdquo;
                    </span>
                    <span className="mt-1 block text-xs text-ink-tertiary">
                      {PHASE_LABELS[question.phase]}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink-tertiary transition-transform duration-300",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="mx-5 mb-5 border-l-2 border-brand-600 pl-4 md:mx-7">
                      <p className="text-sm leading-relaxed text-ink-secondary">{question.listensFor}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-center text-sm text-ink-tertiary">
          Every one of these is in your practice session, with follow-ups that adapt to how you answer.
        </p>
      </Reveal>
    </section>
  );
}
