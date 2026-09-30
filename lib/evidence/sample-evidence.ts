/**
 * Sample (prototype) evidence loader (working prototype, no retrieval).
 *
 * Reads illustrative entries from data/demo/ashwabrahm/evidence.json.
 * This is NOT the corpus manifest (see lib/evidence/manifest.ts).
 * Every entry must carry the "Prototype / illustrative evidence" label.
 */
import { z } from "zod";

export const SAMPLE_EVIDENCE_TYPES = [
  "prior_art",
  "traditional_knowledge",
  "abs",
  "regulatory",
] as const;

export const SAMPLE_EVIDENCE_LABEL = "Prototype / illustrative evidence" as const;

export const sampleEvidenceSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(SAMPLE_EVIDENCE_TYPES),
    jurisdiction: z.string().min(1),
    relatedIngredients: z.array(z.string()).default([]),
    relatedProcess: z.array(z.string()).default([]),
    summary: z.string().min(1),
    label: z.literal(SAMPLE_EVIDENCE_LABEL),
  })
  .strict();

export type SampleEvidenceType = z.infer<typeof sampleEvidenceSchema>["type"];
export type SampleEvidence = z.infer<typeof sampleEvidenceSchema>;

const sampleEvidenceFileSchema = z
  .object({
    items: z.array(sampleEvidenceSchema),
  })
  .passthrough();

export interface SampleEvidenceParseResult {
  valid: boolean;
  items: SampleEvidence[];
  errors: string[];
}

export function parseSampleEvidence(input: unknown): SampleEvidenceParseResult {
  const parsed = sampleEvidenceFileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      valid: false,
      items: [],
      errors: parsed.error.issues.map((issue) => {
        const at = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `${at}: ${issue.message}`;
      }),
    };
  }
  return { valid: true, items: parsed.data.items, errors: [] };
}
