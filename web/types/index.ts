/* =========================================================
 * VisaPrep - Core Domain Types
 * =========================================================
 * Design decisions:
 *  - Visa types are CONFIG objects, not hardcoded enums.
 *    Adding a new visa = add one VisaProfile. No code surgery.
 *  - Audio/video loop is owned by Tavus CVI. No Deepgram/ElevenLabs pipeline.
 *    We bring our own LLM for officer persona + evaluation.
 *  - Billing-ready but free-first. tier/sessionsLimit exist now.
 */

/* ------------------------------------------------------------------ */
/* Visa Configuration                                                    */
/* ------------------------------------------------------------------ */

export type CountryCode = "US" | "UK" | "CA" | "SCHENGEN" | "AU";
export type VisaCategory =
  | "tourist"
  | "business"
  | "student"
  | "work"
  | "family"
  | "transit";

export interface QuestionCategory {
  id: string;
  label: string;
  description: string;
  weight: number;
  seedQuestions: string[];
}

export interface OfficerPersona {
  tone: string;
  strictness: "lenient" | "standard" | "tough";
  systemPromptTemplate: string;
}

export interface EvaluationCriterion {
  id: string;
  label: string;
  description: string;
  weight: number;
}

export interface ContextField {
  key: string;
  label: string;
  type: "text" | "select" | "number" | "date";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface VisaProfile {
  id: string;
  country: CountryCode;
  category: VisaCategory;
  label: string;
  shortLabel: string;
  description: string;
  flagEmoji?: string;
  questionCategories: QuestionCategory[];
  officerPersona: OfficerPersona;
  evaluationCriteria: EvaluationCriterion[];
  recommendedQuestionCount: number;
  contextFields: ContextField[];
}

/* ------------------------------------------------------------------ */
/* User                                                                  */
/* ------------------------------------------------------------------ */

export type SubscriptionTier = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  nationality: string | null;
  tier: SubscriptionTier;
  sessions_used: number;
  sessions_limit: number;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Session                                                               */
/* ------------------------------------------------------------------ */

export interface SessionContext {
  visaProfileId: string;
  destinationCountry: string;
  purposeOfTravel: string;
  responses: Record<string, string | number>;
}

export type Speaker = "officer" | "applicant" | "system";

export interface Message {
  id: string;
  session_id: string;
  speaker: Speaker;
  text: string;
  timestamp_ms: number;
  created_at: string;
  question_category_id?: string | null;
}

export type SessionStatus =
  | "created"
  | "briefing"
  | "in_progress"
  | "completed"
  | "abandoned";

export interface InterviewSession {
  id: string;
  user_id: string;
  visa_profile_id: string;
  status: SessionStatus;
  context: SessionContext;
  messages: Message[];
  tavus_conversation?: TavusConversation | null;
  feedback?: FeedbackReport | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Tavus CVI                                                             */
/* ------------------------------------------------------------------ */

export interface TavusReplica {
  replica_id: string;
  name: string;
}

export interface TavusPersona {
  persona_id: string;
  visa_profile_id: string;
  replica_id: string;
}

export interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: "active" | "ended";
  replica_id: string;
  persona_id: string;
  created_at: string;
}

export interface CreateConversationPayload {
  replica_id: string;
  persona_id: string;
  conversation_name?: string;
  conversational_context?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    enable_recording?: boolean;
    language?: string;
  };
}

/* ------------------------------------------------------------------ */
/* Feedback / Scoring                                                    */
/* ------------------------------------------------------------------ */

export type RedFlagSeverity = "low" | "medium" | "high";

export interface RedFlag {
  id: string;
  severity: RedFlagSeverity;
  category: string;
  description: string;
  related_message_ids: string[];
}

export interface CriterionScore {
  criterion_id: string;
  label: string;
  score: number;
  comment: string;
}

export interface AnswerBreakdown {
  question_message_id: string;
  answer_message_id: string;
  question: string;
  answer: string;
  assessment: string;
  rating: "strong" | "adequate" | "weak";
}

export type Verdict = "likely_approve" | "borderline" | "likely_refuse";

export interface FeedbackReport {
  id: string;
  session_id: string;
  overall_score: number;
  verdict: Verdict;
  summary: string;
  criterion_scores: CriterionScore[];
  red_flags: RedFlag[];
  strengths: string[];
  improvements: string[];
  answer_breakdowns: AnswerBreakdown[];
  generated_at: string;
}

/* ------------------------------------------------------------------ */
/* API Response shapes                                                   */
/* ------------------------------------------------------------------ */

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
