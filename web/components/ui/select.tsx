"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, containerClassName, error, label, hint, options, placeholder, id, name, required, ...props },
  ref
) {
  const reactId = React.useId();
  const selectId = id ?? name ?? reactId;

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-secondary"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          required={required}
          className={cn(
            "h-11 w-full appearance-none rounded-xs border bg-surface pl-4 pr-10 text-sm text-ink focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 cursor-pointer",
            error
              ? "border-danger focus:ring-danger/30 focus:border-danger"
              : "border-border focus:ring-brand-600/30 focus:border-brand-600",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-ink-tertiary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      {hint && !error && <p className="text-[12px] text-ink-tertiary">{hint}</p>}
    </div>
  );
});
Select.displayName = "Select";

export { Select };
