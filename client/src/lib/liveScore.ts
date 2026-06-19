// Turns a live Tavus interview transcript into a scored debrief by reusing the
// same heuristic engine the simulator uses (specificity, hedging, length, phase
// fit). No extra API call or cost.

import {
  buildDebrief,
  type AnswerRecord,
  type SessionDebrief,
} from "@/lib/interviewEngine";
import {
  PHASE_LABELS,
  type InterviewPhase,
  type Question,
} from "@/lib/questionBank";
import type { TranscriptTurn } from "@/lib/report";

// Keyword cues to bucket an officer's question into an interview phase so the
// engine can apply the right "what officers listen for" expectations.
const PHASE_CUES: [InterviewPhase, RegExp][] = [
  ["finances", /\b(pay|paying|fund|afford|cost|money|salary|income|sponsor|scholarship|saving|expense|tuition)\b/i],
  ["ties", /\b(return|come back|go back|ties|family|wife|husband|children|kids|parents|job|work|property|house|home country|after)\b/i],
  ["history", /\b(before|previously|prior|traveled|visited|been to|last time|other countr)\b/i],
  ["specifics", /\b(how long|when|where|which|dates?|stay|hotel|city|itinerary|plan|university|school|program|company|role)\b/i],
  ["purpose", /\b(purpose|why|reason|what brings|what are you|going to do|intend)\b/i],
];

const GENERIC_TIP: Record<InterviewPhase, string> = {
  purpose: "Lead with one concrete purpose: a specific event, program, or plan.",
  specifics: "Ground it in real logistics, dates, places, durations.",
  finances: "Name the source of funds and a rough number.",
  ties: "Lead with your strongest tie to home: job, family, property, or studies.",
  history: "Give dated travel history and that you returned each time.",
  credibility: "Under pressure, give the one concrete fact that makes your story hold.",
};

const classifyPhase = (question: string): InterviewPhase => {
  for (const [phase, pattern] of PHASE_CUES) {
    if (pattern.test(question)) return phase;
  }
  return "credibility";
};

/** Pair each officer question with the user's next reply and score the set. */
export const buildLiveDebrief = (transcript: TranscriptTurn[]): SessionDebrief | null => {
  const questions: Question[] = [];
  const records: AnswerRecord[] = [];

  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    if (turn.role === "user") continue; // we want officer question -> next user answer
    const answer = transcript[i + 1];
    if (!answer || answer.role !== "user") continue;

    const phase = classifyPhase(turn.content);
    const id = `live-${questions.length}`;
    questions.push({
      id,
      text: turn.content,
      phase,
      categories: ["any"],
      listensFor: "",
      coachTip: GENERIC_TIP[phase],
    });
    records.push({ questionId: id, answer: answer.content, durationSec: 0, spoken: true });
  }

  if (records.length === 0) return null;
  return buildDebrief(questions, records);
};

export interface DimensionScore {
  phase: InterviewPhase;
  label: string;
  /** 0-100. */
  score: number;
}

/** Overall readiness, 0-100, from the average answer strength (0-3). */
export const readinessScore = (debrief: SessionDebrief): number => {
  const answered = debrief.items.filter((i) => i.record.answer.trim().length > 0);
  if (answered.length === 0) return 0;
  const total = answered.reduce((sum, i) => sum + i.notes.strength, 0);
  return Math.round((total / (answered.length * 3)) * 100);
};

/** Per-area scores, grouped by interview phase. */
export const dimensionScores = (debrief: SessionDebrief): DimensionScore[] => {
  const byPhase = new Map<InterviewPhase, number[]>();
  for (const item of debrief.items) {
    if (!item.record.answer.trim()) continue;
    const arr = byPhase.get(item.question.phase) ?? [];
    arr.push(item.notes.strength);
    byPhase.set(item.question.phase, arr);
  }
  return [...byPhase.entries()].map(([phase, strengths]) => ({
    phase,
    label: PHASE_LABELS[phase],
    score: Math.round((strengths.reduce((a, b) => a + b, 0) / (strengths.length * 3)) * 100),
  }));
};

export interface Verdict {
  label: string;
  tone: "success" | "warning" | "destructive";
}

/** A practice "verdict" derived from the readiness score. */
export const verdictFor = (score: number): Verdict => {
  if (score >= 70) return { label: "You'd likely get through.", tone: "success" };
  if (score >= 50) return { label: "Borderline — fixable with reps.", tone: "warning" };
  return { label: "Refused under 214(b) this round.", tone: "destructive" };
};
