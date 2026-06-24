"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only ever redirect to an internal path - never an attacker-supplied
  // absolute/protocol-relative URL (open-redirect / phishing guard).
  const rawRedirect = searchParams.get("redirectTo");
  const redirectTo =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); return; }
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-100">
      <div className="mb-9">
        <h1 className="text-[1.75rem] font-bold text-ink tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-ink-secondary">
          No account?{" "}
          <Link
            href="/sign-up"
            className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>

      <form onSubmit={handleSignIn} className="flex flex-col gap-5">
        <Input
          label="Email"
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
          labelAction={
            <button
              type="button"
              className="text-[12px] text-ink-tertiary hover:text-ink transition-colors"
            >
              Forgot password?
            </button>
          }
        />

        <Button type="submit" variant="dark" size="xl" className="w-full mt-1" loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  );
}

export default function SignInPage() {
  // useSearchParams() requires a Suspense boundary for static prerendering.
  return (
    <React.Suspense fallback={<div className="w-full max-w-100" />}>
      <SignInForm />
    </React.Suspense>
  );
}
