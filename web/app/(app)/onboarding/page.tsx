"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { visaProfiles } from "@/lib/visa-profiles";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import type { VisaProfile, ContextField, SessionContext } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function StepNode({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors duration-300",
          active || done ? "bg-ink text-white" : "bg-surface border border-border text-ink-tertiary"
        )}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : n}
      </span>
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.12em] hidden sm:inline transition-colors duration-300",
          active || done ? "text-ink" : "text-ink-tertiary"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function VisaCard({
  profile,
  selected,
  onSelect,
}: {
  profile: VisaProfile;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col gap-4 border p-5 text-left rounded-[8px] transition-all duration-150 cursor-pointer",
        selected
          ? "border-ink ring-1 ring-ink bg-surface"
          : "border-border bg-surface hover:border-ink-tertiary hover:-translate-y-0.5 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="w-11 h-11 rounded-sm border border-border bg-surface-raised flex items-center justify-center text-xl shrink-0">
          {profile.flagEmoji ?? "🌐"}
        </span>
        <span
          className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
            selected ? "bg-ink border-ink" : "border-border-strong group-hover:border-ink-tertiary"
          )}
        >
          {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </span>
      </div>

      <div>
        <p className="font-semibold text-ink text-[15px] leading-tight">{profile.shortLabel}</p>
        <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary bg-surface-raised border border-border px-1.5 py-0.5 rounded-[3px]">
          {profile.category}
        </span>
      </div>

      <p className="text-[12px] text-ink-secondary leading-relaxed line-clamp-2">
        {profile.description}
      </p>
    </button>
  );
}

function ContextFormField({
  field,
  value,
  onChange,
}: {
  field: ContextField;
  value: string;
  onChange: (val: string) => void;
}) {
  if (field.type === "select" && field.options) {
    return (
      <Select
        id={field.key}
        label={field.label}
        required={field.required}
        title={field.label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Select an option"
        options={field.options.map((opt) => ({ value: opt, label: opt }))}
      />
    );
  }

  return (
    <Input
      id={field.key}
      label={field.label}
      required={field.required}
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      min={field.type === "number" ? "0" : undefined}
    />
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedProfile, setSelectedProfile] = React.useState<VisaProfile | null>(null);
  const [responses, setResponses] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  function handleFieldChange(key: string, value: string) {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProfile) return;

    const missingRequired = selectedProfile.contextFields
      .filter((f) => f.required && !responses[f.key]?.trim())
      .map((f) => f.label);

    if (missingRequired.length > 0) {
      toast.error(`Please fill in: ${missingRequired.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      const context: SessionContext = {
        visaProfileId: selectedProfile.id,
        destinationCountry: selectedProfile.country,
        purposeOfTravel: responses.purpose ?? "Tourism",
        responses,
      };

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      const json = (await res.json()) as {
        data: { id: string } | null;
        error: { message: string } | null;
      };

      if (!res.ok || !json.data) {
        toast.error(json.error?.message ?? "Failed to create session.");
        return;
      }

      router.push(`/interview/${json.data.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 sm:py-14">

      {/* ── STEP INDICATOR ─────────────────────────────── */}
      <div className="flex items-center gap-4 mb-12">
        <StepNode n={1} label="Visa type" active={step === 1} done={step === 2} />
        <div className="h-px flex-1 bg-border relative overflow-hidden rounded-full">
          <motion.div
            className="absolute inset-y-0 left-0 bg-ink rounded-full"
            initial={false}
            animate={{ width: step === 2 ? "100%" : "0%" }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          />
        </div>
        <StepNode n={2} label="Your details" active={step === 2} done={false} />
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Visa selection ── */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary mb-5">
              Step 1 of 2
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-3">
              Choose your visa type
            </h1>
            <p className="text-sm text-ink-secondary mb-8 leading-relaxed max-w-md">
              Select the visa you are practicing for. The officer&apos;s questions are tailored to
              your specific interview.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {visaProfiles.map((profile) => (
                <VisaCard
                  key={profile.id}
                  profile={profile}
                  selected={selectedProfile?.id === profile.id}
                  onSelect={() => setSelectedProfile(profile)}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="dark"
              size="lg"
              disabled={!selectedProfile}
              onClick={() => setStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* ── STEP 2: Context form ── */}
        {step === 2 && selectedProfile && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="mb-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Selected visa chip */}
            <div className="inline-flex items-center gap-2 mb-5 border border-border rounded-full pl-2 pr-3 py-1">
              <span className="w-6 h-6 rounded-full bg-surface-raised flex items-center justify-center text-sm">
                {selectedProfile.flagEmoji}
              </span>
              <span className="text-[12px] font-semibold text-ink">{selectedProfile.shortLabel}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-3">
              Tell us about your trip
            </h1>
            <p className="text-sm text-ink-secondary mb-8 leading-relaxed max-w-md">
              The officer will be briefed on this context. Give honest, accurate details - the
              practice is only as useful as the information you provide.
            </p>

            <form onSubmit={handleStart} className="flex flex-col gap-5">
              {selectedProfile.contextFields.map((field) => (
                <ContextFormField
                  key={field.key}
                  field={field}
                  value={responses[field.key] ?? ""}
                  onChange={(val) => handleFieldChange(field.key, val)}
                />
              ))}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2 self-start"
              >
                Start interview
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
