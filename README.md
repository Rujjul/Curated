# Curated

**Live demo:** [curated-match-ai.base44.app](https://curated-match-ai.base44.app/)

Curated is an AI-powered dating compatibility app. It creates dating profiles from a person's public LinkedIn and Instagram sources, then lets you simulate a first date between two profiles and review their compatibility verdict, including shared interests, values, lifestyle, and potential friction.

## Explore the repository

- `src/pages/` — application screens, including the home, login, registration, and date arena pages.
- `src/components/` — shared UI and date-flow components.
- `src/api/base44Client.js` — the Base44 SDK client used by the frontend.
- `src/lib/` — shared app configuration, authentication, and routing helpers.
- `base44/entities/` — data schemas for profiles, dates, and users.
- `base44/functions/` — backend functions for profile analysis, chat, and date simulation and judging.
- `base44/config.jsonc` — Base44 site commands and build configuration.
- `vite.config.js` — Vite and Base44 plugin setup.

## Edit and run locally

### Prerequisites

- Node.js and npm
- [Deno](https://docs.deno.com/runtime/getting_started/installation/) (required by the local Base44 backend)
- A Base44 account with access to this app

### Setup

From the repository root, install dependencies and authenticate with Base44:

```bash
npm install
npm install -g base44@latest
base44 login
```

Link this clone to the deployed app. The app ID is `6ac20e22f28cc9a188274983`:

```bash
base44 link --app-id 6ac20e22f28cc9a188274983
```

The link is stored in the ignored local file `base44/.app.jsonc`; each fresh clone needs its own link. Start the local backend and frontend together:

```bash
base44 dev
```

Open the frontend URL printed by the command (usually <http://localhost:5173>). Keep the terminal running while you use the app. Do not start `npm run dev` alongside `base44 dev`; that starts a separate frontend without the local backend proxy.

In this mode, Base44 entities, functions, and authentication run locally. Entity data is in memory and is cleared when the local backend restarts. Core integrations and OAuth login are forwarded to the deployed app. The app must have been published at least once for its frontend settings to load in local development.

To work on the frontend against the hosted backend instead, run:

```bash
base44 dev --remote
```

In remote mode, writes use the deployed app's production data.

## Build and checks

```bash
npm run build
npm run lint
npm run typecheck
```

## Publish changes

After pushing changes to the repository, open the Base44 dashboard to review and publish the app:

```bash
base44 dashboard open
```

This repository syncs with Base44 through Git. Publish from the dashboard so the deployed app stays in sync with the repository.

## Documentation

- [Base44 CLI reference](https://docs.base44.com/developers/references/cli/commands/introduction)
- [Base44 local development](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview)
- [Base44 GitHub integration](https://docs.base44.com/developers/app-code/local-development/github)
- [Base44 support](https://app.base44.com/support)
