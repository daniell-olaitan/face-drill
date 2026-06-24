import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { getVisaProfile } from "@/lib/visa-profiles";
import { formatDate, verdictToLabel, cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { buttonVariants } from "@/components/ui/button-variants";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard - VisaDrill" };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed:   { label: "Completed",   color: "text-success" },
  in_progress: { label: "In progress", color: "text-brand-600" },
  briefing:    { label: "Briefing",    color: "text-brand-600" },
  abandoned:   { label: "Abandoned",   color: "text-ink-tertiary" },
  created:     { label: "Created",     color: "text-ink-tertiary" },
};

const VERDICT_CHIP: Record<string, string> = {
  likely_approve: "text-success bg-success-bg",
  borderline:     "text-warning bg-warning-bg",
  likely_refuse:  "text-danger bg-danger-bg",
};

/** Maps an average score onto a 214(b)-framed readiness band. */
function readinessBand(avg: number | null) {
  if (avg === null)
    return {
      label: "",
      text: "text-ink",
      chip: "",
      bar: "bg-border-strong",
      note: "Run your first session to unlock a readiness score and a breakdown across the four pillars officers weigh - ties, purpose, funds, and credibility.",
    };
  if (avg >= 75)
    return {
      label: "Likely approve",
      text: "text-success",
      chip: "text-success bg-success-bg",
      bar: "bg-success",
      note: "You're interviewing well. Keep your answers tight, specific, and consistent with your DS-160.",
    };
  if (avg >= 60)
    return {
      label: "Borderline",
      text: "text-warning",
      chip: "text-warning bg-warning-bg",
      bar: "bg-warning",
      note: "Close to the line. Tighten your weakest pillar before you stand at the real window.",
    };
  return {
    label: "Needs work",
    text: "text-danger",
    chip: "text-danger bg-danger-bg",
    bar: "bg-danger",
    note: "Keep drilling. Your answers need to land faster and prove stronger ties to home.",
  };
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("sessions")
      .select("*, feedback(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // full_name lives in profiles, but accounts created before the signup
  // trigger copied it across won't have it there - fall back to the auth
  // token's metadata so the greeting is always correct.
  const fullName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    null;
  const firstName = fullName?.split(" ")[0] ?? "there";

  const completedSessions = sessions?.filter((s) => s.status === "completed") ?? [];
  const scoredSessions = completedSessions.filter((s) => s.feedback?.overall_score);
  const avgScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce((acc, s) => acc + (s.feedback?.overall_score ?? 0), 0) /
            scoredSessions.length
        )
      : null;
  const sessionsRemaining = Math.max(
    0,
    (profile?.sessions_limit ?? 5) - (profile?.sessions_used ?? 0)
  );

  const band = readinessBand(avgScore);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 sm:py-14">

      {/* ── HEADER ─────────────────────────────────────── */}
      <Reveal>
        <div className="flex items-start justify-between gap-4 mb-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-3">
              Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight leading-[1.05]">
              Welcome back,
              <br />
              <span className="text-brand-600">{firstName}.</span>
            </h1>
          </div>
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ variant: "primary" }), "shrink-0")}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New session</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </Reveal>

      {/* ── READINESS + STATS ──────────────────────────── */}
      <section className="grid gap-4 sm:grid-cols-3 mb-14">
        {/* Readiness - featured */}
        <Reveal delay={0.05} className="sm:col-span-2">
          <div className="h-full border border-border rounded-[8px] p-6 bg-surface-raised/50 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
                Interview readiness
              </p>
              {band.label && (
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-[3px]",
                    band.chip
                  )}
                >
                  {band.label}
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className={cn("text-5xl font-bold tracking-tight tabular-nums", band.text)}>
                {avgScore ?? "-"}
              </span>
              <span className="text-lg text-ink-tertiary mb-1">/100</span>
            </div>
            <Progress
              value={avgScore ?? 0}
              className="h-1 mb-5"
              indicatorClassName={band.bar}
            />
            <p className="text-sm text-ink-secondary leading-relaxed mt-auto">{band.note}</p>
          </div>
        </Reveal>

        {/* Two stacked stats */}
        <Reveal delay={0.12} className="grid grid-rows-2 gap-4">
          <div className="border border-border rounded-[8px] p-5 flex flex-col justify-center">
            <span className="text-3xl font-bold text-ink tabular-nums">
              {completedSessions.length}
            </span>
            <span className="text-[11px] text-ink-tertiary leading-tight mt-1">
              Sessions completed
            </span>
          </div>
          <div className="border border-border rounded-[8px] p-5 flex flex-col justify-center">
            <span className="text-3xl font-bold text-ink tabular-nums">{sessionsRemaining}</span>
            <span className="text-[11px] text-ink-tertiary leading-tight mt-1">
              {sessionsRemaining === 0 ? "Sessions left - upgrade" : "Sessions remaining"}
            </span>
          </div>
        </Reveal>
      </section>

      {/* ── SESSIONS ───────────────────────────────────── */}
      {!sessions || sessions.length === 0 ? (
        <Reveal delay={0.16}>
          <div className="border border-border rounded-[8px] px-8 py-16 text-center bg-dot-grid">
            <p className="text-base font-bold text-ink mb-2">No sessions yet</p>
            <p className="text-sm text-ink-secondary mb-7 max-w-xs mx-auto leading-relaxed">
              Stand at the window before it counts. Start your first practice run and see how an
              officer would read you.
            </p>
            <Link href="/onboarding" className={buttonVariants({ variant: "primary" })}>
              Start first session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      ) : (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-3">
            Practice history
          </p>
          <RevealGroup className="flex flex-col" stagger={0.05}>
            {sessions.map((session, i) => {
              const visaProfile = getVisaProfile(session.visa_profile_id);
              const feedback = session.feedback as
                | { overall_score?: number; verdict?: string }
                | null;
              const statusCfg = STATUS_MAP[session.status] ?? STATUS_MAP.created;

              const href =
                session.status === "completed"
                  ? `/feedback/${session.id}`
                  : session.status === "in_progress" || session.status === "briefing"
                  ? `/interview/${session.id}`
                  : "#";

              return (
                <RevealItem key={session.id}>
                  <Link
                    href={href}
                    className={cn(
                      "group flex items-center justify-between gap-4 py-4 px-3 -mx-3 rounded-sm transition-colors hover:bg-surface-raised",
                      i > 0 && "border-t border-border"
                    )}
                  >
                    {/* Left */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-10 h-10 rounded-sm border border-border bg-surface flex items-center justify-center text-lg shrink-0">
                        {visaProfile?.flagEmoji ?? "🌐"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {visaProfile?.shortLabel ?? session.visa_profile_id}
                        </p>
                        <p className="text-[11px] text-ink-tertiary mt-0.5">
                          {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4 shrink-0">
                      {feedback?.overall_score !== undefined ? (
                        <>
                          <span
                            className={cn(
                              "hidden sm:inline-flex text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-[3px]",
                              VERDICT_CHIP[feedback.verdict ?? ""] ?? "text-ink-tertiary bg-surface-raised"
                            )}
                          >
                            {verdictToLabel(feedback.verdict ?? "")}
                          </span>
                          <p className="text-sm font-bold text-ink tabular-nums w-14.5 text-right">
                            {feedback.overall_score}
                            <span className="font-normal text-ink-tertiary">/100</span>
                          </p>
                        </>
                      ) : (
                        <span className={cn("text-[11px] font-medium", statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-ink-tertiary transition-all opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      )}
    </div>
  );
}
