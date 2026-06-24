import type { VisaProfile } from "@/types";
import { usB1B2Profile } from "./us-b1b2";
import { usF1Profile } from "./us-f1";
import { ukStudentProfile } from "./uk-student";

export const visaProfiles: VisaProfile[] = [
  usB1B2Profile,
  usF1Profile,
  ukStudentProfile,
];

export const visaProfileMap = new Map<string, VisaProfile>(
  visaProfiles.map((p) => [p.id, p])
);

export function getVisaProfile(id: string): VisaProfile | undefined {
  return visaProfileMap.get(id);
}

export function getVisaProfileOrThrow(id: string): VisaProfile {
  const profile = visaProfileMap.get(id);
  if (!profile) throw new Error(`Unknown visa profile: ${id}`);
  return profile;
}

export { usB1B2Profile, usF1Profile, ukStudentProfile };
