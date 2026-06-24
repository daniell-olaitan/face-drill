import type { VisaProfile } from "@/types";

export const usB1B2Profile: VisaProfile = {
  id: "us-b1b2",
  country: "US",
  category: "tourist",
  label: "US B1/B2 Tourist & Business Visa",
  shortLabel: "US B1/B2",
  description:
    "The B1/B2 visa allows temporary visits to the United States for tourism, pleasure, business meetings, or medical treatment.",
  flagEmoji: "🇺🇸",
  recommendedQuestionCount: 12,

  contextFields: [
    {
      key: "purpose",
      label: "Primary purpose of visit",
      type: "select",
      required: true,
      options: ["Tourism", "Business meetings", "Medical treatment", "Visiting family/friends", "Other"],
    },
    {
      key: "destination_city",
      label: "Main destination city/state",
      type: "text",
      required: true,
      placeholder: "e.g. New York, California",
    },
    {
      key: "duration_days",
      label: "Planned duration of stay (days)",
      type: "number",
      required: true,
      placeholder: "e.g. 14",
    },
    {
      key: "employer_or_school",
      label: "Current employer or school (in your home country)",
      type: "text",
      required: true,
      placeholder: "e.g. XYZ Bank Ltd, University of Lagos",
    },
    {
      key: "monthly_income",
      label: "Monthly income or financial support (USD equivalent)",
      type: "number",
      required: false,
      placeholder: "e.g. 2000",
    },
    {
      key: "previous_us_travel",
      label: "Have you visited the US before?",
      type: "select",
      required: true,
      options: ["No", "Yes - approved and entered", "Yes - was denied"],
    },
  ],

  questionCategories: [
    {
      id: "purpose",
      label: "Purpose of Travel",
      description: "Why the applicant is visiting the United States",
      weight: 0.2,
      seedQuestions: [
        "What is the purpose of your visit to the United States?",
        "Who will you be visiting or meeting?",
        "What specific activities do you plan to do while in the US?",
        "Have you made any hotel or travel reservations?",
      ],
    },
    {
      id: "ties_home",
      label: "Ties to Home Country",
      description: "Evidence the applicant will return home",
      weight: 0.3,
      seedQuestions: [
        "What is your current occupation back home?",
        "Do you own property or have significant assets in your home country?",
        "Who are you leaving behind - family, dependents?",
        "What will happen to your job while you are away?",
        "Do you have any business or financial obligations that require you to return?",
      ],
    },
    {
      id: "finances",
      label: "Financial Ability",
      description: "Whether the applicant can fund the trip",
      weight: 0.2,
      seedQuestions: [
        "How will you fund your trip to the US?",
        "What is your monthly salary or income?",
        "Who is sponsoring your trip?",
        "What is your estimated budget for this trip?",
        "How much have you saved specifically for this trip?",
      ],
    },
    {
      id: "immigration_history",
      label: "Immigration History",
      description: "Prior travel and visa applications",
      weight: 0.15,
      seedQuestions: [
        "Have you traveled to the United States before?",
        "Have you ever had a US visa application denied? If so, why?",
        "Have you visited other countries in the past few years?",
        "Have you ever overstayed a visa in any country?",
      ],
    },
    {
      id: "intent",
      label: "Non-Immigrant Intent",
      description: "Confirmation the applicant does not intend to immigrate",
      weight: 0.15,
      seedQuestions: [
        "Do you have any relatives who are US citizens or permanent residents?",
        "Are you planning to work or study in the US?",
        "Do you have any plans to remain in the US beyond your authorized stay?",
        "What do you plan to do after your trip to the US?",
      ],
    },
  ],

  officerPersona: {
    tone: "businesslike, neutral, slightly detached, occasionally abrupt - never hostile, never warm",
    strictness: "standard",
    systemPromptTemplate: `You are a US consular officer conducting a B1/B2 nonimmigrant visa interview at the American Embassy. You are standing at a window, behind glass, with the applicant's DS-160 and records on the screen in front of you.

THE DS-160 ON FILE - what the applicant already submitted. Cross-check every spoken answer against this. Contradicting the DS-160 is one of the surest ways to be refused:
- Purpose of visit: {{purpose}}
- Destination: {{destination_city}}
- Planned duration: {{duration_days}} days
- Employer/School in home country: {{employer_or_school}}
- Monthly income (USD eq.): {{monthly_income}}
- Previous US travel: {{previous_us_travel}}

YOUR LEGAL TASK - Section 214(b):
US law presumes this applicant intends to immigrate. The burden is entirely on THEM to convince you they will return home. Behind every question you ask, your real question is: "Will this person come back?" You are weighing four things - ties to home country, a credible purpose, the ability to fund the trip, and overall credibility (does the story hold together and match the DS-160).

HOW YOU CONDUCT THE INTERVIEW:
- Ask ONE question at a time. Never bundle questions.
- Open with the purpose of the visit, then move fast. A real interview is 2-5 minutes - be rapid-fire.
- Do NOT praise, encourage, or react warmly. Usually go straight to the next question. An occasional terse "Mm-hm." or "Okay." is the most acknowledgment you give.
- Hunt for vagueness and contradiction, not depth. When an answer is vague, immediately demand specifics. (Applicant: "Tourism." → You: "Which cities? What is your itinerary? Who booked it?")
- If an answer contradicts the DS-160 on file, or an earlier answer, challenge it directly.
- You may interrupt and you may be abrupt. Stay businesslike, neutral, slightly detached - never hostile, never friendly.
- You rarely ask to see documents. You decide on the verbal exchange and the records on the screen.
- Never coach, never explain why you are asking, never break character.
- After roughly 8-12 exchanges, or once you have a clear read on intent, you may close the interview.

Keep every turn to a single short question - no preamble, no filler.`,
  },

  // The four pillars of §214(b). Every refusal traces back to one of these.
  // Ties carries the most weight - it is the heart of overcoming the presumption.
  evaluationCriteria: [
    {
      id: "ties",
      label: "Ties to Home",
      description:
        "How convincingly the applicant proved strong, specific reasons to return - job, family, property, obligations. The core of overcoming the §214(b) presumption.",
      weight: 0.35,
    },
    {
      id: "purpose",
      label: "Purpose",
      description:
        "Whether the reason for travel is specific, credible, and consistent with the applicant's profile and submitted DS-160.",
      weight: 0.2,
    },
    {
      id: "funds",
      label: "Funds",
      description:
        "Whether the applicant can clearly afford the trip without working illegally - concrete figures and a credible source of funding.",
      weight: 0.2,
    },
    {
      id: "credibility",
      label: "Credibility",
      description:
        "Whether the story holds together: answers consistent with the DS-160 and with each other, delivered with confidence - not vague, evasive, or rehearsed.",
      weight: 0.25,
    },
  ],
};
