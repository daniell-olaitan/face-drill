"use client";

import { PhoneOff, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

/* The live Tavus video officer. Renders the conversation in an embedded call
   with our session HUD on top. Only used when Tavus is switched on. */
export function TavusInterview({
  url,
  elapsed,
  ending,
  onEnd,
}: {
  url: string;
  elapsed: number;
  ending: boolean;
  onEnd: () => void;
}) {
  return (
    <div className="relative w-full h-full bg-[#030810]">
      <iframe
        src={url}
        title="VisaDrill - live interview"
        allow="camera; microphone; autoplay; fullscreen; display-capture"
        className="absolute inset-0 w-full h-full border-0"
      />

      {/* Session HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] text-white/70 font-medium">Live interview</span>
          <span className="text-[11px] font-mono text-white/40 tabular-nums ml-1">
            {formatDuration(elapsed)}
          </span>
        </div>
        <button
          type="button"
          onClick={onEnd}
          disabled={ending}
          className="bg-danger hover:bg-red-600 text-white font-semibold rounded-lg px-4 py-1.5 text-sm transition-colors disabled:opacity-60 flex items-center gap-1.5 pointer-events-auto"
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
  );
}
