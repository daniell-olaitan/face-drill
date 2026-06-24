"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) { toast.error(error.message); return; }
      setEmailSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-100">
        <div className="w-12 h-12 rounded-sm bg-brand-600/10 border border-brand-600/20 flex items-center justify-center mb-7">
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-[1.75rem] font-bold text-ink tracking-tight mb-2">Check your inbox</h2>
        <p className="text-sm text-ink-secondary leading-relaxed mb-7">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-ink">{email}</span>. Click it to activate
          your account.
        </p>
        <Link
          href="/sign-in"
          className="text-sm text-ink-secondary hover:text-ink transition-colors font-medium"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-100">
      <div className="mb-9">
        <h1 className="text-[1.75rem] font-bold text-ink tracking-tight mb-2">
          Create your account
        </h1>
        <p className="text-sm text-ink-secondary">
          Already have one?{" "}
          <Link
            href="/sign-in"
            className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        <Input
          label="Full name"
          id="full-name"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          disabled={loading}
        />
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
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          disabled={loading}
        />

        <Button type="submit" variant="dark" size="xl" className="w-full mt-1" loading={loading}>
          Create account
        </Button>

        <p className="text-[11px] text-ink-tertiary text-center">
          By signing up you agree to our{" "}
          <span className="text-ink-secondary">Terms</span> and{" "}
          <span className="text-ink-secondary">Privacy Policy</span>.
        </p>
      </form>
    </div>
  );
}
