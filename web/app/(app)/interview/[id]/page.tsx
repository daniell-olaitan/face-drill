"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { getMockQuestions } from "@/lib/tavus/mock";
import { getVisaProfile } from "@/lib/visa-profiles";
import { cn, randomId, formatDuration } from "@/lib/utils";
import { Mic, MicOff, PhoneOff, Send, Loader2 } from "lucide-react";
import { TavusLiveInterview } from "@/components/interview/tavus-live-interview";
import { unlockAudio } from "@/lib/audio";
import type { Message, InterviewSession } from "@/types";

// The real video officer is used ONLY when Tavus is explicitly switched on
// (NEXT_PUBLIC_TAVUS_MOCK=false). Default = mock scripted interview, zero cost.
const TAVUS_LIVE = process.env.NEXT_PUBLIC_TAVUS_MOCK === "false";

// Visible countdown for the live interview; the call auto-ends at zero. Mirror of
// the max_call_duration set in app/api/tavus/conversation/route.ts.
const LIVE_MAX_SECONDS = 120;

interface PageProps {
  params: Promise<{ id: string }>;
}

type InterviewPhase = "loading" | "briefing" | "active" | "ending";

function OfficerAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-[#0f1923] via-[#0d1117] to-[#0a1520]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-900 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className={cn(
          "w-28 h-28 rounded-full border-4 transition-all duration-300 flex items-center justify-center overflow-hidden bg-[#1a2d45]",
          speaking ? "border-brand-500 shadow-glow-lg" : "border-[#1e3a5f]"
        )}>
          <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
            <circle cx="40" cy="30" r="16" fill="#2d4a6a" />
            <path d="M12 72c0-15.464 12.536-28 28-28s28 12.536 28 28" fill="#2d4a6a" />
            {/* Simple tie */}
            <path d="M38 46 l-3 14 l5 4 l5-4 l-3-14Z" fill="#1a2d45" />
            <rect x="36" y="42" width="8" height="6" rx="2" fill="#2d4a6a" />
          </svg>
        </div>

        {/* Speaking indicator */}
        {speaking ? (
          <div className="flex items-end gap-0.5 h-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="eq-bar w-1 rounded-full bg-brand-400" />
            ))}
          </div>
        ) : (
          <div className="h-5 flex items-center">
            <span className="text-[11px] text-[#4a6a8a] font-medium tracking-wider uppercase">
              Listening...
            </span>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm font-semibold text-white">Consular Officer</p>
          <p className="text-xs text-[#4a6a8a]">US Embassy</p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isOfficer = message.speaker === "officer";
  return (
    <div className={cn("flex gap-2.5", isOfficer ? "justify-start" : "justify-end")}>
      {isOfficer && (
        <div className="w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0 mt-0.5 border border-[#2d4a6a]">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <circle cx="10" cy="8" r="4" fill="#4a6a8a" />
            <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" fill="#4a6a8a" />
          </svg>
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isOfficer
            ? "bg-[#1a2d45] text-[#c8d8e8] rounded-tl-sm"
            : "bg-brand-600 text-white rounded-tr-sm"
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

export default function InterviewPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [session, setSession] = React.useState<InterviewSession | null>(null);
  const [phase, setPhase] = React.useState<InterviewPhase>("loading");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [officerSpeaking, setOfficerSpeaking] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [mockQuestions, setMockQuestions] = React.useState<string[]>([]);
  const [ending, setEnding] = React.useState(false);
  const [tavusUrl, setTavusUrl] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const startTimeRef = React.useRef<number>(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  // Live Tavus conversation id - held in a ref so the tab-close handler reads
  // the latest value without re-subscribing.
  const tavusConversationIdRef = React.useRef<string | null>(null);

  // Resolve params
  React.useEffect(() => {
    params.then(({ id }) => setSessionId(id));
  }, [params]);

  // Load session
  React.useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((json: { data: InterviewSession | null; error: unknown }) => {
        if (json.data) {
          setSession(json.data);
          const questions = getMockQuestions(json.data.visa_profile_id);
          setMockQuestions(questions);
          setPhase("briefing");
        } else {
          toast.error("Session not found.");
          router.push("/dashboard");
        }
      })
      .catch(() => {
        toast.error("Failed to load session.");
        router.push("/dashboard");
      });
  }, [sessionId, router]);

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer
  React.useEffect(() => {
    if (phase !== "active") return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Tab title while a session is live
  React.useEffect(() => {
    if (phase !== "active") return;
    const previous = document.title;
    document.title = "🎙️ Session in progress · VisaDrill";
    return () => {
      document.title = previous;
    };
  }, [phase]);

  // Safety net: if the user closes the tab or navigates away mid-call without
  // clicking "End Interview", end the Tavus conversation so it stops billing
  // immediately rather than running to the idle/duration cap.
  React.useEffect(() => {
    if (!TAVUS_LIVE) return;
    const endViaBeacon = () => {
      const id = tavusConversationIdRef.current;
      if (!id) return;
      tavusConversationIdRef.current = null;
      const blob = new Blob([JSON.stringify({ conversation_id: id })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/tavus/conversation/end", blob);
    };
    window.addEventListener("pagehide", endViaBeacon);
    return () => {
      window.removeEventListener("pagehide", endViaBeacon);
      endViaBeacon(); // also fire on SPA unmount (e.g. browser back)
    };
  }, []);

  function addMessage(speaker: Message["speaker"], text: string): Message {
    const msg: Message = {
      id: randomId(),
      session_id: sessionId!,
      speaker,
      text,
      timestamp_ms: Date.now() - startTimeRef.current,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);

    if (sessionId) {
      fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speaker: msg.speaker,
          text: msg.text,
          timestamp_ms: msg.timestamp_ms,
        }),
      }).catch(() => {});
    }

    return msg;
  }

  async function startInterview() {
    if (!session || !sessionId) return;

    // This runs inside the "I'm ready" tap, the one user gesture iOS gives us to
    // unlock audio so the officer's voice can autoplay once the call connects.
    unlockAudio();

    await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress", started_at: new Date().toISOString() }),
    });

    setPhase("active");

    // Real video officer - create the Tavus conversation and embed it.
    if (TAVUS_LIVE) {
      try {
        const res = await fetch("/api/tavus/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visa_profile_id: session.visa_profile_id,
            context: session.context,
            conversation_name: `VisaDrill - ${session.visa_profile_id}`,
          }),
        });
        const json = (await res.json()) as {
          data: { conversation_id?: string; conversation_url?: string } | null;
        };
        if (json.data?.conversation_url) {
          setTavusUrl(json.data.conversation_url);
          if (json.data.conversation_id) {
            tavusConversationIdRef.current = json.data.conversation_id;
            // Persist so the conversation can also be reconciled server-side.
            fetch(`/api/sessions/${sessionId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tavus_conversation_id: json.data.conversation_id }),
            }).catch(() => {});
          }
        } else {
          toast.error("Couldn't reach the officer. Returning to dashboard.");
          router.push("/dashboard");
        }
      } catch {
        toast.error("Couldn't reach the officer. Returning to dashboard.");
        router.push("/dashboard");
      }
      return;
    }

    // Mock scripted officer (default - no Tavus, no cost).
    setOfficerSpeaking(true);
    setTimeout(() => {
      const firstQuestion = mockQuestions[0] ?? "Good morning. What is the purpose of your visit?";
      addMessage("officer", firstQuestion);
      setOfficerSpeaking(false);
      setQuestionIndex(1);
    }, 1200);
  }

  async function handleSendMessage() {
    const text = input.trim();
    if (!text || officerSpeaking) return;

    setInput("");
    addMessage("applicant", text);

    // Officer formulates next question
    setOfficerSpeaking(true);
    const delay = 1200 + Math.random() * 800;

    setTimeout(() => {
      if (questionIndex < mockQuestions.length) {
        addMessage("officer", mockQuestions[questionIndex]);
        setQuestionIndex((i) => i + 1);
      } else {
        addMessage(
          "officer",
          "Thank you. That concludes our interview. You may end the session now."
        );
      }
      setOfficerSpeaking(false);
    }, delay);
  }

  // Tell Tavus to end the live conversation so it stops billing immediately.
  // Best-effort: the idle timeout + duration cap are the backstop if it fails.
  async function endTavusConversation() {
    const id = tavusConversationIdRef.current;
    if (!id) return;
    tavusConversationIdRef.current = null; // guard against a double-end from the unmount net
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

  async function handleEndInterview() {
    if (!sessionId || ending) return;
    setEnding(true);

    if (timerRef.current) clearInterval(timerRef.current);
    await endTavusConversation();

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString() }),
      });

      const feedbackRes = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "POST",
      });

      if (feedbackRes.ok) {
        router.push(`/feedback/${sessionId}`);
      } else {
        toast.error("Could not generate feedback. Returning to dashboard.");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Returning to dashboard.");
      router.push("/dashboard");
    }
  }

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  if (phase === "briefing" && session) {
    const profile = getVisaProfile(session.visa_profile_id);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark px-4 overflow-hidden">
        {/* Atmospheric backdrop - the waiting room before something important */}
        <Image
          src="/images/Candid_shot_of_a_West_202606110016.jpeg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-25 grayscale pointer-events-none select-none"
        />
        <div aria-hidden className="absolute inset-0 bg-surface-dark/82" />

        <div className="relative z-10 max-w-md w-full text-center animate-fade-in">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35 mb-7">
            {profile?.shortLabel ?? "Your session"} · Pre-interview
          </p>
          <h2 className="text-3xl sm:text-[2.5rem] font-bold text-white tracking-tight leading-[1.12] mb-6">
            Real interviews are<br />uncomfortable.<br />This one should be too.
          </h2>
          <p className="text-base text-white/55 leading-relaxed mb-10 max-w-sm mx-auto">
            Take a breath. The officer moves fast and won&apos;t coach you - exactly like the
            window. When you&apos;re ready, they&apos;re waiting.
          </p>
          <button
            type="button"
            onClick={startInterview}
            className="inline-flex items-center justify-center bg-white text-black hover:bg-white/90 font-semibold rounded-xs px-9 py-3.5 text-sm transition-colors"
          >
            I&apos;m ready
          </button>
        </div>
      </div>
    );
  }

  // Real video officer (Tavus live) - full-screen embed, or a connecting state.
  if (phase === "active" && TAVUS_LIVE) {
    return (
      <div className="fixed inset-0 z-50 bg-surface-dark">
        {tavusUrl ? (
          <TavusLiveInterview
            url={tavusUrl}
            maxSeconds={LIVE_MAX_SECONDS}
            ending={ending}
            conversationId={tavusConversationIdRef.current}
            onUtterance={addMessage}
            onEnd={handleEndInterview}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
            <p className="text-sm text-[#6a8aaa]">Connecting you to the officer…</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-surface-dark">
      {/* Officer video panel */}
      <div className="relative flex-1 min-w-0 hidden sm:flex">
        <OfficerAvatar speaking={officerSpeaking} />

        {/* Counter + Timer + End button overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <div className="bg-surface-dark/70 backdrop-blur-sm border border-[#1e3a5f] rounded-lg px-3 py-1.5">
            <span className="text-xs text-[#6a9ac4] tabular-nums">
              Question {Math.max(1, Math.min(questionIndex, mockQuestions.length))} of ~{mockQuestions.length}
            </span>
          </div>
          <div className="bg-surface-dark/70 backdrop-blur-sm border border-[#1e3a5f] rounded-lg px-3 py-1.5">
            <span className="text-xs font-mono text-[#6a9ac4] tabular-nums">
              {formatDuration(elapsedMs)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleEndInterview}
            disabled={ending}
            className="bg-danger hover:bg-red-600 text-white font-semibold rounded-lg px-4 py-1.5 text-sm transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {ending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PhoneOff className="w-3.5 h-3.5" />
            )}
            End Interview
          </button>
        </div>
      </div>

      {/* Chat panel */}
      <div className="w-full sm:w-96 flex flex-col border-l border-[#1e3a5f] bg-[#0d1117]">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e3a5f]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-[#c8d8e8]">
              Question {Math.max(1, Math.min(questionIndex, mockQuestions.length))} of ~{mockQuestions.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleEndInterview}
            disabled={ending}
            className="sm:hidden bg-danger hover:bg-red-600 text-white text-xs font-semibold rounded-lg px-3 py-1 transition-colors disabled:opacity-60 flex items-center gap-1"
          >
            {ending ? <Loader2 className="w-3 h-3 animate-spin" /> : "End"}
          </button>
        </div>

        {/* Messages */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3"
        >
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-[#4a6a8a] text-center">
                The officer will speak first...
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {officerSpeaking && (
            <div className="flex gap-2.5 items-end">
              <div className="w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0 border border-[#2d4a6a]">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                  <circle cx="10" cy="8" r="4" fill="#4a6a8a" />
                  <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" fill="#4a6a8a" />
                </svg>
              </div>
              <div className="bg-[#1a2d45] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="typing-dot w-1.5 h-1.5 rounded-full bg-[#4a6a8a] animate-bounce-subtle"
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#1e3a5f]">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-[#1a2d45] border border-[#2d4a6a] rounded-xl px-3 py-2.5 flex items-end gap-2 transition-colors focus-within:border-brand-500/60">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your answer..."
                rows={1}
                disabled={officerSpeaking || ending}
                className="flex-1 bg-transparent text-sm text-[#c8d8e8] placeholder:text-[#4a6a8a] focus:outline-none resize-none leading-relaxed disabled:opacity-50 max-h-25 overflow-y-auto"
              />
            </div>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!input.trim() || officerSpeaking || ending}
              aria-label="Send answer"
              className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <Send className="w-4 h-4 text-white" aria-hidden />
            </button>
          </div>
          <p className="text-[10px] text-[#4a6a8a] mt-1.5 px-1">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
