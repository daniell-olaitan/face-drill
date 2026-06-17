import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getReport, type ReportResponse } from "../lib/api";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 8;

export default function Report() {
  const { conversationId = "" } = useParams();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollsRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getReport(conversationId);
      setReport(data);
      // The transcript/analysis land a few seconds after the call ends; poll until ready.
      if (!data.ready && pollsRef.current < MAX_POLLS) {
        pollsRef.current += 1;
        timerRef.current = window.setTimeout(load, POLL_INTERVAL_MS);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the report.");
    }
  }, [conversationId]);

  useEffect(() => {
    void load();
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [load]);

  return (
    <div className="min-h-screen bg-ink text-neutral-100 px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Interview Report</h1>
          <Link to="/" className="text-sm text-neutral-400 hover:text-white">
            New interview
          </Link>
        </div>

        {error && <div className="text-red-300">{error}</div>}

        {!error && !report && <div className="text-neutral-400">Loading report…</div>}

        {report && (
          <div className="flex flex-col gap-8">
            <section>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Status</div>
              <div className="text-neutral-200">{report.status}</div>
              {!report.ready && (
                <div className="text-sm text-amber-300 mt-2">
                  Still processing the transcript and analysis. This page refreshes automatically…
                </div>
              )}
            </section>

            <section>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Demeanor analysis
              </div>
              {report.perception_analysis ? (
                <p className="text-neutral-200 leading-relaxed whitespace-pre-line rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
                  {report.perception_analysis}
                </p>
              ) : (
                <div className="text-neutral-500 text-sm">No analysis available yet.</div>
              )}
            </section>

            {report.recording_url && (
              <section>
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Recording</div>
                <a
                  href={report.recording_url}
                  className="text-blue-400 hover:text-blue-300 break-all text-sm"
                >
                  {report.recording_url}
                </a>
              </section>
            )}

            <section>
              <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Transcript</div>
              {report.transcript.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {report.transcript.map((turn, i) => (
                    <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                      <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                        {turn.role === "user" ? "You" : "Officer"}
                      </div>
                      <div className="text-neutral-200">{turn.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">No transcript available yet.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
