# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Vite dev server (port 5173), proxies /snowstorm and /HISWEBAPI (see vite.config.ts)
npm run dev:force      # Same, with --force (bust Vite's dep cache)
npm run build           # Production build (vite build) -> dist/
npm run preview         # Preview the production build
npm run lint             # eslint . --ext .js,.jsx,.ts,.tsx
npm run format           # prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"
npm run test             # vitest (watch mode)
npm run test:ui         # vitest --ui
npm run coverage         # vitest run --coverage
```

Run a single test file: `npx vitest run path/to/file.test.tsx`. Test environment is jsdom with `@testing-library/jest-dom` matchers loaded via `src/test/setup.ts` (configured in `vite.config.ts`, not a separate vitest config file). Test coverage in this repo is minimal — most screens have no tests.

**Type-checking**: there is no `tsconfig.json` at the repo root — TypeScript compiler options live in `jsconfig.json` instead. `tsc -p .` will fail with `TS5057`. To actually type-check, point at the file explicitly:
```bash
npx tsc --noEmit -p jsconfig.json
```
Vite/esbuild transpiles `.tsx` without type-checking during `dev`/`build`, so this is the only way to catch type errors outside the editor.

`husky` + `lint-staged` run `eslint --fix` and `prettier --write` on staged `src/**/*.{js,jsx,ts,tsx}` on commit.

## Architecture

**Stack**: React 19 + TypeScript (mixed with plain `.js`/`.jsx` in places) + Vite, Tailwind CSS v4 (via `@tailwindcss/vite`), React Router v7, TanStack Query v5 for server state, Axios for HTTP.

**Path alias**: `@/*` → `src/*` (defined in both `vite.config.ts` and `jsconfig.json` — keep both in sync if it ever changes).

### Provider stack (`src/main.tsx`)
`QueryClientProvider` → Redux `Provider` → `AuthProvider` → `BillingAmountProvider` → `RoleProvider` → `PatientProvider` → `App`. `App.tsx` itself is just `<Navbar />` + a global `react-toastify` `<ToastContainer>`.

### Dual state management — know which one to reach for
- **Redux Toolkit** (`src/store/store.ts`): only two slices, `accessRights` and `assignBranchRight`. State is manually persisted to `localStorage` under the key `redux-store` via `store.subscribe`. Use for cross-cutting auth/permission state.
- **Zustand** (`src/store/use*.ts`, e.g. `useAuthorizedPages.ts`, `useFavouriteRole.ts`, `useAssignBranchRight.ts`): each is its own store, typically wrapped in `persist()` middleware. Use this pattern for new global client state — it's the more actively-used approach for anything new.
- Plain `AuthContext` (`src/context/AuthContext.tsx`) holds `token`/`user`/`isInitialized`, backed by `localStorage`/`sessionStorage` depending on "remember me"; there are sibling contexts (`BillingAmountContext`, `RoleContext`, `PatientContext`) for other cross-cutting concerns.

### Routing and per-role access control (`src/screens/routes/index.tsx` + `src/screens/navbar/`)
Routes are **not** statically declared with `<Route path="/x">` per page. Instead:
1. `authorizedRouteMap` (`screens/routes/index.tsx`) is a static `Record<string, ReactNode>` mapping a normalized route key (e.g. `"diagnosis-master"`) to its page component. **New screens must both have their component imported here and their route key added to this map** — a route with no map entry logs `No component mapped for: ...` and renders nothing.
2. At runtime, `useAuthorizedPages` (Zustand store) fetches the logged-in user's permitted tabs/pages from the backend (`GET_USER_TAB_SUB_MENU_MAPPING`) and `Navbar` (`screens/navbar/index.tsx`) generates one `<Route>` per authorized page by looking up `authorizedRouteMap[normalizeRouteKey(page.url)]`.
3. `hasAccess(pageKey, accessRights)` (`screens/navbar/components/accessControl.ts`) applies an additional, hardcoded fine-grained rule per route key (most routes have no rule and are allowed by default) on top of whether the page is in the authorized list.

### API layer
- `src/api/axiosInstance.ts`: single Axios instance, attaches `Authorization: Bearer <token>` from storage, force-sets/clears `Content-Type` based on whether the body is `FormData`, and on a `401` response clears all auth storage and hard-redirects to `/GWSNHIS`.
- `src/hooks/useGlobalApi.ts`: the standard way screens call the API — `fetchApi(method, url, payload, axiosConfig, meta)`. It returns `{ loading, error, fetchApi }`. Business-level failures come back as `{ result: false, message }` with HTTP 200 (not just HTTP error codes) — `fetchApi` normalizes both into the same `ApiError` shape. Pass `meta.silent` to suppress the internal `error` state update, `meta.throwOnError` to throw instead of returning a `result:false` payload.
- `src/config/defaults/index.ts` (`ENDPOINTS`): every backend path lives here as `SCREAMING_SNAKE_CASE: "Controller/methodName"`, grouped by feature with a `// comment` header. Add new endpoints here rather than inlining URL strings; naming for CRUD-style masters follows `GET_<X>_LIST` / `CREATE_UPDATE_<X>` / `DELETE_<X>`.
- `src/hooks/usePickMaster.ts`: generic lookup-list hook — `usePickMaster("SomeFieldName")` hits a single shared `GET_PICKLIST_MASTER?fieldName=...` endpoint and is reused across many screens for simple dropdown option lists (allergy types, genders, titles, etc.) instead of one bespoke endpoint per dropdown.
- `usePickMaster` and `useConfigMaster` (below) intentionally swallow fetch failures silently (`meta.silent`) since they back non-critical UI (dropdowns/config), not primary page data.

### Two generations of "master" (CRUD list) screens — pick the right one to mirror
This codebase has two distinct patterns for admin/master-data screens; match whichever pattern the screen you're touching already uses rather than mixing them:
1. **Config-driven grid/list** (older, more elaborate — e.g. `doctorMaster`, and other screens with a matching `src/config/masterConfig/*Config.ts`): a declarative config object describes API-key → label mappings for grid cards and list-table columns (`gridCardView`, `listCardView`). `useConfigMaster("xMasterConfig")` loads the config, `transformDataWithConfig(config, apiResponse)` reshapes the raw API rows into `{ gridView, listView }`, and shared components `components/profileCard` (`GridView`) / `components/profileCard/components/ListView` render them generically. Comes with shared chrome: `PageHeader`, `HideShowColumn` (column visibility popup), `DownloadPopup` (PDF/Excel export via `exportUtils`), search/filter via `utils/filteredData`.
2. **Plain custom screen** (newer, simpler — e.g. `diagnosisMaster`, `procedureMaster`, everything under `doctorConsultationNew`): a self-contained component using `useGlobalApi` + `useQuery`/manual `fetchApi` directly, `InputField` (`components/customInputField`) for form fields, and the shared CSS utility classes below for the table. No generic config/transform layer.

### Shared CSS utility classes (`src/styles/theme.css`, `layout.css`)
Rather than a component library, most screens compose hand-rolled Tailwind `@apply` classes: `.card`, `.page-container` / `.page-heading` / `.helper-text` (breadcrumb), `.input-field`, `.save-btn` / `.cancel-button` / `.disabled-btn`, `.table-scroll-wrapper` / `.table-size` / `.base-table` / `.table-head` (note: already `z-20`, sticky — dropdowns overlaying a table below them need `z-50`+) / `.table-th` / `.table-td` / `.table-row` / `.table-action` / `.table-empty`, `.card-status` (`.active`/`.inactive` only — for more states, compose bespoke Tailwind badge classes instead of extending this one). Prefer reusing these over inventing new ad-hoc classes for standard form/table pages.

### SNOMED CT search
Several clinical screens (allergy, diagnosis, procedure entry) implement live-search-as-you-type against a local SNOMED terminology server directly at `http://localhost:8080/csnoserv/api/search/search` (not through the `/snowstorm` Vite proxy target defined in `vite.config.ts`, which points at `snowstorm.ihtsdotools.org` — the two are not currently wired together). The pattern: debounce the query, filter by `semantictag` (`disorder` for diagnoses, `procedure` for procedures, `finding` for allergies), and store both the free-text term and the resolved SNOMED `conceptId` alongside it, with the code field always optional/editable independently of the text search.
