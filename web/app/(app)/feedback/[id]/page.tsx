import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser, createClient } from "@/lib/supabase/server";
import { getVisaProfile } from "@/lib/visa-profiles";
import { scoreToColor, ratingToColor, formatDate, cn } from "@/lib/utils";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button-variants";
import { VerdictReveal } from "@/components/feedback/verdict-reveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import type { Metadata } from "next";
import type { FeedbackReport } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Feedback Report" };

const VERDICT_LABELS: Record<string, string> = {
  likely_approve: "Likely Approved",
  borderline: "Borderline",
  likely_refuse: "Likely Refused",
};

const VERDICT_DESCRIPTIONS: Record<string, string> = {
  likely_approve:
    "Your performance in this session suggests a consular officer would approve your visa application.",
  borderline:
    "Your performance is borderline. With targeted improvements you can significantly improve your odds.",
  likely_refuse:
    "Based on this session, you need substantial improvement before the real interview.",
};

export default async function FeedbackPage({ params }: PageProps) {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*, feedback(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!session) notFound();

  const feedback = session.feedback as FeedbackReport | null;
  if (!feedback) redirect(`/interview/${id}`);

  const visaProfile = getVisaProfile(session.visa_profile_id);
  const verdictLabel = VERDICT_LABELS[feedback.verdict] ?? "Borderline";
  const verdictDesc = VERDICT_DESCRIPTIONS[feedback.verdict] ?? "";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-10 gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-tertiary hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <Link href="/onboarding" className={buttonVariants({ variant: "dark", size: "sm" })}>
          <RotateCcw className="w-3 h-3" />
          Practice again
        </Link>
      </div>

      {/* ── VISA + DATE ── */}
      <div className="flex items-center gap-4 pb-8 border-b border-border">
        <span className="w-12 h-12 rounded-[8px] border border-border bg-surface-raised flex items-center justify-center text-2xl shrink-0">
          {visaProfile?.flagEmoji ?? "🌐"}
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-1.5">
            Session feedback
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight leading-tight">
            {visaProfile?.shortLabel ?? "Visa Interview"}
          </h1>
          <p className="text-[11px] text-ink-tertiary mt-1">
            {formatDate(feedback.generated_at)}
          </p>
        </div>
      </div>

      {/* ── VERDICT (animated stamp) ── */}
      <section className="py-12 border-b border-border">
        <VerdictReveal
          verdict={feedback.verdict}
          label={verdictLabel}
          score={feedback.overall_score}
          description={verdictDesc}
          summary={feedback.summary}
        />
      </section>

      {/* ── SCORE BREAKDOWN ── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary pt-8 mb-1">
          Score breakdown
        </p>
        <p className="text-[12px] text-ink-tertiary mb-2">
          Measured across the four pillars an officer weighs in a real interview.
        </p>
        <RevealGroup>
          {feedback.criterion_scores.map((cs) => (
            <RevealItem key={cs.criterion_id} className="border-t border-border pt-6 pb-6">
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="font-semibold text-ink text-sm leading-tight">{cs.label}</p>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className={cn("text-2xl font-bold tabular-nums", scoreToColor(cs.score))}>
                    {cs.score}
                  </span>
                  <span className="text-xs text-ink-tertiary">/100</span>
                </div>
              </div>
              <Progress
                value={cs.score}
                className="h-1.5 mb-3"
                indicatorClassName={
                  cs.score >= 70 ? "bg-success" : cs.score >= 50 ? "bg-warning" : "bg-danger"
                }
              />
              <p className="text-sm text-ink-secondary leading-relaxed">{cs.comment}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── STRENGTHS + IMPROVEMENTS ── */}
      <section className="grid sm:grid-cols-2 py-10 border-t border-border gap-0">
        <div className="pb-8 sm:pb-0 sm:pr-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-6">
            Strengths
          </p>
          <div className="flex flex-col gap-4">
            {feedback.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                <p className="text-sm text-ink-secondary leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-border pt-8 sm:pt-0 sm:pl-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-6">
            To improve
          </p>
          <div className="flex flex-col gap-4">
            {feedback.improvements.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[11px] font-bold text-ink-tertiary mt-0.5 w-5 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-ink-secondary leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RED FLAGS ── */}
      {feedback.red_flags.length > 0 && (
        <section className="border-t border-border py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-6">
            Red flags
          </p>
          <div className="flex flex-col gap-4">
            {feedback.red_flags.map((rf) => (
              <div
                key={rf.id}
                className={cn(
                  "pl-4 border-l-2 py-1",
                  rf.severity === "high"
                    ? "border-danger"
                    : rf.severity === "medium"
                    ? "border-warning"
                    : "border-ink-tertiary"
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5",
                    rf.severity === "high"
                      ? "text-danger"
                      : rf.severity === "medium"
                      ? "text-warning"
                      : "text-ink-tertiary"
                  )}
                >
                  {rf.severity} risk
                </p>
                <p className="text-sm text-ink-secondary leading-relaxed">{rf.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ANSWER BREAKDOWN ── */}
      {feedback.answer_breakdowns.length > 0 && (
        <section className="border-t border-border py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-0">
            Answer breakdown
          </p>
          {feedback.answer_breakdowns.map((ab, i) => (
            <div
              key={i}
              className="border-t border-border pt-6 pb-6 first:mt-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-tertiary mb-3">
                Question {String(i + 1).padStart(2, "0")}
              </p>
              <p className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                {ab.question}
              </p>
              <p className="text-sm text-ink-secondary leading-relaxed pl-4 border-l-2 border-border mb-4">
                {ab.answer}
              </p>
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.12em] shrink-0 mt-0.5 px-1.5 py-0.5 rounded-[3px]",
                    ratingToColor(ab.rating)
                  )}
                >
                  {ab.rating}
                </span>
                <p className="text-sm text-ink-secondary leading-relaxed">{ab.assessment}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── FOOTER CTA ── */}
      <div className="border-t border-border pt-10 pb-4 flex items-center gap-6 flex-wrap">
        <Link href="/onboarding" className={buttonVariants({ variant: "dark" })}>
          <RotateCcw className="w-4 h-4" />
          Practice again
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink-tertiary hover:text-ink transition-colors"
        >
          Back to dashboard
        </Link>
      </div>

    </div>
  );
}
