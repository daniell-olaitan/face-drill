"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { visaProfiles } from "@/lib/visa-profiles";
import { TavusLiveInterview } from "@/components/interview/tavus-live-interview";
import { LiveDebrief } from "@/components/interview/live-debrief";
import { unlockAudio } from "@/lib/audio";
import { cn } from "@/lib/utils";
import type { TranscriptTurn } from "@/lib/interview/score";

// Visible countdown for the live interview; the call auto-ends at zero. Mirror of
// the max_call_duration set in app/api/tavus/conversation/route.ts.
const LIVE_MAX_SECONDS = 120;

/**
 * A standalone, no-login practice interview: pick a visa type, talk to the live
 * Tavus officer, then end. No accounts, no saved history, no scoring - it depends
 * on nothing but Tavus. The full account-backed flow under (app)/ stays intact
 * for when Supabase and the AI feedback are switched back on.
 */
export default function PracticePage() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [tavusUrl, setTavusUrl] = React.useState<string | null>(null);
  const [starting, setStarting] = React.useState(false);
  const [ending, setEnding] = React.useState(false);
  const [debrief, setDebrief] = React.useState<TranscriptTurn[] | null>(null);
  const conversationIdRef = React.useRef<string | null>(null);
  // The captured transcript (officer + applicant turns) for the post-call debrief.
  const transcriptRef = React.useRef<TranscriptTurn[]>([]);

  // End the live conversation so it stops billing immediately if the user closes
  // the tab or navigates away without pressing End.
  React.useEffect(() => {
    const endViaBeacon = () => {
      const id = conversationIdRef.current;
      if (!id) return;
      conversationIdRef.current = null;
      const blob = new Blob([JSON.stringify({ conversation_id: id })], { type: "application/json" });
      navigator.sendBeacon("/api/tavus/conversation/end", blob);
    };
    window.addEventListener("pagehide", endViaBeacon);
    return () => {
      window.removeEventListener("pagehide", endViaBeacon);
      endViaBeacon();
    };
  }, []);

  async function beginInterview() {
    const profile = visaProfiles.find((p) => p.id === selectedId);
    if (!profile || starting) return;

    // The button tap is the one user gesture iOS gives us to unlock audio.
    unlockAudio();
    setStarting(true);
    transcriptRef.current = [];

    try {
      const res = await fetch("/api/tavus/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visa_profile_id: profile.id,
          conversation_name: `VisaDrill - ${profile.shortLabel}`,
          conversational_context: `This is a ${profile.label} interview. Conduct a realistic, brisk consular interview for a ${profile.shortLabel} applicant.`,
        }),
      });
      const json = (await res.json()) as {
        data: { conversation_id?: string; conversation_url?: string } | null;
      };
      const url = json.data?.conversation_url;
      // A real Daily room is an https URL; the mock returns a relative path.
      if (url && url.startsWith("http")) {
        conversationIdRef.current = json.data?.conversation_id ?? null;
        setTavusUrl(url);
      } else {
        toast.error("Live interview is off. Set NEXT_PUBLIC_TAVUS_MOCK=false and the Tavus keys.");
        setStarting(false);
      }
    } catch {
      toast.error("Couldn't reach the officer. Try again.");
      setStarting(false);
    }
  }

  async function endInterview() {
    if (ending) return;
    setEnding(true);
    const id = conversationIdRef.current;
    conversationIdRef.current = null;
    if (id) {
      try {
        await fetch("/api/tavus/conversation/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: id }),
        });
      } catch {
        /* best-effort */
      }
    }
    setTavusUrl(null);
    setStarting(false);
    setEnding(false);
    // Show the scored debrief from whatever transcript we captured (may be empty).
    setDebrief(transcriptRef.current);
  }

  if (tavusUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-surface-dark">
        <TavusLiveInterview
          url={tavusUrl}
          maxSeconds={LIVE_MAX_SECONDS}
          ending={ending}
          conversationId={conversationIdRef.current}
          onUtterance={(speaker, text) => {
            transcriptRef.current = [
              ...transcriptRef.current,
              { role: speaker === "applicant" ? "user" : "officer", content: text },
            ];
          }}
          onEnd={endInterview}
        />
      </div>
    );
  }

  if (debrief !== null) {
    return (
      <LiveDebrief
        transcript={debrief}
        onDone={() => {
          setDebrief(null);
          setSelectedId(null);
          transcriptRef.current = [];
        }}
      />
    );
  }

  if (starting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface-dark">
        <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
        <p className="text-sm text-[#6a8aaa]">Connecting you to the officer…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-surface-dark px-5 py-10">
      <div className="w-full max-w-md text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">
          Practice interview
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">Step up to the window.</h1>
        <p className="mb-8 text-sm leading-relaxed text-white/45">
          Pick the visa you are practicing for. The officer is live, asks real questions, and
          won&apos;t coach you. When you are ready, begin.
        </p>

        <div className="mb-8 flex flex-col gap-2.5 text-left">
          {visaProfiles.map((profile) => {
            const active = profile.id === selectedId;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedId(profile.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xs border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-brand-500 bg-brand-950/40"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                )}
              >
                <span className="text-xl" aria-hidden>
                  {profile.flagEmoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{profile.label}</span>
                  <span className="block truncate text-xs text-white/40">{profile.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={beginInterview}
          disabled={!selectedId}
          className="inline-flex items-center justify-center rounded-xs bg-white px-9 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Begin interview
        </button>

        <p className="mt-6 text-[11px] text-white/25">
          No account required ·{" "}
          <Link href="/" className="underline-offset-2 hover:text-white/50 hover:underline">
            Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
