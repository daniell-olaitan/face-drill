import type { VisaProfile } from "@/types";

export const usF1Profile: VisaProfile = {
  id: "us-f1",
  country: "US",
  category: "student",
  label: "US F-1 Student Visa",
  shortLabel: "US F-1",
  description:
    "The F-1 visa is for international students pursuing full-time academic studies at an accredited US institution.",
  flagEmoji: "🇺🇸",
  recommendedQuestionCount: 14,

  contextFields: [
    {
      key: "institution",
      label: "Name of your US institution",
      type: "text",
      required: true,
      placeholder: "e.g. University of Texas at Austin",
    },
    {
      key: "program",
      label: "Degree and field of study",
      type: "text",
      required: true,
      placeholder: "e.g. BSc Computer Science, MBA Finance",
    },
    {
      key: "start_date",
      label: "Program start date",
      type: "text",
      required: true,
      placeholder: "e.g. September 2025",
    },
    {
      key: "funding_source",
      label: "How are you funding your studies?",
      type: "select",
      required: true,
      options: [
        "Personal/family funds",
        "Scholarship (US institution)",
        "Government scholarship",
        "Employer sponsorship",
        "Combination",
      ],
    },
    {
      key: "current_education",
      label: "Your most recent school/university (home country)",
      type: "text",
      required: true,
      placeholder: "e.g. University of Lagos",
    },
    {
      key: "career_goal",
      label: "Career goal after completing your degree",
      type: "text",
      required: true,
      placeholder: "e.g. Return and work in fintech in Nigeria",
    },
  ],

  questionCategories: [
    {
      id: "academic_intent",
      label: "Academic Intent",
      description: "Why this course at this institution",
      weight: 0.25,
      seedQuestions: [
        "Why did you choose this particular university?",
        "Why are you pursuing this specific field of study?",
        "How did you hear about this program?",
        "What makes this program better suited to your goals than options in your home country?",
        "Have you applied to or been admitted to any other universities?",
      ],
    },
    {
      id: "financial_support",
      label: "Financial Support",
      description: "Ability to fund tuition and living expenses",
      weight: 0.2,
      seedQuestions: [
        "How do you plan to fund your tuition and living expenses?",
        "What is your family's annual income?",
        "Do you have a scholarship? Can you describe it?",
        "What are the total costs for your first year?",
      ],
    },
    {
      id: "ties_home",
      label: "Ties to Home Country",
      description: "Intention to return after studies",
      weight: 0.25,
      seedQuestions: [
        "What do you plan to do after completing your degree?",
        "Do you have family or dependents in your home country?",
        "Do you have a job offer or career plan back home?",
        "Is there anything that would prevent you from returning after graduation?",
      ],
    },
    {
      id: "academic_history",
      label: "Academic Background",
      description: "Prior academic performance and preparedness",
      weight: 0.15,
      seedQuestions: [
        "Tell me about your academic background.",
        "What grades did you achieve in your previous studies?",
        "Have you taken English proficiency tests? What were your scores?",
        "Have you done any work or internships related to your field?",
      ],
    },
    {
      id: "program_fit",
      label: "Program Fit",
      description: "How well the program aligns with stated goals",
      weight: 0.15,
      seedQuestions: [
        "How will this degree help you achieve your career goals?",
        "What specific aspects of the program are you most excited about?",
        "Have you been in contact with faculty or students at this program?",
      ],
    },
  ],

  officerPersona: {
    tone: "professional, thorough, mildly skeptical",
    strictness: "standard",
    systemPromptTemplate: `You are a US consular officer conducting an F-1 student visa interview.

APPLICANT CONTEXT:
- Institution: {{institution}}
- Program: {{program}}
- Start date: {{start_date}}
- Funding source: {{funding_source}}
- Previous institution: {{current_education}}
- Career goal: {{career_goal}}

YOUR ROLE:
- Conduct a thorough F-1 student visa interview
- Ask ONE question at a time
- Begin by asking the applicant to explain their course of study and why they chose their institution
- Probe deeply into: why this school, why this field, how it connects to their career goals, proof they will return home
- Question financial ability thoroughly - tuition + living costs are significant
- Watch for inconsistencies between career goal and chosen program
- Check non-immigrant intent - F-1 has high overstay rates, be appropriately skeptical
- Do NOT break character, coach, or explain your reasoning
- Keep responses brief - one question per turn

Your tone is measured and professional. You are not hostile, but you are precise.`,
  },

  evaluationCriteria: [
    {
      id: "clarity",
      label: "Clarity & Confidence",
      description: "Communication quality",
      weight: 0.15,
    },
    {
      id: "academic_fit",
      label: "Academic & Career Alignment",
      description: "How well the program fits stated goals",
      weight: 0.25,
    },
    {
      id: "financial_proof",
      label: "Financial Credibility",
      description: "Demonstrated ability to fund the degree",
      weight: 0.2,
    },
    {
      id: "return_intent",
      label: "Intent to Return",
      description: "Strength of non-immigrant intent",
      weight: 0.25,
    },
    {
      id: "consistency",
      label: "Consistency",
      description: "Consistency of answers throughout",
      weight: 0.15,
    },
  ],
};
