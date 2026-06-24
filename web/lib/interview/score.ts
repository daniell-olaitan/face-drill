// Turns a live Tavus interview transcript into a scored debrief using a free,
// local heuristic engine (specificity, hedging, length, phase fit). No API call,
// no cost, no Supabase, no Anthropic - it runs entirely in the browser on the
// transcript captured from the call's data channel.

export type InterviewPhase =
  | "purpose"
  | "specifics"
  | "finances"
  | "ties"
  | "history"
  | "credibility";

export interface Question {
  id: string;
  text: string;
  phase: InterviewPhase;
  categories: string[];
  listensFor: string;
  coachTip: string;
}

export interface AnswerRecord {
  questionId: string;
  answer: string;
  durationSec: number;
  spoken: boolean;
}

export interface AnswerNotes {
  landed: string[];
  tighten: string[];
  /** 0..3 rough strength used for the overall summary. */
  strength: number;
}

export interface QuestionDebrief {
  question: Question;
  record: AnswerRecord;
  notes: AnswerNotes;
}

export interface SessionDebrief {
  items: QuestionDebrief[];
  strongestId: string | null;
  headline: string;
  summary: string;
  focus: string;
}

export interface DimensionScore {
  phase: InterviewPhase;
  label: string;
  /** 0-100. */
  score: number;
}

export interface Verdict {
  label: string;
  tone: "success" | "warning" | "destructive";
}

/** One spoken turn; role "user" is the applicant, anything else is the officer. */
export interface TranscriptTurn {
  role: string;
  content: string;
}

export const PHASE_LABELS: Record<InterviewPhase, string> = {
  purpose: "Purpose of visit",
  specifics: "Your plans",
  finances: "Finances",
  ties: "Ties to home",
  history: "Travel history",
  credibility: "Credibility check",
};

/* ── Answer analysis ─────────────────────────────────────────────────────── */

const HEDGES = [
  "maybe",
  "i think",
  "i guess",
  "probably",
  "not sure",
  "kind of",
  "sort of",
  "hopefully",
  "i'll try",
  "possibly",
];

const FILLERS = ["um", "uh", "erm", "uhh", "umm", "you know"];

const PHASE_EXPECTATIONS: Record<
  InterviewPhase,
  { pattern: RegExp; missing: string; present: string }
> = {
  purpose: {
    pattern:
      /\b(conference|graduation|wedding|university|program|degree|meeting|vacation|visit(ing)?|tour|treatment|training|project|semester|master|bachelor|phd|intern)\b/i,
    missing:
      "The purpose never got a concrete anchor. Name the specific event, program, or plan in your first sentence.",
    present: "You anchored the purpose to something concrete. That is exactly what officers listen for first.",
  },
  specifics: {
    pattern:
      /\b(week|month|day|hotel|airbnb|stay|booked|campus|city|january|february|march|april|may|june|july|august|september|october|november|december|\d)\b/i,
    missing: "Plans stayed abstract. Real trips have dates, places, and durations; work one in.",
    present: "You gave real logistics: dates, places, durations. That reads as a genuine plan.",
  },
  finances: {
    pattern: /\b(salary|savings|sponsor|scholarship|income|earn|company|employer|business|fund|paid|\$|₦|€|£|₹|\d)\b/i,
    missing: "No source or number came through. Money answers need a who and a how much.",
    present: "You named the source of funds and grounded it. Funding answers live or die on that.",
  },
  ties: {
    pattern:
      /\b(job|work|employ|family|wife|husband|children|kids|parents|son|daughter|property|house|apartment|business|company|degree|studies|return|back home|lease|farm)\b/i,
    missing:
      "No concrete anchor to home came through. Lead with your strongest tie: a job, family, property, or studies.",
    present: "You named real anchors at home. This is the heart of 214(b), and you addressed it head-on.",
  },
  history: {
    pattern: /\b(20\d\d|19\d\d|never|no previous|first time|returned|came back|visa)\b/i,
    missing: "Travel history wants years and outcomes: where, when, and that you came back.",
    present: "You gave a dated history with returns. Patterns of coming back build trust fast.",
  },
  credibility: {
    pattern: /\b(because|job|family|return|home|leave|plan|continue|reapply|business|studies)\b/i,
    missing:
      "Pressure questions need a reason, not a reaction. Give the one concrete fact that makes your story hold.",
    present: "You stayed in the facts under pressure instead of pleading. That composure is the whole test.",
  },
};

const countMatches = (text: string, terms: string[]): number =>
  terms.reduce((count, term) => {
    const pattern = new RegExp(`\\b${term.replace(/'/g, "'?")}\\b`, "gi");
    return count + (text.match(pattern)?.length ?? 0);
  }, 0);

const specificityScore = (text: string): number => {
  const digits = (text.match(/\d+/g) ?? []).length;
  const months = (
    text.match(
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
    ) ?? []
  ).length;
  const currency = (text.match(/[$€£₦₹]|\b(dollars|naira|rupees|euros|pounds)\b/gi) ?? []).length;
  // Proper-noun-ish: capitalized words not at the start of a sentence.
  const properNouns = (text.match(/(?<![.!?]\s)(?<!^)\b[A-Z][a-z]{2,}/g) ?? []).length;
  return digits + months + currency + Math.min(properNouns, 4);
};

export const analyzeAnswer = (question: Question, record: AnswerRecord): AnswerNotes => {
  const text = record.answer.trim();
  const words = text.length === 0 ? 0 : text.split(/\s+/).length;
  const landed: string[] = [];
  const tighten: string[] = [];
  let strength = 0;

  if (words === 0) {
    return {
      landed: [],
      tighten: [
        "No answer was recorded. In the booth, silence is read as unpreparedness. Even a simple, direct sentence is better than freezing.",
      ],
      strength: 0,
    };
  }

  // Length: real consular answers are 1-3 tight sentences.
  if (words < 6) {
    tighten.push(
      "This was too thin. One-word and fragment answers force the officer to dig, and digging rarely helps you. Aim for one or two complete sentences.",
    );
  } else if (words > 90) {
    tighten.push(
      "This ran long. Officers decide in minutes and long answers bury your strongest fact. Lead with it, then stop.",
    );
  } else {
    landed.push("Good length. You answered in the short, complete way the format demands.");
    strength += 1;
  }

  // Specificity.
  const specificity = specificityScore(text);
  if (specificity >= 3) {
    landed.push(
      "Strong specifics: names, numbers, and dates. Concrete details are what separate a story from a claim.",
    );
    strength += 1;
  } else if (specificity === 0 && words >= 6) {
    tighten.push(
      "No names, numbers, or dates came through. Add one verifiable detail; specificity is the cheapest credibility you can buy.",
    );
  }

  // Phase expectation.
  const expectation = PHASE_EXPECTATIONS[question.phase];
  if (expectation.pattern.test(text)) {
    landed.push(expectation.present);
    strength += 1;
  } else {
    tighten.push(expectation.missing);
  }

  // Hedging.
  const hedges = countMatches(text, HEDGES);
  if (hedges >= 2) {
    tighten.push(
      `Hedging language appeared ${hedges} times ("maybe", "I think", "probably"). Soft language reads as an unsettled plan. State it as fact or restructure the sentence.`,
    );
  }

  // Fillers, only meaningful for spoken answers.
  if (record.spoken) {
    const fillers = countMatches(text, FILLERS);
    if (fillers >= 3) {
      tighten.push(
        "Several filler sounds came through. A short pause beats a filled one; silence reads as thought, an um reads as doubt.",
      );
    }
  }

  return { landed, tighten, strength: Math.min(strength, 3) };
};

export const buildDebrief = (questions: Question[], records: AnswerRecord[]): SessionDebrief => {
  const items = questions
    .map((question) => {
      const record = records.find((r) => r.questionId === question.id);
      if (!record) return null;
      return { question, record, notes: analyzeAnswer(question, record) };
    })
    .filter((item): item is QuestionDebrief => item !== null);

  const answered = items.filter((i) => i.record.answer.trim().length > 0);
  const strong = answered.filter((i) => i.notes.strength >= 2);
  const strongest = [...answered].sort((a, b) => b.notes.strength - a.notes.strength)[0] ?? null;

  // Find the most common phase with weak answers to set a focus.
  const weakByPhase = new Map<InterviewPhase, number>();
  for (const item of items) {
    if (item.notes.strength <= 1) {
      weakByPhase.set(item.question.phase, (weakByPhase.get(item.question.phase) ?? 0) + 1);
    }
  }
  const weakestPhase = [...weakByPhase.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  let headline: string;
  let summary: string;

  if (answered.length === 0) {
    headline = "You showed up. Now let's hear you.";
    summary =
      "No answers were recorded this session. That's fine for a first look around, but the gains come from hearing yourself respond out loud. Run it again and answer every question, even imperfectly.";
  } else if (strong.length >= Math.ceil(answered.length * 0.7)) {
    headline = "You'd walk out of that booth feeling good.";
    summary = `You answered ${answered.length} questions and most of them landed: specific, right-sized, and on point. The remaining notes below are polish, not surgery.`;
  } else if (strong.length >= Math.ceil(answered.length * 0.4)) {
    headline = "The story is there. The delivery needs reps.";
    summary = `${strong.length} of your ${answered.length} answers landed cleanly. The pattern in the rest is fixable with practice, and none of it means your case is weak. It means your phrasing has not caught up to your facts yet.`;
  } else {
    headline = "Rough rep. Exactly why you practice here, not there.";
    summary =
      "Most answers this round stayed vague or thin. That is the most common reason real applicants get refused, and it is also the most learnable thing in this entire process. Read the notes, then run it again.";
  }

  const focus = weakestPhase
    ? `Focus for your next rep: ${PHASE_LABELS[weakestPhase].toLowerCase()}. That is where your answers most often lost their footing.`
    : "Next rep: same questions, tighter answers. Lead with your strongest fact and stop talking sooner.";

  return {
    items,
    strongestId: strongest?.question.id ?? null,
    headline,
    summary,
    focus,
  };
};

/* ── Live transcript -> debrief ────────────────────────────────────────────── */

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

// Treat an officer turn as a question worth scoring if it's a question or a real
// prompt (filters out short acknowledgements like "Thank you.").
const isQuestionLike = (text: string): boolean => text.includes("?") || text.trim().length > 30;

/**
 * Score each officer question against the user's reply. Questions the user left
 * UNANSWERED are kept as empty answers (strength 0), so going silent tanks the
 * score the way a real interview would, instead of being ignored.
 */
export const buildLiveDebrief = (transcript: TranscriptTurn[]): SessionDebrief | null => {
  const questions: Question[] = [];
  const records: AnswerRecord[] = [];

  for (let i = 0; i < transcript.length; i++) {
    const turn = transcript[i];
    if (turn.role === "user") continue; // we score officer question -> next user answer
    const next = transcript[i + 1];
    const answered = Boolean(next && next.role === "user");

    if (!answered && !isQuestionLike(turn.content)) continue;

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
    records.push({
      questionId: id,
      answer: answered ? next!.content : "",
      durationSec: 0,
      spoken: true,
    });
  }

  if (questions.length === 0) return null;
  return buildDebrief(questions, records);
};

/** Overall readiness, 0-100, over ALL asked questions (unanswered count as 0). */
export const readinessScore = (debrief: SessionDebrief): number => {
  if (debrief.items.length === 0) return 0;
  const total = debrief.items.reduce((sum, i) => sum + i.notes.strength, 0);
  return Math.round((total / (debrief.items.length * 3)) * 100);
};

/** Per-area scores, grouped by interview phase (unanswered questions count as 0). */
export const dimensionScores = (debrief: SessionDebrief): DimensionScore[] => {
  const byPhase = new Map<InterviewPhase, number[]>();
  for (const item of debrief.items) {
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

/** A practice "verdict" derived from the readiness score. */
export const verdictFor = (score: number): Verdict => {
  if (score >= 70) return { label: "You'd likely get through.", tone: "success" };
  if (score >= 50) return { label: "Borderline - fixable with reps.", tone: "warning" };
  return { label: "Refused under 214(b) this round.", tone: "destructive" };
};
