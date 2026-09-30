/**
 * Simple client-side snapshot storage (prototype, no database).
 *
 * The validated innovation from /analysis is shared with /scenario-lab,
 * and scenario versions are shared with /red-team, via localStorage.
 */
import type { AnalysisKind, AnalysisFinding } from "@/types/analysis";
import type { InnovationModel } from "@/lib/validation/innovation-model";
import { validateInnovationModel } from "@/lib/innovation/model-validator";

export const INNOVATION_KEY = "ipsakti.innovation.v1";
export const SCENARIO_KEY = "ipsakti.scenario.v1";

function readKey(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function writeKey(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: prototype continues without persistence.
  }
}

export function saveInnovation(model: InnovationModel): void {
  writeKey(INNOVATION_KEY, model);
}

export function loadInnovation(): InnovationModel | null {
  const result = validateInnovationModel(readKey(INNOVATION_KEY));
  return result.valid ? result.value : null;
}

export interface ScenarioVariantSnapshot {
  version: string;
  model: InnovationModel;
}

export interface ScenarioSnapshot {
  base: InnovationModel;
  baseFindings: Record<AnalysisKind, AnalysisFinding>;
  baseGaps: number;
  variants: ScenarioVariantSnapshot[];
}

export function saveScenario(snapshot: ScenarioSnapshot): void {
  writeKey(SCENARIO_KEY, snapshot);
}

export function loadScenario(): ScenarioSnapshot | null {
  const data = readKey(SCENARIO_KEY) as ScenarioSnapshot | null;
  if (!data || !data.base || !Array.isArray(data.variants)) return null;
  if (!validateInnovationModel(data.base).valid) return null;
  for (const variant of data.variants) {
    if (!validateInnovationModel(variant.model).valid) return null;
  }
  return data;
}
