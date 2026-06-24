"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Show a character counter (auto-shown when maxLength is set). */
  showCount?: boolean;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, containerClassName, label, error, hint, showCount, id, name, required, maxLength, value, ...props },
  ref
) {
  const reactId = React.useId();
  const inputId = id ?? name ?? reactId;
  const count = typeof value === "string" ? value.length : 0;
  const counterShown = (showCount || maxLength) != null && (showCount || !!maxLength);

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {(label || counterShown) && (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <label
              htmlFor={inputId}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-secondary"
            >
              {label}
              {required && <span className="text-danger ml-1">*</span>}
            </label>
          ) : (
            <span />
          )}
          {counterShown && (
            <span
              className={cn(
                "text-[11px] tabular-nums",
                maxLength && count >= maxLength ? "text-danger" : "text-ink-tertiary"
              )}
            >
              {count}
              {maxLength ? `/${maxLength}` : ""}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        required={required}
        maxLength={maxLength}
        value={value}
        className={cn(
          "min-h-25 w-full rounded-xs border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 transition-colors resize-y disabled:opacity-50 leading-relaxed",
          error
            ? "border-danger focus:ring-danger/30 focus:border-danger"
            : "border-border focus:ring-brand-600/30 focus:border-brand-600",
          className
        )}
        {...props}
      />
      {error && <p className="text-[12px] text-danger">{error}</p>}
      {hint && !error && <p className="text-[12px] text-ink-tertiary">{hint}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
