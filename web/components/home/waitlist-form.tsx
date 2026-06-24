"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WaitlistFormProps {
  dark?: boolean;
}

export function WaitlistForm({ dark = false }: WaitlistFormProps) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [joined, setJoined] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const json = (await res.json()) as { data: unknown; error: { message: string } | null };
      if (!res.ok && json.error) {
        toast.error(json.error.message);
        return;
      }
      setJoined(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (joined) {
    return (
      <div className={cn("flex items-center gap-4 py-5 border-t", dark ? "border-white/10" : "border-border")}>
        <div
          className={cn(
            "w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0",
            dark ? "bg-white/10" : "bg-success/10"
          )}
        >
          <svg
            className={cn("w-4 h-4", dark ? "text-white" : "text-success")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className={cn("text-sm font-semibold", dark ? "text-white" : "text-ink")}>
            You&apos;re on the list.
          </p>
          <p className={cn("text-xs mt-0.5", dark ? "text-white/40" : "text-ink-tertiary")}>
            We&apos;ll email <span className="font-medium">{email}</span> when VisaDrill opens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Single bar - email field with the submit button inset on the right */}
        <div
          className={cn(
            "flex items-center gap-2 h-12 pl-4 pr-1.5 rounded-xs border transition-colors",
            dark
              ? "bg-white/5 border-white/15 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-white/15"
              : "bg-surface border-border focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/30"
          )}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            aria-label="Email address"
            className={cn(
              "flex-1 min-w-0 bg-transparent text-sm focus:outline-none disabled:opacity-50",
              dark ? "text-white placeholder:text-white/30" : "text-ink placeholder:text-ink-tertiary"
            )}
          />
          <Button
            type="submit"
            variant={dark ? "white" : "dark"}
            size="md"
            loading={loading}
            disabled={!email.trim()}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="shrink-0"
          >
            Get access
          </Button>
        </div>
      </form>
      <p className={cn("text-[11px] mt-3", dark ? "text-white/25" : "text-ink-tertiary")}>
        No spam. Just your access link when we launch.
      </p>
    </div>
  );
}
