# Data Model (Phase 1 + Phase 2)

Canonical entities live in `types/`.

## Innovation (`types/innovation.ts`)

Innovation
├── metadata (title, creators, timestamps, language)
├── ingredients (InnovationIngredient[])
├── formulation
├── process
├── intendedUse
├── claims (InnovationClaim[] → elementIds)
├── biologicalResources (BiologicalResource[])
└── jurisdictions (codes, e.g. IN / US / EP / WO)

`InnovationVersion` snapshots an `Innovation` for scenario branching.

## Scenario (`types/scenario.ts`)

Scenario
├── baseInnovationId
├── changes (ScenarioChange[]: kind + description + payload)
├── resultingInnovation
├── impact (ScenarioImpact: risk/coverage deltas)
└── evidence (evidenceIds)

## Evidence (`types/evidence.ts`)

- `EvidenceSource` — kind, jurisdiction, URL, `verified` flag.
- `Evidence` — title, summary, strength, jurisdictions, optional
  `prototypeLabel: "Prototype / illustrative evidence"`.
- `Claim`, `ClaimElement`, `ClaimEvidenceLink` — claim-to-evidence mapping.

## Analysis (`types/analysis.ts`)

- `AnalysisKind`: `ip | tk | abs | regulatory`.
- `AnalysisFinding` + `RegulatoryFinding`; `RiskLevel`:
  `low | medium | high | critical | unknown`.
- `AnalysisResult` groups findings per innovation + kind.

## Red team (`types/red-team.ts`)

- `AttackCategory`: novelty, obviousness, prior_art, tk_conflict,
  abs_compliance, regulatory_blocker, claim_overbreadth.
- `RedTeamFinding` links target claims + evidence + mitigation.
- `ResearchGap` derives from findings with a priority.

## Jurisdiction (`types/jurisdiction.ts`)

`Jurisdiction` (code + name) and `JurisdictionRule` (category + reference).

## Report (`types/report.ts`)

`Report` → ordered `ReportSection[]` with evidence references, language tag.

## Phase 2 additions

### Structured innovation model

Source of truth: `lib/validation/innovation-model.ts` (Zod schemas;
types derived via `z.infer`, re-exported from `types/innovation.ts`).
Strict objects, no coercion.

InnovationModel
├── id, title
├── ingredients (ModeledIngredient[])
│   ├── botanicalName, synonyms (common/Sanskrit), plantPart (enum)
│   └── quantity { amount: number, unit: QuantityUnit }
├── composition (CompositionDeclaration)
│   ├── total { amount, unit } — declared total
│   └── ratios[] { ingredientId, share } — must sum to total
├── processSteps (ProcessStep[])
│   └── order, action, temperature { value, unit C|F|K },
│       duration { value, unit }, solvent { name, quantityMl? }
├── intendedUse (string[], min 1)
├── targetJurisdictions (enum: IN | US | EP | WO, min 1)
└── proposedClaims ({ id, text }[], min 1)

Validator: `validateInnovationModel()` in
`lib/innovation/model-validator.ts` returns `{ valid: true, value }` or
`{ valid: false, errors: FieldError[] }` (`path`, `code`, `message`).
Cross-field codes: `ratio_sum_mismatch`, `unknown_ingredient`,
`duplicate_ingredient_id`, `duplicate_step_order`, `invalid_share`.

### Uncertainty (`types/uncertainty.ts`)

`UncertaintyState`: `insufficient_evidence | conflicting_evidence |
not_discriminated_by_corpus | needs_professional_review`.
Every `AnalysisFinding` and `RedTeamFinding` now carries `uncertainty`,
`evidenceRefs[]`, plus `sourceFact` (what sources state) separate from
`interpretation` (what the analyzer infers).

### Corpus manifest

- `data/evidence/manifest.json` — registry; starts empty (`{ manifestVersion: 1, items: [] }`).
- `data/evidence/manifest.schema.json` — JSON Schema (draft 2020-12), mirrors the Zod schemas.
- `lib/evidence/manifest.ts` — `manifestItemSchema` (id, title,
  sourceCategory, jurisdiction, origin, license, retrievedDate, version,
  contentHash, verificationStatus), `validateManifestData()`,
  `loadManifestFile()`, `countManifest()`.
- `pnpm manifest:validate` — validates and prints counts per category and jurisdiction.

### Rubric (`lib/analysis/rubric.config.ts`)

`RUBRIC_VERSION = "0.1.0-phase2-example"`. Per-module config maps
`EvidenceAttributes` → `IndicatorLevel` (`high | medium | low |
indeterminate`) via ordered, first-match-wins pure rules evaluated by
`evaluateIndicator()` (deterministic; falls back to `indeterminate`).
One rule is provided, explicitly marked EXAMPLE and not validated;
TK/ABS/regulatory modules are structural placeholders.
