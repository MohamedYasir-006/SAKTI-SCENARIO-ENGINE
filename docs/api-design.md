# API Design (Phase 1 — stubs)

All routes validate with Zod (`lib/validation/schemas.ts`) and return
`501 { status: "not_implemented", message }` until Phase 2.

| Method | Route | Purpose (Phase 2) |
|---|---|---|
| POST | `/api/innovation/analyze` | Run full analysis pipeline |
| POST | `/api/innovation/decompose` | Decompose into Innovation DNA |
| POST | `/api/scenario/create` | Create what-if scenario |
| POST | `/api/scenario/compare` | Diff two scenarios |
| POST | `/api/scenario/analyze` | Impact analysis for a scenario |
| GET | `/api/evidence/search` | Jurisdiction-aware evidence search |
| GET | `/api/evidence/[id]` | Evidence detail |
| POST | `/api/redteam/run` | Run red-team attack set |
| POST | `/api/reports/generate` | Generate grounded report |

Error shape for bad input: `400 { status: "invalid_request", issues }`.
