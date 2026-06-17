export interface StartSessionResponse {
  conversation_url: string;
  conversation_id: string;
}

export interface StartOptions {
  language?: string;
  applicantId?: string;
}

export interface TranscriptTurn {
  role: string;
  content: string;
}

export interface ReportResponse {
  conversation_id: string;
  status: string;
  transcript: TranscriptTurn[];
  perception_analysis: string | null;
  recording_url: string | null;
  ready: boolean;
}

const APPLICANT_KEY = "facedrill_applicant_id";
const LANGUAGE_KEY = "facedrill_language";

/** Stable per-browser id used as the cross-session memory key (feature #7). */
export function getApplicantId(): string {
  let id = localStorage.getItem(APPLICANT_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    localStorage.setItem(APPLICANT_KEY, id);
  }
  return id;
}

export function getLanguage(): string {
  return localStorage.getItem(LANGUAGE_KEY) || "english";
}

export function setLanguage(language: string): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}

export async function startSession(
  visaType: string,
  opts: StartOptions = {}
): Promise<StartSessionResponse> {
  const res = await fetch("/api/start-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visa_type: visaType,
      language: opts.language,
      applicant_id: opts.applicantId,
    }),
  });
  if (!res.ok) {
    throw new Error(`start-session failed: ${res.status}`);
  }
  return res.json();
}

export async function endSession(conversationId: string): Promise<void> {
  try {
    await fetch("/api/end-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId }),
    });
  } catch {
    // Best-effort: the Tavus call also self-terminates via its timeouts.
  }
}

export async function getReport(conversationId: string): Promise<ReportResponse> {
  const res = await fetch(`/api/report/${conversationId}`);
  if (!res.ok) {
    throw new Error(`report failed: ${res.status}`);
  }
  return res.json();
}
