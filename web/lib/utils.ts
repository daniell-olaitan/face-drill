import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function scoreToGrade(score: number): string {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function scoreToLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

export function scoreToColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-red-600";
}

export function verdictToLabel(verdict: string): string {
  switch (verdict) {
    case "likely_approve":
      return "Likely Approved";
    case "borderline":
      return "Borderline";
    case "likely_refuse":
      return "Likely Refused";
    default:
      return "Unknown";
  }
}

export function verdictToColor(verdict: string): string {
  switch (verdict) {
    case "likely_approve":
      return "text-emerald-600";
    case "borderline":
      return "text-amber-600";
    case "likely_refuse":
      return "text-red-600";
    default:
      return "text-ink-secondary";
  }
}

export function ratingToColor(rating: string): string {
  switch (rating) {
    case "strong":
      return "text-emerald-600 bg-emerald-50";
    case "adequate":
      return "text-amber-600 bg-amber-50";
    case "weak":
      return "text-red-600 bg-red-50";
    default:
      return "text-ink-secondary bg-surface-raised";
  }
}

export function severityToColor(severity: string): string {
  switch (severity) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "low":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-ink-secondary bg-surface-raised border-border";
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 11);
}
