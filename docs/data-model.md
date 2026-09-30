# Data Model (Phase 1)

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
