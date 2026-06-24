"use client";

import * as React from "react";
import type { DailyCall } from "@daily-co/daily-js";
import { Mic, MicOff, Video, VideoOff, Volume2, Loader2, PhoneOff, Keyboard, Send } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

interface TavusLiveInterviewProps {
  /** The Tavus conversation_url to join (a Daily room URL). */
  url: string;
  /** Visible interview length; the countdown auto-ends the call at zero. */
  maxSeconds: number;
  /** Whether Tavus is recording the call (shows a passive REC indicator). */
  recording?: boolean;
  /** Whether the parent is already ending the call (drives the End button). */
  ending: boolean;
  /** Each finalized utterance, so the parent can persist it for feedback. */
  onUtterance: (speaker: "officer" | "applicant", text: string) => void;
  /** The Tavus conversation id, needed to send typed answers into the call. */
  conversationId?: string | null;
  /** End the interview (user pressed End, or the countdown elapsed, or it failed). */
  onEnd: () => void;
}

/**
 * Renders the Tavus interview with the Daily SDK (not an iframe) so we own the
 * layout: the officer fills the frame and the applicant's self-view is a small
 * PiP we size ourselves, fully responsive on mobile. We also manage audio, which
 * iOS may block until a tap, hence the "tap to hear the officer" fallback, and we
 * surface live captions while forwarding each utterance to the parent so the
 * post-interview Claude feedback has a transcript to score.
 */
export function TavusLiveInterview({
  url,
  maxSeconds,
  recording = false,
  ending,
  onUtterance,
  conversationId,
  onEnd,
}: TavusLiveInterviewProps) {
  const [status, setStatus] = React.useState<"connecting" | "live">("connecting");
  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(null);
  const [micOn, setMicOn] = React.useState(true);
  const [camOn, setCamOn] = React.useState(true);
  const [audioBlocked, setAudioBlocked] = React.useState(false);
  const [captionsOn, setCaptionsOn] = React.useState(true);
  const [caption, setCaption] = React.useState<{ role: "officer" | "applicant"; text: string } | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  const callRef = React.useRef<DailyCall | null>(null);
  const officerVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const audioElsRef = React.useRef<HTMLAudioElement[]>([]);
  const startedRef = React.useRef(false);
  const captionTimerRef = React.useRef<number | null>(null);

  // Keep the latest callbacks reachable from the one-shot join effect below
  // without making it re-run (which would create a second call object).
  const onUtteranceRef = React.useRef(onUtterance);
  const onEndRef = React.useRef(onEnd);
  React.useEffect(() => {
    onUtteranceRef.current = onUtterance;
    onEndRef.current = onEnd;
  });

  const playAudio = React.useCallback(() => {
    let blocked = false;
    for (const el of audioElsRef.current) {
      el.play().catch(() => {
        blocked = true;
      });
    }
    setAudioBlocked(blocked);
  }, []);

  React.useEffect(() => {
    if (startedRef.current) return; // guard against StrictMode double-invoke in dev
    startedRef.current = true;
    let cancelled = false;

    const cleanup = async () => {
      if (captionTimerRef.current !== null) window.clearTimeout(captionTimerRef.current);
      for (const el of audioElsRef.current) {
        el.srcObject = null;
        el.remove();
      }
      audioElsRef.current = [];
      const call = callRef.current;
      callRef.current = null;
      if (call) {
        try {
          await call.leave();
        } catch {}
        try {
          call.destroy();
        } catch {}
      }
    };

    const attach = (track: MediaStreamTrack, isLocal: boolean) => {
      if (track.kind === "video") {
        const el = isLocal ? localVideoRef.current : officerVideoRef.current;
        if (el) el.srcObject = new MediaStream([track]);
        if (!isLocal) setStatus("live");
      } else if (track.kind === "audio" && !isLocal) {
        const el = document.createElement("audio");
        el.autoplay = true;
        el.srcObject = new MediaStream([track]);
        document.body.appendChild(el);
        audioElsRef.current.push(el);
        el.play().catch(() => setAudioBlocked(true));
      }
    };

    (async () => {
      // Load the SDK lazily so it never runs during server rendering.
      let DailyIframe: typeof import("@daily-co/daily-js").default;
      try {
        DailyIframe = (await import("@daily-co/daily-js")).default;
      } catch {
        if (!cancelled) onEndRef.current();
        return;
      }
      if (cancelled) return;

      let call: DailyCall;
      try {
        call = DailyIframe.createCallObject({ subscribeToTracksAutomatically: true });
      } catch {
        if (!cancelled) onEndRef.current();
        return;
      }
      callRef.current = call;

      call.on("track-started", (ev) => {
        if (ev?.track) attach(ev.track, Boolean(ev.participant?.local));
      });

      // Live captions: Tavus streams spoken text over the data channel. We show
      // it and forward each turn to the parent to build the feedback transcript.
      call.on("app-message", (ev) => {
        const msg = ev?.data as
          | { event_type?: string; properties?: { role?: string; speech?: string; text?: string } }
          | undefined;
        if (!msg || !String(msg.event_type ?? "").includes("utterance")) return;
        const props = msg.properties ?? {};
        const text =
          typeof props.speech === "string"
            ? props.speech
            : typeof props.text === "string"
              ? props.text
              : "";
        if (!text.trim()) return;
        const speaker: "officer" | "applicant" = props.role === "user" ? "applicant" : "officer";
        setCaption({ role: speaker, text });
        onUtteranceRef.current(speaker, text);
        if (captionTimerRef.current !== null) window.clearTimeout(captionTimerRef.current);
        captionTimerRef.current = window.setTimeout(() => setCaption(null), 6000);
      });

      try {
        await call.join({ url });
      } catch {
        await cleanup();
        if (!cancelled) onEndRef.current();
      }
    })();

    return () => {
      cancelled = true;
      void cleanup();
    };
  }, [url]);

  // Start the countdown only once the officer is live, so the wait while they
  // "take their seat" does not eat into the interview (or your Tavus minutes).
  React.useEffect(() => {
    if (status === "live" && secondsLeft === null) setSecondsLeft(maxSeconds);
  }, [status, secondsLeft, maxSeconds]);

  // Countdown: ends the interview when it elapses.
  React.useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      onEndRef.current();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const toggleMic = () => {
    const call = callRef.current;
    if (!call) return;
    call.setLocalAudio(!micOn);
    setMicOn((m) => !m);
  };

  const toggleCam = () => {
    const call = callRef.current;
    if (!call) return;
    call.setLocalVideo(!camOn);
    setCamOn((c) => !c);
  };

  const toggleChat = () => {
    setChatOpen((open) => {
      const next = !open;
      // Typing instead of speaking: mute the mic so it isn't also answering.
      if (next && micOn) {
        callRef.current?.setLocalAudio(false);
        setMicOn(false);
      }
      return next;
    });
  };

  // Send a typed answer into the live conversation as if the applicant spoke it.
  const sendTyped = () => {
    const text = draft.trim();
    const call = callRef.current;
    if (!text || !call || !conversationId) return;
    call.sendAppMessage(
      {
        message_type: "conversation",
        event_type: "conversation.respond",
        conversation_id: conversationId,
        properties: { text },
      },
      "*",
    );
    // Speech-to-text won't capture typed text, so record it ourselves for the
    // transcript (and show it as a caption).
    onUtteranceRef.current("applicant", text);
    setCaption({ role: "applicant", text });
    if (captionTimerRef.current !== null) window.clearTimeout(captionTimerRef.current);
    captionTimerRef.current = window.setTimeout(() => setCaption(null), 6000);
    setDraft("");
  };

  const lowTime = secondsLeft !== null && secondsLeft <= 30;
  const displayMs = (secondsLeft ?? maxSeconds) * 1000;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#030810]">
      {/* Officer */}
      <video
        ref={officerVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 h-full w-full bg-black object-cover"
      />

      {status === "connecting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#030810]">
          <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
          <p className="text-sm text-[#6a8aaa]">The officer is taking their seat…</p>
        </div>
      )}

      {/* iOS audio unlock */}
      {audioBlocked && (
        <button
          type="button"
          onClick={playAudio}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/60 text-white"
        >
          <Volume2 className="h-7 w-7" />
          <span className="text-sm font-medium">Tap to hear the officer</span>
        </button>
      )}

      {/* Top HUD: live pill + timer, optional REC, End button */}
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-medium text-white/70">Live interview</span>
            <span
              className={cn(
                "ml-1 font-mono text-[11px] tabular-nums",
                lowTime ? "text-danger" : "text-white/40",
              )}
            >
              {formatDuration(displayMs)}
            </span>
          </div>
          {recording && status === "live" && (
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Rec</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onEnd}
          disabled={ending}
          className="flex items-center gap-1.5 rounded-lg bg-danger px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
        >
          {ending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneOff className="h-3.5 w-3.5" />}
          End Interview
        </button>
      </div>

      {/* Live captions */}
      {captionsOn && caption && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 z-10 flex justify-center pl-4 pr-28 sm:px-4",
            chatOpen ? "bottom-36" : "bottom-20",
          )}
        >
          <p className="max-h-32 max-w-2xl overflow-y-auto rounded-lg bg-black/70 px-3 py-1.5 text-center text-sm leading-snug text-white">
            <span className="font-semibold text-white/60">
              {caption.role === "applicant" ? "You: " : "Officer: "}
            </span>
            {caption.text}
          </p>
        </div>
      )}

      {/* Self-view PiP (hidden while typing to free the bottom area) */}
      <div
        className={cn(
          "absolute bottom-4 right-4 z-10 w-24 overflow-hidden rounded-xl border border-white/20 bg-black/70 sm:w-32",
          chatOpen && "hidden",
        )}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={cn("aspect-[3/4] w-full scale-x-[-1] object-cover sm:aspect-square", !camOn && "hidden")}
        />
        {!camOn && (
          <div className="flex aspect-[3/4] items-center justify-center sm:aspect-square">
            <VideoOff className="h-4 w-4 text-white/60" />
          </div>
        )}
      </div>

      {/* Controls */}
      {status === "live" && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-danger" />}
          </button>
          <button
            type="button"
            onClick={toggleCam}
            aria-label={camOn ? "Turn camera off" : "Turn camera on"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-danger" />}
          </button>
          <button
            type="button"
            onClick={() => setCaptionsOn((c) => !c)}
            aria-label={captionsOn ? "Hide captions" : "Show captions"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            <span className={cn(!captionsOn && "opacity-40")}>CC</span>
          </button>
          {conversationId && (
            <button
              type="button"
              onClick={toggleChat}
              aria-label={chatOpen ? "Close typing" : "Type instead of speaking"}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-white backdrop-blur transition-colors",
                chatOpen ? "bg-brand-600 hover:bg-brand-700" : "bg-black/60 hover:bg-black/80",
              )}
            >
              <Keyboard className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Type-instead-of-speaking input */}
      {chatOpen && status === "live" && (
        <div className="absolute bottom-20 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4">
          <div className="flex items-end gap-2 rounded-xl border border-white/15 bg-[#0d1e35]/95 px-2 py-1.5 backdrop-blur focus-within:border-brand-500/60">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendTyped();
                }
              }}
              placeholder="Type your answer…"
              rows={1}
              className="flex-1 resize-none bg-transparent px-1 py-1.5 text-sm leading-relaxed text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={sendTyped}
              disabled={!draft.trim()}
              aria-label="Send answer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
