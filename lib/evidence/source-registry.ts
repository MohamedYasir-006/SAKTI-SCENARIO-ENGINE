/**
 * Source registry placeholder (Phase 1 — declarative stubs only).
 * TODO: register real evidence sources in Phase 2.
 */
import type { EvidenceSourceKind } from "@/types/evidence";

export interface SourceRegistryEntry {
  kind: EvidenceSourceKind;
  name: string;
  enabled: boolean;
}

export const SOURCE_REGISTRY: SourceRegistryEntry[] = [
  { kind: "patent", name: "Patent registers (to be integrated)", enabled: false },
  { kind: "traditional_knowledge", name: "Traditional knowledge (to be integrated)", enabled: false },
  { kind: "abs_register", name: "ABS / biodiversity registers (to be integrated)", enabled: false },
  { kind: "regulatory", name: "Regulatory sources (to be integrated)", enabled: false },
  { kind: "literature", name: "Research literature (to be integrated)", enabled: false },
];
