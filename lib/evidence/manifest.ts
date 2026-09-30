/**
 * Corpus manifest schemas + loader (Phase 2).
 *
 * The manifest is the registry of every evidence item the system may cite.
 * It starts empty; entries are added only with verified provenance.
 * Never invent manifest entries.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

export const MANIFEST_SOURCE_CATEGORIES = [
  "patent",
  "traditional_knowledge",
  "abs_register",
  "regulatory",
  "literature",
] as const;

export const sourceCategorySchema = z.enum(MANIFEST_SOURCE_CATEGORIES);

export const MANIFEST_VERIFICATION_STATUSES = [
  "verified",
  "pending",
  "unverified",
] as const;

export const verificationStatusSchema = z.enum(MANIFEST_VERIFICATION_STATUSES);

const isoDateSchema = z
  .string()
  .min(1, "Retrieved date is required.")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Retrieved date must be a parseable date string.",
  });

export const manifestItemSchema = z
  .object({
    id: z.string().min(1, "Manifest item id is required."),
    title: z.string().min(1, "Manifest item title is required."),
    sourceCategory: sourceCategorySchema,
    jurisdiction: z.string().min(1, "Jurisdiction is required."),
    /** Origin URL or archival reference for the item. */
    origin: z.string().min(1, "Origin/URL is required."),
    /** License or access status, e.g. "public", "restricted", "unknown". */
    license: z.string().min(1, "License/access status is required."),
    retrievedDate: isoDateSchema,
    version: z.number().int().positive("Version must be a positive integer."),
    /** Hex content hash of the retrieved bytes. */
    contentHash: z.string().min(1, "Content hash is required."),
    verificationStatus: verificationStatusSchema,
  })
  .strict();

export const manifestSchema = z
  .object({
    manifestVersion: z.number().int().positive(),
    items: z.array(manifestItemSchema),
  })
  .strict();

export type ManifestSourceCategory = z.infer<typeof sourceCategorySchema>;
export type ManifestVerificationStatus = z.infer<typeof verificationStatusSchema>;
export type ManifestItem = z.infer<typeof manifestItemSchema>;
export type CorpusManifest = z.infer<typeof manifestSchema>;

export interface ManifestLoadResult {
  path: string;
  manifest: CorpusManifest | null;
  errors: string[];
}

export function validateManifestData(input: unknown): {
  valid: boolean;
  manifest: CorpusManifest | null;
  errors: string[];
} {
  const parsed = manifestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      valid: false,
      manifest: null,
      errors: parsed.error.issues.map((issue) => {
        const at = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `${at}: ${issue.message}`;
      }),
    };
  }
  return { valid: true, manifest: parsed.data, errors: [] };
}

export function defaultManifestPath(): string {
  return path.resolve("data", "evidence", "manifest.json");
}

export async function loadManifestFile(
  manifestPath: string = defaultManifestPath()
): Promise<ManifestLoadResult> {
  let raw: string;
  try {
    raw = await fs.readFile(manifestPath, "utf8");
  } catch {
    return { path: manifestPath, manifest: null, errors: [`Cannot read manifest file: ${manifestPath}`] };
  }
  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    return { path: manifestPath, manifest: null, errors: [`Manifest is not valid JSON: ${manifestPath}`] };
  }
  const { valid, manifest, errors } = validateManifestData(data);
  void valid;
  return { path: manifestPath, manifest, errors };
}

export interface ManifestCounts {
  total: number;
  perCategory: Record<string, number>;
  perJurisdiction: Record<string, number>;
}

export function countManifest(manifest: CorpusManifest): ManifestCounts {
  const perCategory: Record<string, number> = {};
  const perJurisdiction: Record<string, number> = {};
  for (const item of manifest.items) {
    perCategory[item.sourceCategory] = (perCategory[item.sourceCategory] ?? 0) + 1;
    perJurisdiction[item.jurisdiction] = (perJurisdiction[item.jurisdiction] ?? 0) + 1;
  }
  return { total: manifest.items.length, perCategory, perJurisdiction };
}
