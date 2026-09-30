# IP-SAKTI Scenario Engine

Evidence-Grounded Innovation Intelligence for Ayurveda.

**SIH Problem Statement:** SIH26045

> Phase 1 established architecture. Phase 2 adds foundations of trust
> (model validation, uncertainty, corpus manifest, rubric skeleton).
> Product intelligence and data integrations arrive in later phases.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn-style UI (`components/ui`) + Lucide React
- Zod validation, Vitest, ESLint 9, Prettier, pnpm

## Implemented vs designed-only (Phase 2)

| Area | Status | Location |
|---|---|---|
| Innovation model types + Zod schemas (in sync) | ✅ Implemented | `lib/validation/innovation-model.ts`, `types/innovation.ts` |
| Model validator (typed field-level errors, no coercion) | ✅ Implemented | `lib/innovation/model-validator.ts` |
| Uncertainty states + fact-vs-interpretation on findings | ✅ Implemented | `types/uncertainty.ts`, `types/analysis.ts`, `types/red-team.ts` |
| Corpus manifest schema + loader + validate script | ✅ Implemented | `lib/evidence/manifest.ts`, `data/evidence/manifest.json`, `scripts/validate-manifest.ts` |
| Rubric structure + labelled example rule | ✅ Implemented | `lib/analysis/rubric.config.ts` |
| Vitest suites (model, manifest, rubric) | ✅ Implemented | `tests/{innovation,evidence,analysis}/*.test.ts` |
| Analyzer engines (IP/TK/ABS/regulatory) | 🔲 Designed only | `lib/analysis/*-analyzer.ts` (stubs) |
| Retrieval / RAG / AI calls | 🔲 Designed only | `lib/retrieval/*`, `lib/ai/*` (stubs) |
| Scenario engine, red-team engine, reports | 🔲 Designed only | `lib/scenario/*`, `lib/redteam/*`, `lib/reports/*` (stubs) |
| Corpus manifest entries | 🔲 Empty by design | `data/evidence/manifest.json` (`items: []`) |

## Folder structure

```text
app/            # routes: (dashboard) pages + api stubs + layout
components/     # ui, layout, innovation, analysis, evidence, scenario,
                # red-team, research, jurisdiction, reports, common
lib/            # ai, retrieval, evidence, innovation, scenario, analysis,
                # redteam, jurisdiction, reports, demo, validation, utils
types/          # canonical domain entities
data/           # evidence corpora, demo/ashwabrahm, jurisdictions
tests/          # vitest suites (innovation, evidence, analysis)
scripts/        # maintenance scripts (manifest validation)
docs/           # architecture, product, data-model, api, demo-flow
public/         # icons, images
```

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in when integrations land (Phase 2)
```

## Development

```bash
pnpm dev               # start dev server
pnpm typecheck         # tsc --noEmit
pnpm lint              # eslint
pnpm test              # vitest run
pnpm manifest:validate # validate corpus manifest + print counts
pnpm build             # production build
pnpm start             # serve production build
```

## Environment variables

See `.env.example`: `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`. Never commit secrets.

## Testing

`pnpm test` runs Vitest suites under `tests/`: model validation
(`tests/innovation/model.test.ts`), manifest validation
(`tests/evidence/manifest.test.ts`), rubric determinism
(`tests/analysis/rubric.test.ts`).

## Future implementation phases

- **Phase 3:** innovation modelling UI, retrieval, analyzers, scenario engine,
  red-team, reports, demo content.
- **Phase 4+:** RAG/vector search, external patent + TK + regulatory
  integrations, multilingual UX, auth, deployment.
