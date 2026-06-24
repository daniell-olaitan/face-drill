"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/layout/navbar";
import { getMockQuestions } from "@/lib/tavus/mock";
import { toast } from "sonner";
import { cn, randomId, formatDuration } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { PhoneOff, Send, ChevronDown, Globe, Mic } from "lucide-react";

const DEMO_QUESTIONS = getMockQuestions("us-b1b2");
const LANGUAGES = ["English", "French", "Spanish", "Portuguese", "Arabic"];

interface DemoMessage {
  id: string;
  speaker: "officer" | "user";
  text: string;
}

function OfficerAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030810]">
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-brand-950/40 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-5 z-10">
        {/* Avatar ring */}
        <div
          className={cn(
            "w-40 h-40 rounded-full border-2 transition-all duration-500 flex items-center justify-center overflow-hidden bg-[#0d1e35]",
            speaking ? "border-brand-500/60" : "border-[#1a2f4a]/60"
          )}
        >
          <svg viewBox="0 0 120 120" fill="none" className="w-36 h-36">
            <ellipse cx="60" cy="42" rx="22" ry="24" fill="#2a4a68" />
            <ellipse cx="60" cy="22" rx="22" ry="10" fill="#162535" />
            <rect x="52" y="62" width="16" height="12" fill="#2a4a68" />
            <path d="M35 80 L60 70 L85 80 L80 120 L40 120Z" fill="#162535" />
            <path d="M57 74 L60 76 L63 74 L60 110Z" fill="#1a2f4a" />
            <path d="M55 70 L60 74 L65 70 L63 68 L57 68Z" fill="#0d1e35" />
            <path d="M35 80 L10 95 L10 120 L40 120Z" fill="#162535" />
            <path d="M85 80 L110 95 L110 120 L80 120Z" fill="#162535" />
          </svg>
        </div>

        {/* Speaking bars - no inline styles */}
        <div className="flex items-end gap-0.5 h-5">
          {speaking ? (
            <>
              <div className="speaking-bar w-0.5 h-2 rounded-full bg-brand-400/80" />
              <div className="speaking-bar w-0.5 h-3 rounded-full bg-brand-400/80 stagger-1" />
              <div className="speaking-bar w-0.5 h-4 rounded-full bg-brand-400/80 stagger-2" />
              <div className="speaking-bar w-0.5 h-3 rounded-full bg-brand-400/80 stagger-3" />
              <div className="speaking-bar w-0.5 h-4 rounded-full bg-brand-400/80 stagger-4" />
              <div className="speaking-bar w-0.5 h-2 rounded-full bg-brand-400/80 stagger-5" />
              <div className="speaking-bar w-0.5 h-3 rounded-full bg-brand-400/80 stagger-6" />
            </>
          ) : (
            <span className="text-[10px] text-[#3a5a7a] font-semibold tracking-widest uppercase">
              Listening
            </span>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-white/80">US Consular Officer</p>
          <p className="text-[11px] text-[#3a5a7a] mt-0.5">American Embassy - Nonimmigrant Visas</p>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [started, setStarted] = React.useState(false);
  const [language, setLanguage] = React.useState("English");
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const [messages, setMessages] = React.useState<DemoMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [officerSpeaking, setOfficerSpeaking] = React.useState(false);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const transcriptRef = React.useRef<HTMLDivElement>(null);
  const startTimeRef = React.useRef<number>(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the latest message in view by scrolling the transcript itself.
  // A no-op when it doesn't overflow, so no phantom scrollbar appears.
  React.useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, officerSpeaking]);

  function startDemo() {
    setStarted(true);
    setFinished(false);
    setMessages([]);
    setQuestionIndex(0);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => setElapsedMs(Date.now() - startTimeRef.current), 1000);
    setOfficerSpeaking(true);
    setTimeout(() => {
      setMessages([{ id: randomId(), speaker: "officer", text: DEMO_QUESTIONS[0] }]);
      setOfficerSpeaking(false);
      setQuestionIndex(1);
    }, 1400);
  }

  function endDemo() {
    if (timerRef.current) clearInterval(timerRef.current);
    setStarted(false);
    setFinished(false);
    setMessages([]);
    setQuestionIndex(0);
    setElapsedMs(0);
  }

  function handleMic() {
    toast("Voice answers are part of the full interview.", {
      description: "Join the waitlist for the real, spoken experience.",
    });
  }

  function handleSend() {
    const text = input.trim();
    if (!text || officerSpeaking) return;

    setInput("");
    setMessages((prev) => [...prev, { id: randomId(), speaker: "user", text }]);

    setOfficerSpeaking(true);
    setTimeout(() => {
      // Out of questions - deliver the closing line, then surface the CTA.
      if (questionIndex >= DEMO_QUESTIONS.length) {
        setMessages((prev) => [
          ...prev,
          { id: randomId(), speaker: "officer", text: "Thank you. That concludes the demonstration." },
        ]);
        setOfficerSpeaking(false);
        window.setTimeout(() => setFinished(true), 1100);
        return;
      }
      const nextQ = DEMO_QUESTIONS[questionIndex];
      setMessages((prev) => [...prev, { id: randomId(), speaker: "officer", text: nextQ }]);
      setQuestionIndex((i) => i + 1);
      setOfficerSpeaking(false);
    }, 1200 + Math.random() * 700);
  }

  return (
    <div className="relative flex flex-col h-screen bg-[#030810] overflow-hidden">

      <Navbar floating />

      {/* ── INTERVIEW AREA ── */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {!started && <OfficerAvatar speaking={officerSpeaking} />}

        {/* Pre-start overlay */}
        {!started && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#030810]/55 backdrop-blur-[2px]">
            <div className="text-center max-w-sm px-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/25 mb-4">
                Live demo · US B-1/B-2
              </p>
              <h1 className="text-[2rem] font-bold text-white tracking-tight leading-[1.1] mb-3">
                Step up to the window.
              </h1>
              <p className="text-sm text-white/40 leading-relaxed mb-10 max-w-75 mx-auto">
                The officer is testing whether you&apos;ll come back. Questions follow real embassy
                patterns and the scrutiny a real officer applies - answer naturally, there&apos;s no script.
              </p>

              <div className="flex items-center justify-center gap-3">
                {/* Language selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLangMenu((v) => !v)}
                    className="flex items-center gap-2 bg-white/6 border border-white/10 text-white/70 hover:text-white rounded-xs px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {language}
                    <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                  </button>
                  {showLangMenu && (
                    <div className="absolute bottom-full mb-2 left-0 bg-[#0d1e35] border border-white/8 rounded-xs overflow-hidden z-30 min-w-35">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-white/5 last:border-0",
                            lang === language
                              ? "text-white font-semibold bg-white/6"
                              : "text-white/50 hover:text-white hover:bg-white/4"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button variant="white" size="lg" onClick={startDemo}>
                  Begin interview
                </Button>
              </div>

              <p className="text-[11px] text-white/20 mt-6">
                No account required
              </p>
            </div>
          </div>
        )}

        {/* Active interview - one connected, centered stage */}
        {started && (
          <div className="absolute inset-0 z-10 flex flex-col">
            {/* HUD */}
            <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 pt-20 pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-black/50 backdrop-blur-sm border border-white/8 rounded-xs px-3 py-1.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] text-white/70 font-medium">Demo session</span>
                  <span className="text-[11px] text-white/35 font-mono tabular-nums ml-1">
                    {formatDuration(elapsedMs)}
                  </span>
                </div>
                <div className="hidden sm:block bg-black/50 backdrop-blur-sm border border-white/8 rounded-xs px-3 py-1.5">
                  <span className="text-[11px] text-white/60 tabular-nums">
                    Question {Math.max(1, Math.min(questionIndex, DEMO_QUESTIONS.length))} of ~{DEMO_QUESTIONS.length}
                  </span>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={endDemo}
                leftIcon={<PhoneOff className="w-3.5 h-3.5" />}
              >
                End
              </Button>
            </div>

            {/* Centered stage - officer, then their words right beneath */}
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6">
              {/* Officer */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div
                  className={cn(
                    "w-28 h-28 rounded-full border-2 transition-all duration-500 flex items-center justify-center overflow-hidden bg-[#0d1e35]",
                    officerSpeaking ? "border-brand-500/60" : "border-[#1a2f4a]/60"
                  )}
                >
                  <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24">
                    <ellipse cx="60" cy="42" rx="22" ry="24" fill="#2a4a68" />
                    <ellipse cx="60" cy="22" rx="22" ry="10" fill="#162535" />
                    <rect x="52" y="62" width="16" height="12" fill="#2a4a68" />
                    <path d="M35 80 L60 70 L85 80 L80 120 L40 120Z" fill="#162535" />
                    <path d="M57 74 L60 76 L63 74 L60 110Z" fill="#1a2f4a" />
                    <path d="M55 70 L60 74 L65 70 L63 68 L57 68Z" fill="#0d1e35" />
                    <path d="M35 80 L10 95 L10 120 L40 120Z" fill="#162535" />
                    <path d="M85 80 L110 95 L110 120 L80 120Z" fill="#162535" />
                  </svg>
                </div>
                <div className="flex items-end gap-0.5 h-4">
                  {officerSpeaking ? (
                    <>
                      <div className="speaking-bar w-0.5 h-2 rounded-full bg-brand-400/80" />
                      <div className="speaking-bar w-0.5 h-3 rounded-full bg-brand-400/80 stagger-2" />
                      <div className="speaking-bar w-0.5 h-4 rounded-full bg-brand-400/80 stagger-3" />
                      <div className="speaking-bar w-0.5 h-2 rounded-full bg-brand-400/80 stagger-4" />
                      <div className="speaking-bar w-0.5 h-3 rounded-full bg-brand-400/80 stagger-6" />
                    </>
                  ) : (
                    <span className="text-[10px] text-[#3a5a7a] font-semibold tracking-widest uppercase">
                      Listening
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/80">US Consular Officer</p>
                  <p className="text-[11px] text-[#3a5a7a]">American Embassy - Nonimmigrant Visas</p>
                </div>
              </div>

              {/* Transcript - directly under the officer */}
              <div
                ref={transcriptRef}
                data-lenis-prevent
                className="mt-8 w-full max-w-xl flex flex-col gap-2 overflow-y-auto max-h-[26vh] px-1"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={cn(
                      "max-w-[80%] px-3.5 py-2.5 text-sm rounded-xs",
                      msg.speaker === "officer"
                        ? "bg-[#0d1e35]/90 text-[#b8cde0] self-start border border-white/7"
                        : "bg-brand-700/90 text-white self-end"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-[9px] font-semibold uppercase tracking-[0.16em] mb-1",
                        msg.speaker === "officer" ? "text-[#3a5a7a]" : "text-white/50"
                      )}
                    >
                      {msg.speaker === "officer" ? "Officer" : "You"}
                    </span>
                    {msg.text}
                  </motion.div>
                ))}
                {officerSpeaking && (
                  <div className="bg-[#0d1e35]/90 border border-white/7 rounded-xs px-3.5 py-2.5 flex items-center gap-1 self-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a6a8a] animate-bounce-subtle" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a6a8a] animate-bounce-subtle stagger-3" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a6a8a] animate-bounce-subtle stagger-6" />
                  </div>
                )}
              </div>
            </div>

            {/* Input - docked at the foot of the stage */}
            <div className="shrink-0 px-5 pb-6 pt-3">
              <div className="w-full max-w-xl mx-auto flex items-center gap-1.5 bg-[#0d1e35]/90 border border-white/8 rounded-xs pl-2 pr-2 py-1.5 transition-colors focus-within:border-brand-500/50">
                <button
                  type="button"
                  onClick={handleMic}
                  aria-label="Voice answer"
                  title="Voice answers are part of the full version"
                  className="w-9 h-9 rounded-xs flex items-center justify-center text-[#3a5a7a] hover:text-white/80 hover:bg-white/4 transition-colors shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your response..."
                  rows={1}
                  disabled={officerSpeaking}
                  className="flex-1 min-w-0 bg-transparent text-sm text-[#b8cde0] placeholder:text-[#2e4a68] focus:outline-none resize-none disabled:opacity-50 py-1.5 leading-relaxed self-center"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || officerSpeaking}
                  aria-label="Send response"
                  className="w-9 h-9 rounded-xs bg-brand-600 hover:bg-brand-700 flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none shrink-0"
                >
                  <Send className="w-4 h-4 text-white" aria-hidden />
                </button>
              </div>
              <p className="text-[10px] text-white/20 text-center mt-2">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {/* End-of-demo conversion overlay */}
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-[#030810]/90 backdrop-blur-sm px-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                className="text-center max-w-md"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/25 mb-4">
                  End of preview
                </p>
                <h2 className="text-[1.75rem] sm:text-3xl font-bold text-white tracking-tight leading-[1.1] mb-3">
                  That&apos;s the window.
                </h2>
                <p className="text-sm text-white/45 leading-relaxed mb-8 max-w-sm mx-auto">
                  In the full version, that exchange is scored across the four pillars an officer weighs - with a
                  verdict and the exact lines to fix. This preview just lets you feel the room.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/#waitlist" className={buttonVariants({ variant: "white", size: "lg" })}>
                    Join the waitlist
                  </Link>
                  <button
                    type="button"
                    onClick={startDemo}
                    className="text-white/50 hover:text-white text-sm font-medium transition-colors px-3 py-2.5"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User camera placeholder */}
        {started && (
        <div className="absolute bottom-4 right-4 w-24 h-16 rounded-xs bg-black/40 backdrop-blur-sm border border-white/7 hidden lg:flex items-center justify-center z-30">
          <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>
        )}
      </div>

      {/* ── BOTTOM INFO BAR ── */}
      <div className="bg-[#030810] border-t border-white/6 px-5 py-3.5 text-center shrink-0 z-20">
        <p className="text-[12px] text-white/25">
          This is a preview.{" "}
          <Link href="/#waitlist" className="text-white/50 font-semibold hover:text-white/80 transition-colors underline-offset-2 hover:underline">
            Join the waitlist
          </Link>{" "}
          for full access and real-time AI feedback when we launch.
        </p>
      </div>

    </div>
  );
}
