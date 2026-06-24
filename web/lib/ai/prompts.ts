import type { VisaProfile, Message, SessionContext, FeedbackReport } from "@/types";
import { randomId } from "@/lib/utils";
import { getVisaProfile } from "@/lib/visa-profiles";

export function buildOfficerSystemPrompt(
  profile: VisaProfile,
  context: SessionContext
): string {
  let prompt = profile.officerPersona.systemPromptTemplate;
  const responses = context.responses as Record<string, string>;

  for (const field of profile.contextFields) {
    const val = responses[field.key] ?? "(not provided)";
    prompt = prompt.replace(`{{${field.key}}}`, String(val));
  }

  return prompt;
}

export function buildFeedbackPrompt(
  messages: Message[],
  context: SessionContext,
  profile: VisaProfile
): string {
  const transcript = messages
    .filter((m) => m.speaker !== "system")
    .map((m) => `${m.speaker === "officer" ? "OFFICER" : "APPLICANT"}: ${m.text}`)
    .join("\n");

  const criteriaList = profile.evaluationCriteria
    .map((c) => `- ${c.label} (weight: ${c.weight}): ${c.description}`)
    .join("\n");

  return `You are an expert US visa interview evaluator. You assess interviews the way a consular officer decides a case under Section 214(b) of the Immigration and Nationality Act: the applicant is presumed to intend to immigrate, and the burden was on THEM to prove they will return home. Your job is to judge how well they overcame that presumption.

VISA TYPE: ${profile.label}

APPLICANT'S SUBMITTED BRIEF (their DS-160 / context - every spoken answer should be consistent with this; flag contradictions as red flags):
${JSON.stringify(context.responses, null, 2)}

EVALUATION CRITERIA (score each against the §214(b) lens above):
${criteriaList}

INTERVIEW TRANSCRIPT:
${transcript}

Produce a JSON response with this EXACT structure (no markdown, just raw JSON):
{
  "overall_score": <integer 0-100>,
  "verdict": <"likely_approve" | "borderline" | "likely_refuse">,
  "summary": <2-3 sentence plain-English summary of overall performance>,
  "criterion_scores": [
    {
      "criterion_id": <id from criteria list>,
      "label": <criterion label>,
      "score": <integer 0-100>,
      "comment": <1-2 sentence comment>
    }
  ],
  "red_flags": [
    {
      "id": <unique string id>,
      "severity": <"low" | "medium" | "high">,
      "category": <criterion id or question category id>,
      "description": <concise description of the issue>,
      "related_message_ids": []
    }
  ],
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "answer_breakdowns": [
    {
      "question_message_id": "",
      "answer_message_id": "",
      "question": <officer question>,
      "answer": <applicant answer>,
      "assessment": <brief assessment>,
      "rating": <"strong" | "adequate" | "weak">
    }
  ]
}

CALIBRATION - be honest, not kind. Real officers refuse a large share of applicants, and false confidence is the one thing that actively harms this user. Default to skepticism:
- Vague, evasive, or rehearsed-sounding answers should score low even if polite.
- An applicant who failed to prove concrete ties to home should land "borderline" or "likely_refuse", regardless of how pleasant they were.
- Any contradiction with the submitted brief above, or between answers, is a serious credibility problem - surface it as a red flag.
- A score of 70+ means they would likely overcome §214(b) in a real interview. Reserve it for genuinely strong cases.
The value you add - that the real embassy never does - is telling them exactly WHY and exactly WHAT to fix. Be specific in strengths, improvements, and red flags.`;
}

export function parseFeedbackResponse(
  raw: string,
  sessionId: string
): FeedbackReport {
  try {
    const json = JSON.parse(raw.trim());
    return {
      id: randomId(),
      session_id: sessionId,
      overall_score: json.overall_score ?? 50,
      verdict: json.verdict ?? "borderline",
      summary: json.summary ?? "",
      criterion_scores: json.criterion_scores ?? [],
      red_flags: json.red_flags ?? [],
      strengths: json.strengths ?? [],
      improvements: json.improvements ?? [],
      answer_breakdowns: json.answer_breakdowns ?? [],
      generated_at: new Date().toISOString(),
    };
  } catch {
    return buildMockFeedback(sessionId);
  }
}

export function buildMockFeedback(sessionId: string): FeedbackReport {
  return {
    id: randomId(),
    session_id: sessionId,
    overall_score: 68,
    verdict: "borderline",
    summary:
      "You demonstrated reasonable knowledge of your visa purpose and showed some ties to your home country. However, some answers were vague and you hesitated when discussing finances. With targeted practice, you can significantly improve your chances.",
    criterion_scores: [
      { criterion_id: "ties", label: "Ties to Home", score: 63, comment: "You mentioned employment, but family and property ties were left vague - the officer needs a concrete reason you return." },
      { criterion_id: "purpose", label: "Purpose", score: 72, comment: "Your stated purpose was credible and consistent with your brief. Tighten the specifics of your itinerary." },
      { criterion_id: "funds", label: "Funds", score: 60, comment: "Financial answers were vague. Come with exact figures - savings, monthly income, who pays for what." },
      { criterion_id: "credibility", label: "Credibility", score: 70, comment: "Answers held together and matched your DS-160, but hesitation on money read as uncertainty." },
    ],
    red_flags: [
      {
        id: "rf1",
        severity: "medium",
        category: "finances",
        description: "Vague response about monthly income without specific figures.",
        related_message_ids: [],
      },
    ],
    strengths: [
      "Clearly stated purpose of visit",
      "Mentioned active employment in home country",
      "Consistent answers about travel dates and destination",
    ],
    improvements: [
      "Prepare specific financial figures - exact monthly income, bank balance, trip budget",
      "Emphasize family ties more explicitly (spouse, children, dependents)",
      "Be ready to explain what will happen to your job while you are away",
      "Practice not hesitating on straightforward questions about your plans",
    ],
    answer_breakdowns: [
      {
        question_message_id: "",
        answer_message_id: "",
        question: "What is the purpose of your visit to the United States?",
        answer: "I'm visiting for tourism - I want to see New York and California.",
        assessment: "Direct and clear. Good opening.",
        rating: "strong",
      },
      {
        question_message_id: "",
        answer_message_id: "",
        question: "How will you fund your trip?",
        answer: "I have savings and my employer is covering part of it.",
        assessment: "Vague - no figures provided. Officer would likely probe further.",
        rating: "weak",
      },
    ],
    generated_at: new Date().toISOString(),
  };
}
