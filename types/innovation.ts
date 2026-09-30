/**
 * Innovation domain types (Phase 1 — shapes only, no logic).
 */

export type InnovationElementKind =
  | "ingredient"
  | "formulation"
  | "process"
  | "intended_use"
  | "claim"
  | "biological_resource";

export interface InnovationElement {
  id: string;
  kind: InnovationElementKind;
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface InnovationIngredient extends InnovationElement {
  kind: "ingredient";
  scientificName?: string;
  partUsed?: string;
  quantity?: string;
}

export interface InnovationClaim {
  id: string;
  text: string;
  elementIds: string[];
}

export interface BiologicalResource {
  id: string;
  name: string;
  scientificName?: string;
  sourceRegion?: string;
  jurisdictionCode: string;
}

export interface InnovationMetadata {
  title: string;
  summary?: string;
  creators?: string[];
  createdAt: string;
  updatedAt: string;
  language?: string;
}

export interface Innovation {
  id: string;
  metadata: InnovationMetadata;
  ingredients: InnovationIngredient[];
  formulation?: string;
  process?: string[];
  intendedUse?: string[];
  claims: InnovationClaim[];
  biologicalResources: BiologicalResource[];
  jurisdictions: string[];
}

export interface InnovationVersion {
  id: string;
  innovationId: string;
  version: number;
  snapshot: Innovation;
  createdAt: string;
  note?: string;
}
