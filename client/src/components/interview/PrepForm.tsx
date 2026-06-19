import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PrepAnswers } from "@/lib/interviewStorage";

interface PrepFormProps {
  /** Receives the answers plus a context string for the officer (null if empty). */
  onSubmit: (answers: PrepAnswers, context: string | null) => void;
  onSkip: () => void;
  onLeave: () => void;
}

/** Build the officer-facing context string from whatever the applicant filled in. */
export const buildPrepContext = (a: PrepAnswers): string | null => {
  const lines: string[] = [];
  if (a.purpose?.trim()) lines.push(`Purpose of trip: ${a.purpose.trim()}.`);
  if (a.funding?.trim()) lines.push(`Who is paying: ${a.funding.trim()}.`);
  if (a.occupation?.trim()) lines.push(`Job or school: ${a.occupation.trim()}.`);
  if (a.ties?.trim()) lines.push(`Ties to home country: ${a.ties.trim()}.`);
  if (a.priorTravel?.trim()) lines.push(`Prior U.S. travel: ${a.priorTravel.trim()}.`);
  if (lines.length === 0) return null;
  return (
    "The applicant gave these details in advance (treat this as their application). " +
    "Reference them, check their spoken answers for consistency, and press on anything vague:\n" +
    lines.join("\n")
  );
};

const PrepForm = ({ onSubmit, onSkip, onLeave }: PrepFormProps) => {
  const [answers, setAnswers] = useState<PrepAnswers>({});

  const update = (key: keyof PrepAnswers) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAnswers((prev) => ({ ...prev, [key]: e.target.value }));

  const start = () => onSubmit(answers, buildPrepContext(answers));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="container flex h-14 shrink-0 items-center sm:h-16">
        <Button variant="ghost" size="sm" onClick={onLeave} className="text-muted-foreground">
          Leave
        </Button>
      </div>

      <div className="container flex flex-1 flex-col items-center justify-center pb-10">
        <div className="w-full max-w-lg">
          <h1 className="font-display text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            A few details first — optional
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Real officers already have your application in front of them. Fill these
            in and the officer will interview you on your actual situation and probe
            inconsistencies, just like the real thing. Prefer to wing it? Skip.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="purpose">Purpose of your trip</Label>
              <Input id="purpose" value={answers.purpose ?? ""} onChange={update("purpose")} placeholder="e.g. attending my sister's graduation" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="funding">Who is paying for the trip?</Label>
              <Input id="funding" value={answers.funding ?? ""} onChange={update("funding")} placeholder="e.g. myself, from my salary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="occupation">Your job or school</Label>
              <Input id="occupation" value={answers.occupation ?? ""} onChange={update("occupation")} placeholder="e.g. software engineer at Acme, 3 years" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ties">Your strongest ties to home</Label>
              <Textarea id="ties" value={answers.ties ?? ""} onChange={update("ties")} placeholder="e.g. permanent job, my own apartment, parents and siblings" rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priorTravel">Prior U.S. travel (if any)</Label>
              <Input id="priorTravel" value={answers.priorTravel ?? ""} onChange={update("priorTravel")} placeholder="e.g. none, or: visited in 2022 and returned" />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={start} className="w-full sm:w-auto">
              Start interview
            </Button>
            <Button size="lg" variant="ghost" onClick={onSkip} className="w-full text-muted-foreground sm:w-auto">
              Skip, just start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrepForm;
