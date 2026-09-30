# Architecture — IP-SAKTI Scenario Engine (Phase 1)

Design → Analyse → Simulate → Attack → Modify → Re-analyse

## Layers

### Frontend (`app/`, `components/`)
- Next.js App Router. Route group `(dashboard)` hosts product pages.
- `components/layout` — sidebar, header, page container, navigation.
- `components/ui` — shadcn-style primitives (cva + Tailwind).
- Domain component folders (`innovation`, `analysis`, `evidence`, `scenario`,
  `red-team`, `research`, `jurisdiction`, `reports`, `common`) hold Phase 2 UI.
  Current files are placeholders.

### API layer (`app/api/`)
Thin route handlers: validate request shape with Zod, delegate to `lib/`
services. Phase 1 returns `501 { status: "not_implemented" }`.

### Service layer (`lib/`)
| Folder | Responsibility (Phase 2) |
|---|---|
| `lib/innovation` | Decomposition, validation, persistence access |
| `lib/analysis` | IP / TK / ABS / regulatory analyzers + orchestrator |
| `lib/scenario` | Scenario engine, comparator, impact, versions |
| `lib/retrieval` | Jurisdiction-aware search, ranking, filters |
| `lib/evidence` | Evidence service, validator, source registry |
| `lib/redteam` | Red-team engine, attack strategies, findings |
| `lib/jurisdiction` | Jurisdiction data + rules |
| `lib/reports` | Report generation + service |
| `lib/ai` | Provider client, prompts, AI types (no calls in Phase 1) |
| `lib/demo` | Demo constants (illustrative only) |
| `lib/validation` | Shared Zod schemas |
| `lib/utils` | Constants, helpers, formatters, env, `cn` |

### Evidence layer (`data/evidence`, `lib/evidence`, `lib/retrieval`)
Corpora live under `data/evidence/{patents,traditional-knowledge,abs,regulatory}`.
Unverified items must be labelled `Prototype / illustrative evidence`.
Never invent patent numbers or government citations.

### Scenario engine (`lib/scenario`, `types/scenario.ts`)
Base innovation + ordered `ScenarioChange[]` → resulting innovation + impact.
Comparison and version history are stubbed for Phase 2.

### Red-team engine (`lib/redteam`, `types/red-team.ts`)
Attack strategies per `AttackCategory`; findings link to claims + evidence.
Research gaps derive from findings (see `components/research`).

### Data layer (`data/`, `types/`)
- `types/` — canonical TypeScript entities (strongly typed, no `any`).
- `data/demo/ashwabrahm/` — illustrative demo payloads only.
- `data/jurisdictions/` — jurisdiction stubs.
- Database / vector store integrations are Phase 2+ (see `.env.example`).
