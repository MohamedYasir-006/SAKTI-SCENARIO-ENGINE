/**
 * Shared Zod validation schemas (Phase 1 — request shapes only).
 */
import { z } from "zod";

export const innovationAnalyzeSchema = z.object({
  innovationId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  jurisdictionCodes: z.array(z.string()).default([]),
});

export const innovationDecomposeSchema = z.object({
  innovationId: z.string().min(1),
});

export const scenarioCreateSchema = z.object({
  baseInnovationId: z.string().min(1),
  name: z.string().min(1),
  changes: z
    .array(
      z.object({
        kind: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .default([]),
});

export const scenarioCompareSchema = z.object({
  scenarioAId: z.string().min(1),
  scenarioBId: z.string().min(1),
});

export const scenarioAnalyzeSchema = z.object({
  scenarioId: z.string().min(1),
});

export const redTeamRunSchema = z.object({
  innovationId: z.string().min(1),
  scenarioId: z.string().min(1).optional(),
});

export const reportGenerateSchema = z.object({
  innovationId: z.string().min(1),
  scenarioId: z.string().min(1).optional(),
  jurisdictionCodes: z.array(z.string()).default([]),
});
