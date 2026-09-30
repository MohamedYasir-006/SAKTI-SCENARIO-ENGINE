# IP-SAKTI Scenario Engine

Evidence-Grounded Innovation Intelligence for Ayurveda.

**SIH Problem Statement:** SIH26045

> Phase 1 establishes architecture only. Product intelligence and data
> integrations will be implemented in subsequent phases.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn-style UI (`components/ui`) + Lucide React
- Zod validation, ESLint 9, Prettier, pnpm

## Folder structure

```text
app/            # routes: (dashboard) pages + api stubs + layout
components/     # ui, layout, innovation, analysis, evidence, scenario,
                # red-team, research, jurisdiction, reports, common
lib/            # ai, retrieval, evidence, innovation, scenario, analysis,
                # redteam, jurisdiction, reports, demo, validation, utils
types/          # canonical domain entities
data/           # evidence corpora, demo/ashwabrahm, jurisdictions
tests/          # Phase 2 test suites (per-domain placeholders)
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
pnpm dev          # start dev server
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm build        # production build
pnpm start        # serve production build
```

## Environment variables

See `.env.example`: `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`. Never commit secrets.

## Testing

`pnpm test` — no runner yet (Phase 1 scaffolding; suites land in Phase 2
under `tests/{innovation,scenario,evidence,redteam,analysis}`).

## Future implementation phases

- **Phase 2:** innovation modelling, retrieval, analyzers, scenario engine,
  red-team, reports, demo content.
- **Phase 3+:** RAG/vector search, external patent + TK + regulatory
  integrations, multilingual UX, auth, deployment.
