import type { TavusConversation } from "@/types";
import { randomId } from "@/lib/utils";

export const MOCK_TAVUS_ENABLED =
  process.env.NEXT_PUBLIC_TAVUS_MOCK === "true" ||
  !process.env.NEXT_PUBLIC_TAVUS_API_KEY;

export interface MockConversationOptions {
  conversationName?: string;
  visaProfileId?: string;
}

export function createMockConversation(
  opts: MockConversationOptions = {}
): TavusConversation {
  return {
    conversation_id: `mock_${randomId()}`,
    conversation_url: `/interview-mock`,
    status: "active",
    replica_id: "mock_replica",
    persona_id: `mock_persona_${opts.visaProfileId ?? "us-b1b2"}`,
    created_at: new Date().toISOString(),
  };
}

export const MOCK_OFFICER_QUESTIONS: Record<string, string[]> = {
  "us-b1b2": [
    "Good morning. What is the purpose of your trip to the United States?",
    "Which cities will you visit, and for how long?",
    "What do you do for work?",
    "How much do you earn?",
    "Who is paying for this trip?",
    "Are you married? Do you have children?",
    "What happens to your job while you are away?",
    "Do you have any family or relatives in the United States?",
    "Have you traveled outside your country before?",
    "Have you ever been refused a US visa?",
    "What ties you to your home country - what brings you back?",
    "When do you plan to return?",
  ],
  "us-f1": [
    "Good morning. Which institution have you been admitted to in the United States?",
    "What program of study will you be pursuing?",
    "Why did you choose this particular school and program?",
    "How will you be funding your education?",
    "What are your plans after you complete your studies?",
    "Do you have family members in the United States?",
    "What ties do you have to your home country to ensure you return after your studies?",
    "Have you been issued a Form I-20 by your university?",
    "What is your current level of English proficiency?",
    "Can you describe your academic background and how it prepared you for this program?",
  ],
  "uk-student": [
    "Good morning. What course have you been offered a place on in the UK?",
    "Why have you chosen to study this particular course?",
    "How did you select this institution?",
    "What are your plans after completing your studies?",
    "How will you be funding your studies and living expenses?",
    "Do you have a Confirmation of Acceptance for Studies (CAS) number?",
    "Have you made arrangements for accommodation in the UK?",
    "What ties do you have to your home country?",
    "Have you studied in the UK or applied for a UK visa previously?",
    "Can you describe your academic background?",
  ],
};

export function getMockQuestions(visaProfileId: string): string[] {
  return MOCK_OFFICER_QUESTIONS[visaProfileId] ?? MOCK_OFFICER_QUESTIONS["us-b1b2"];
}
