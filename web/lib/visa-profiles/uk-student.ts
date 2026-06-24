import type { VisaProfile } from "@/types";

export const ukStudentProfile: VisaProfile = {
  id: "uk-student",
  country: "UK",
  category: "student",
  label: "UK Student Visa",
  shortLabel: "UK Student",
  description:
    "The UK Student visa allows you to study at an accredited UK higher education institution if you are 16 or over.",
  flagEmoji: "🇬🇧",
  recommendedQuestionCount: 12,

  contextFields: [
    {
      key: "institution",
      label: "Name of your UK institution",
      type: "text",
      required: true,
      placeholder: "e.g. University of Manchester",
    },
    {
      key: "program",
      label: "Degree and field of study",
      type: "text",
      required: true,
      placeholder: "e.g. MSc Data Science",
    },
    {
      key: "cas_number",
      label: "Do you have a CAS (Confirmation of Acceptance for Studies)?",
      type: "select",
      required: true,
      options: ["Yes", "No - still awaiting"],
    },
    {
      key: "funding_source",
      label: "How are you funding your studies?",
      type: "select",
      required: true,
      options: [
        "Personal/family funds",
        "Scholarship",
        "Government scholarship",
        "Employer sponsorship",
        "Student loan",
      ],
    },
    {
      key: "english_test",
      label: "English language test and score",
      type: "text",
      required: false,
      placeholder: "e.g. IELTS 7.0, TOEFL 100",
    },
  ],

  questionCategories: [
    {
      id: "academic_intent",
      label: "Academic Intent",
      description: "Why this course at this UK institution",
      weight: 0.25,
      seedQuestions: [
        "Why did you choose to study in the UK specifically?",
        "Why this university and this course?",
        "How does this degree fit into your career plan?",
        "Did you consider studying in your home country instead?",
      ],
    },
    {
      id: "financial_support",
      label: "Financial Support",
      description: "Ability to fund tuition and maintenance",
      weight: 0.25,
      seedQuestions: [
        "How will you fund your tuition fees?",
        "How will you support yourself financially during your studies?",
        "Can you demonstrate you have the required maintenance funds?",
        "Who is sponsoring your studies if not self-funded?",
      ],
    },
    {
      id: "return_intent",
      label: "Intention to Leave the UK",
      description: "Non-immigrant intent after course completion",
      weight: 0.25,
      seedQuestions: [
        "What are your plans after completing your degree?",
        "Do you intend to work in the UK after graduating?",
        "What ties do you have back home?",
        "Do you have family obligations in your home country?",
      ],
    },
    {
      id: "eligibility",
      label: "Eligibility & Documentation",
      description: "CAS, English, and institutional acceptance",
      weight: 0.15,
      seedQuestions: [
        "Have you received your CAS number from your institution?",
        "What was your English language test result?",
        "Have you made arrangements for accommodation in the UK?",
      ],
    },
    {
      id: "academic_background",
      label: "Academic Background",
      description: "Prior qualifications and readiness",
      weight: 0.1,
      seedQuestions: [
        "Tell me about your previous academic qualifications.",
        "What is your undergraduate result or A-level grades?",
        "Have you had any prior education in English?",
      ],
    },
  ],

  officerPersona: {
    tone: "professional, formal, measured",
    strictness: "standard",
    systemPromptTemplate: `You are a UK Visas and Immigration officer conducting a student visa interview.

APPLICANT CONTEXT:
- Institution: {{institution}}
- Program: {{program}}
- CAS status: {{cas_number}}
- Funding: {{funding_source}}
- English test: {{english_test}}

YOUR ROLE:
- Conduct a formal UK student visa interview
- Ask ONE question per turn
- Begin with the applicant's choice of institution and course
- Probe financial ability - UK requires proof of maintenance funds
- Assess intention to leave the UK after studies
- Check CAS and institutional acceptance
- Do NOT break character, offer help, or explain your questions
- Be professional and formal - not aggressive, but not warm

Brief responses. One question per turn.`,
  },

  evaluationCriteria: [
    {
      id: "clarity",
      label: "Clarity & Communication",
      description: "How clearly the applicant communicated",
      weight: 0.15,
    },
    {
      id: "academic_fit",
      label: "Course & Career Alignment",
      description: "How well the course fits stated goals",
      weight: 0.25,
    },
    {
      id: "financial_proof",
      label: "Financial Evidence",
      description: "Credibility of funding and maintenance evidence",
      weight: 0.25,
    },
    {
      id: "return_intent",
      label: "Intent to Leave",
      description: "Strength of ties to home country",
      weight: 0.25,
    },
    {
      id: "consistency",
      label: "Consistency",
      description: "Consistency of answers throughout",
      weight: 0.1,
    },
  ],
};
