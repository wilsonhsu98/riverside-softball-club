# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Vue 2 SPA for managing a softball club: rosters, game records, at-bat (打席) scoring, defensive positions/lineups, and stats. Firestore is the primary datastore, accessed directly from the client via the Firebase JS SDK — there is no REST layer in front of Firestore. A small serverless backend (`functions/`) only handles things the client can't do itself: OAuth (LINE/Facebook), Imgur uploads, anonymous-account cleanup, and a legacy game-data import script.

## Commands

```bash
npm run start:client   # vue-cli-service serve on port 9527 (client dev server)
npm run start:server    # netlify-lambda serve of functions/ (backend dev server)
npm run build           # build:client + build:server, then npm install in dist/server
npm run build:client    # vue-cli-service build -> dist/client
npm run build:server    # netlify-lambda build functions -> dist/server
npm run lint            # vue-cli-service lint (eslint + vue/essential, prettier via @vue/prettier)
npm run format          # prettier --write over src/**, functions/**, public/**
```

There is no test suite/script configured (`npm run test` referenced in README's boilerplate does not exist in `package.json`) — do not assume Jest/Mocha are set up.

To exercise the full app locally, run both dev servers (`start:client` and `start:server`) side by side; the client proxies backend calls to `/.netlify/functions/index/...`.

### Deploying (see [note](note))

- The `functions/` Cloud Function code is deployed independently of the Netlify build, using Firebase CLI (`cd functions && yarn deploy`), and requires switching to Node 10 and copying the root `.env` into `functions/` first.
- The client + `dist/server` bundle deploys via Netlify (`netlify.toml`) or, alternatively, plain static hosting via Firebase Hosting (`firebase.json`, serving `dist`).

## Architecture

### Two backends, one Firestore

- **Client (`src/`)**: Vue 2 + Vuex + Vue Router SPA. Talks to Firestore/Firebase Auth/Messaging directly through [src/firebase.js](src/firebase.js). Most reads are live `onSnapshot` listeners tracked in the `snapShot`/`snapShotRequest` maps in [src/store/root.js](src/store/root.js), which get torn down and reconnected on `visibilitychange` (tab hidden/visible) to avoid leaking Firestore listeners.
- **Functions (`functions/index.js`)**: a single file exporting `import_game` (legacy Google-Sheets-based game importer, standalone `onRequest`) and `api`/`handler` (an Express app mounted at `/.netlify/functions/index`, also exported for `serverless-http`). Routes: LINE OAuth redirect/callback, `/delete_anonymous_users`, `/fb_deletion_callback` (Facebook data-deletion callback), `/upload_to_imgur`. This same Express app is built two ways — as a Firebase Function (`firebase deploy`) and as a Netlify Function (via [webpack.server.js](webpack.server.js), which repackages it with `externals: ['firebase-admin']` since that dependency isn't bundled for Netlify's lambda runtime).
- Both the client (`config.js`) and functions (`functions/config.js`) read the *same* `.env` variable names (`VUE_APP_FIREBASE_*`, `VUE_APP_LINE_*`, `VUE_APP_IMGUR_*`) but the functions side additionally needs the `VUE_APP_FIREBASE_SA_*` service-account credentials for `firebase-admin`.

### Auth model

Auth logic lives in [src/store/root.js](src/store/root.js) (root store, not a module). Supported sign-in methods: Google/Facebook/GitHub via Firebase popup providers, LINE via a custom-token redirect flow through the Functions backend, and anonymous sign-in. Every successful login upserts a doc at `accounts/{uid}` merging provider profile data with any existing custom fields (name/photo overrides). `config.js`'s `managers` array is a hardcoded allowlist of Firebase UIDs gating the `/management` route — there's no role-based backend check.

### Route structure and team scoping ([src/router.js](src/router.js))

- `/main/*` — authenticated management UI (create/edit games, defense, batting order, positions, roster, team CRUD). Route `meta.anonymous: false` blocks anonymous users from mutating routes.
- `/view/*` (`v_*` route names) — read-only "spectator" mode. Entered via `/session/:team`, which stamps `sessionStorage.currentTeam` and redirects; the global `beforeEach` guard then blocks navigation to any `v_*` route if `sessionStorage.currentTeam` doesn't match, and blocks switching a `:team` param mid-session against `store.getters.currentTeam`.
- `/login`, `/parse` (Google-Sheets game import UI), `/management`, `/deletion` (Facebook-style account/data deletion page) are the non-team-scoped entry points.
- The guard also persists scroll position across `games <-> game` transitions and remembers the last-focused game in `localStorage` (`focus_game`).

### Vuex layout ([src/store/index.js](src/store/index.js))

Root store (auth, alerts/confirm dialogs, loading state, update-available banner) plus modules: `game`, `record` (at-bat/play-by-play scoring — the largest module), `team` (roster/lineup/team settings), `user` (per-user profile/team membership), `import` (Google-Sheets game import). Modules that need cross-module state (e.g. root importing `userState`/`userActions` from `./modules/user`) do so via direct imports rather than Vuex's namespacing, so check for those cross-imports before assuming a module is self-contained.

### Client-side heavy computation

[src/web-worker.js](src/web-worker.js) wraps a single shared Web Worker (`public/async-web-worker.js`, cache-busted by `version_hash`) behind a FIFO queue (`callWorkerQueued`) so calls run strictly one-at-a-time rather than concurrently; a worker error clears all pending callbacks and forces worker recreation on next use. This is used for expensive stat/record computations off the main thread — check `record.js`/`game.js` for call sites before changing the worker protocol (`{id, ...payload}` in, `{id, result, error}` out).

### i18n and localization

Locale strings live in `src/i18n/{en-us,zh-tw}.json`, loaded via `vue-i18n` ([src/i18n.js](src/i18n.js)). Default locale is `zh-TW`; most existing UI copy is Traditional Chinese, so match that when adding new user-facing strings unless told otherwise.

### Auto-registered components

[src/main.js](src/main.js) globally registers every `.vue` file directly under `src/components/` (via `require.context`, PascalCase-derived from filename) plus every entry in [src/components/icon.js](src/components/icon.js) as inline-template icon components — new top-level components in that folder don't need manual registration, but nested folders under `components/` are not picked up (`, false` in the context call).
