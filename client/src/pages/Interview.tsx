/* Tavus CVI runs on Daily (WebRTC). We use the @daily-co/daily-js *call object*
   (headless) so we keep FaceDrill's custom two-pane layout: the Tavus replica's
   video fills the top pane, the local camera fills the bottom pane. The replica
   joins the Daily room as a remote participant; its tracks arrive via
   "track-started". Daily call objects do not auto-play remote audio, so we attach
   audio tracks to <audio> elements ourselves. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import { startSession, endSession, getApplicantId, getLanguage } from "../lib/api";

type Status =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "live" }
  | { kind: "ended" }
  | { kind: "error"; message: string; canRetry: boolean };

const NO_TRACK_TIMEOUT_MS = 15000;

export default function Interview() {
  const { visaType = "" } = useParams();

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [micMuted, setMicMuted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const statusRef = useRef<Status>(status);
  statusRef.current = status;

  const avatarContainerRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const callRef = useRef<DailyCall | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const audioElsRef = useRef<HTMLAudioElement[]>([]);
  const gotRemoteVideoRef = useRef(false);
  const noTrackTimerRef = useRef<number | null>(null);

  const cleanup = useCallback(async () => {
    if (noTrackTimerRef.current !== null) {
      window.clearTimeout(noTrackTimerRef.current);
      noTrackTimerRef.current = null;
    }

    for (const el of audioElsRef.current) {
      el.srcObject = null;
      el.remove();
    }
    audioElsRef.current = [];

    if (avatarContainerRef.current) {
      avatarContainerRef.current.innerHTML = "";
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    const conversationId = conversationIdRef.current;
    conversationIdRef.current = null;

    const call = callRef.current;
    callRef.current = null;
    if (call) {
      try {
        await call.leave();
      } catch {}
      try {
        await call.destroy();
      } catch {}
    }
    if (conversationId) {
      void endSession(conversationId);
    }

    gotRemoteVideoRef.current = false;
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => {
      void cleanup();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      void cleanup();
    };
  }, [cleanup]);

  const attachTrack = useCallback(
    (track: MediaStreamTrack, isLocal: boolean) => {
      if (isLocal) {
        if (track.kind === "video" && localVideoRef.current) {
          localVideoRef.current.srcObject = new MediaStream([track]);
        }
        return; // never play back the local mic
      }

      if (track.kind === "video") {
        const container = avatarContainerRef.current;
        if (!container) return;
        const el = document.createElement("video");
        el.srcObject = new MediaStream([track]);
        el.autoplay = true;
        el.playsInline = true;
        el.muted = true; // audio comes through the separate <audio> element
        el.style.cssText = "width:100%;height:100%;object-fit:cover;background:#000";
        container.innerHTML = "";
        container.appendChild(el);
        gotRemoteVideoRef.current = true;
        setStatus({ kind: "live" });
      } else if (track.kind === "audio") {
        const el = document.createElement("audio");
        el.srcObject = new MediaStream([track]);
        el.autoplay = true;
        document.body.appendChild(el);
        audioElsRef.current.push(el);
        void el.play().catch(() => {
          /* autoplay policy: audio resumes after the next user gesture */
        });
      }
    },
    []
  );

  const onStart = useCallback(async () => {
    await cleanup(); // Daily forbids two call objects; ensure the old one is gone
    setStatus({ kind: "connecting" });
    gotRemoteVideoRef.current = false;

    let session: Awaited<ReturnType<typeof startSession>>;
    try {
      session = await startSession(visaType, {
        language: getLanguage(),
        applicantId: getApplicantId(),
      });
    } catch {
      setStatus({
        kind: "error",
        message: "Couldn't start the session. Please try again in a moment.",
        canRetry: true,
      });
      return;
    }
    conversationIdRef.current = session.conversation_id;
    setConversationId(session.conversation_id);

    let call: DailyCall;
    try {
      call = DailyIframe.createCallObject({ subscribeToTracksAutomatically: true });
    } catch (err) {
      console.error("[FD-Daily] createCallObject failed", err);
      setStatus({ kind: "error", message: "Could not initialize the call.", canRetry: true });
      return;
    }
    callRef.current = call;

    call
      .on("track-started", (ev) => {
        if (!ev?.track) return;
        console.log("[FD-Daily] track-started", ev.participant?.local ? "local" : "remote", ev.track.kind);
        attachTrack(ev.track, Boolean(ev.participant?.local));
      })
      .on("participant-joined", (ev) =>
        console.log("[FD-Daily] participant-joined", ev?.participant?.user_name)
      )
      .on("participant-left", (ev) =>
        console.log("[FD-Daily] participant-left", ev?.participant?.user_name)
      )
      .on("left-meeting", () => {
        console.log("[FD-Daily] left-meeting");
      })
      .on("camera-error", (ev) => {
        console.warn("[FD-Daily] camera-error", ev);
        setStatus({
          kind: "error",
          message:
            "FaceDrill needs microphone and camera access. Please allow access and try again.",
          canRetry: true,
        });
      })
      .on("error", (ev) => {
        console.error("[FD-Daily] error", ev);
        if (statusRef.current.kind !== "ended") {
          setStatus({ kind: "error", message: "The connection dropped. Tap Retry to reconnect.", canRetry: true });
        }
      });

    try {
      await call.join({ url: session.conversation_url });
      console.log("[FD-Daily] joined", session.conversation_url);
    } catch (err) {
      console.error("[FD-Daily] join failed", err);
      await cleanup();
      setStatus({ kind: "error", message: "The connection dropped. Tap Retry to reconnect.", canRetry: true });
      return;
    }

    noTrackTimerRef.current = window.setTimeout(() => {
      if (
        !gotRemoteVideoRef.current &&
        statusRef.current.kind !== "ended" &&
        statusRef.current.kind !== "error"
      ) {
        setStatus({
          kind: "error",
          message:
            "The interviewer isn't responding. This can happen if your Tavus account is out of credits or the service is busy. Please check your balance or try again.",
          canRetry: true,
        });
      }
    }, NO_TRACK_TIMEOUT_MS);
  }, [attachTrack, cleanup, visaType]);

  const onEnd = useCallback(async () => {
    await cleanup();
    setStatus({ kind: "ended" });
  }, [cleanup]);

  const onToggleMute = useCallback(async () => {
    const call = callRef.current;
    if (!call) return;
    const next = !micMuted;
    try {
      call.setLocalAudio(!next); // setLocalAudio(true) = mic on
      setMicMuted(next);
    } catch (err) {
      console.error("[FD-Daily] toggle mute failed", err);
    }
  }, [micMuted]);

  const statusLabel = (() => {
    switch (status.kind) {
      case "idle":
        return "Idle";
      case "connecting":
        return "Connecting…";
      case "live":
        return "Live";
      case "ended":
        return "Ended";
      case "error":
        return `Error: ${status.message}`;
    }
  })();

  const statusColor = (() => {
    switch (status.kind) {
      case "live":
        return "bg-emerald-700/40 border-emerald-500/60 text-emerald-100";
      case "connecting":
        return "bg-amber-700/40 border-amber-500/60 text-amber-100";
      case "error":
        return "bg-red-800/50 border-red-500/60 text-red-100";
      default:
        return "bg-neutral-800 border-neutral-700 text-neutral-300";
    }
  })();

  const showStartOverlay = status.kind === "idle" || status.kind === "ended";
  const showConnectingOverlay = status.kind === "connecting";

  return (
    <div className="h-screen w-screen flex flex-col bg-ink overflow-hidden">
      <div className="flex-1 relative bg-black">
        <div ref={avatarContainerRef} className="absolute inset-0" />
        {showConnectingOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300">
            <div className="h-8 w-8 border-2 border-neutral-600 border-t-white rounded-full animate-spin mb-3" />
            <div>Connecting to interviewer…</div>
          </div>
        )}
        {showStartOverlay && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
            <div>Press Start to begin your interview.</div>
          </div>
        )}
        {status.kind === "error" && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-red-200">
            <div>{status.message}</div>
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-black border-t border-neutral-900">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-3 bg-neutral-950/90 backdrop-blur border border-neutral-800 rounded-full px-3 py-2 shadow-xl">
        {status.kind !== "live" && status.kind !== "connecting" && (
          <button
            onClick={onStart}
            className="bg-white text-black rounded-full px-4 py-1.5 text-sm font-medium hover:bg-neutral-200"
          >
            Start
          </button>
        )}
        {(status.kind === "live" || status.kind === "connecting") && (
          <button
            onClick={onEnd}
            className="bg-red-600 text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-red-500"
          >
            End
          </button>
        )}
        {status.kind === "live" && (
          <button
            onClick={onToggleMute}
            className="bg-neutral-800 text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-neutral-700"
          >
            {micMuted ? "Unmute Mic" : "Mute Mic"}
          </button>
        )}
        {status.kind === "error" && status.canRetry && (
          <button
            onClick={onStart}
            className="bg-white text-black rounded-full px-4 py-1.5 text-sm font-medium hover:bg-neutral-200"
          >
            Retry
          </button>
        )}
        {status.kind === "ended" && conversationId && (
          <Link
            to={`/report/${conversationId}`}
            className="bg-emerald-600 text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-emerald-500"
          >
            View Report
          </Link>
        )}
        <div
          className={`rounded-full border px-3 py-1 text-xs max-w-[28rem] truncate ${statusColor}`}
          title={statusLabel}
        >
          {statusLabel}
        </div>
        <Link
          to="/"
          onClick={() => void cleanup()}
          className="text-xs text-neutral-400 hover:text-white px-2"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
