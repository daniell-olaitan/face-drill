"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Node rendered on the right of the label row (e.g. a "Forgot password?" link). */
  labelAction?: React.ReactNode;
  /** Styling for placement on a dark section. */
  dark?: boolean;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    success,
    hint,
    prefix,
    suffix,
    labelAction,
    dark = false,
    type = "text",
    id,
    name,
    required,
    className,
    containerClassName,
    ...props
  },
  ref
) {
  const [show, setShow] = React.useState(false);
  const reactId = React.useId();
  const inputId = id ?? name ?? reactId;

  const isPassword = type === "password";
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  const fieldBase = dark
    ? "bg-transparent text-white placeholder:text-white/30"
    : "bg-surface text-ink placeholder:text-ink-tertiary";

  const stateBorder = error
    ? "border-danger focus:ring-danger/30 focus:border-danger"
    : success
    ? "border-success focus:ring-success/30 focus:border-success"
    : dark
    ? "border-white/15 focus:ring-white/15 focus:border-white/40"
    : "border-border focus:ring-brand-600/30 focus:border-brand-600";

  const effectiveSuffix = isPassword ? (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShow((s) => !s)}
      aria-label={show ? "Hide password" : "Show password"}
      className="text-ink-tertiary hover:text-ink transition-colors focus:outline-none"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  ) : (
    suffix
  );

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {(label || labelAction) && (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <label
              htmlFor={inputId}
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.14em]",
                dark ? "text-white/50" : "text-ink-secondary"
              )}
            >
              {label}
              {required && <span className="text-danger ml-1">*</span>}
            </label>
          ) : (
            <span />
          )}
          {labelAction}
        </div>
      )}

      <div className="relative">
        {prefix && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={resolvedType}
          required={required}
          className={cn(
            "h-11 w-full rounded-xs border px-4 text-sm focus:outline-none focus:ring-2 transition-colors disabled:opacity-50",
            fieldBase,
            stateBorder,
            prefix && "pl-10",
            effectiveSuffix && "pr-10",
            className
          )}
          {...props}
        />
        {effectiveSuffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{effectiveSuffix}</div>
        )}
      </div>

      {error && <p className="text-[12px] text-danger">{error}</p>}
      {success && !error && <p className="text-[12px] text-success">{success}</p>}
      {hint && !error && !success && <p className="text-[12px] text-ink-tertiary">{hint}</p>}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
