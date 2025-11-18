## HIS Frontend

Modern React + Vite frontend for the Hospital Information System (HIS). It ships a runtime, backend‑driven theme system layered on top of Tailwind CSS utilities so that colors, typography, spacing, and layout can be personalised per tenant without redeploying the app.

---

### Tech Stack
- React 19 + Vite 7
- TypeScript support for shared utilities (theme, config)
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Zustand for lightweight state, React Hook Form + Yup for forms, Axios for API access

---

### Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run locally**
   ```bash
   npm run dev
   ```
   Vite starts on `http://localhost:5173` by default.
3. **Production build**
   ```bash
   npm run build
   npm run preview   # optional: serve the production bundle locally
   ```
4. **Lint & format**
   ```bash
   npm run lint
   npm run format
   ```

---

### Project Structure
```
src/
  api/            # Axios helpers, backend clients (auth, theme, master data…)
  components/     # Atomic + composite UI elements
  config/         # Form and master data configuration objects
  constants/      # Shared constants, theme defaults
  context/        # React context providers (ThemeContext, etc.)
  hooks/          # Reusable React hooks
  screens/        # Page-level views (login, dashboard, masters…)
  store/          # Zustand stores
  utils/          # Generic utilities and helpers
  validation/     # Yup schema builders
App.jsx           # App shell, wraps routes with providers
main.jsx          # Vite bootstrap entry
index.css         # Tailwind layer + CSS variable seeds
```

---

### Backend-Driven Theme System
**Goal:** allow the backend to control the design system (colors, fonts, spacing, layout primitives) without shipping a new frontend build.

#### How it works
1. `ThemeProvider` (`src/context/ThemeContext.tsx`) renders at the root of `App.jsx`.
2. On startup it:
   - Applies the baked-in `defaultTheme` values to CSS custom properties, so the UI renders instantly.
   - Fetches overrides from `/api/theme` via `fetchThemeConfig`.
   - Deep-merges the override with `defaultTheme` (`mergeTheme`) and reapplies CSS variables at runtime.
   - Falls back to defaults (with a console warning) if the API errors or times out. Users are never blocked because the default palette already rendered.
3. All components can call `useTheme()` for tokens in JavaScript or read the CSS variables directly in class names, inline styles, or CSS modules.

#### API Contract
`GET /api/theme` should return any subset of the theme object. Missing keys fall back to defaults.
```json
{
  "meta": { "version": 3 },
  "colors": {
    "primary": "#0f4c81",
    "surface": "#fefcf6"
  },
  "fonts": {
    "heading": "'IBM Plex Sans', sans-serif"
  },
  "spacing": {
    "lg": "1.75rem"
  },
  "layout": {
    "maxWidth": "1400px"
  }
}
```

#### Consuming the theme
```jsx
import { useTheme } from "../context/ThemeContext";

export const DashboardHero = () => {
  const { theme } = useTheme();

  return (
    <section
      className="rounded-xl shadow-sm"
      style={{
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        padding: "var(--spacing-xl)",
      }}
    >
      <h1
        className="text-3xl font-semibold mb-3"
        style={{
          fontFamily: theme.fonts.heading,
          color: theme.colors.primary,
        }}
      >
        Welcome back
      </h1>
      <button
        className="px-5 py-2 font-medium"
        style={{
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryContrast,
          borderRadius: "var(--layout-borderRadius)",
        }}
      >
        Primary action
      </button>
    </section>
  );
};
```

Every Tailwind utility remains available. Use CSS variables inside any property that Tailwind doesn’t cover or when you need dynamic tokens (e.g., `style={{ padding: "var(--spacing-lg)" }}`).

#### Tailwind + CSS Variables
`src/index.css` seeds all theme tokens on `:root`. You can reference them in custom CSS or combine them with Tailwind’s arbitrary values:
```html
<div class="border rounded-lg" style="border-color: var(--color-border)">
  ...
</div>

<!-- Tailwind arbitrary value -->
<div class="bg-[var(--color-surface)] text-[var(--color-text)]">
  ...
</div>
```

---

### Environment & Configuration
- **API base URL:** centralise in `src/api/axiosInstance.js`.
- **Theme endpoint:** `src/api/theme.ts` fetches `/api/theme`. Point this route to any backend or edge config service.
- **Tailwind:** configuration lives in `tailwind.config.js`. The project currently relies on Tailwind’s new standalone plugin for Vite (`@tailwindcss/vite`).

---

### Conventions & Tooling
- Component + hook files use PascalCase / camelCase naming.
- Shared TypeScript types live alongside their features (e.g., `themeDefaults.ts`, `formConfig.ts`).
- Pre-commit linting/formatting via `lint-staged` + `husky`.

---

### Troubleshooting
- **Theme request fails:** users still see the default palette. Check browser console for `Falling back to default theme`.
- **Tailwind utilities missing:** ensure `@tailwindcss/vite` plugin is registered (see `vite.config.js`) and restart the dev server after config changes.
- **New theme tokens:** add defaults in `src/constants/themeDefaults.ts`, then update `mergeTheme` + `applyThemeToDocument` with the new section so overrides flow through automatically.

---

### Useful Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | ESLint across JS/TS/JSX/TSX |
| `npm run format` | Prettier for source, config, markdown |

---

Happy building! Feel free to extend the theme schema, plug in multi-tenant routing, or add Storybook-style sandboxes for visual regression testing. If you do, document the backend contract changes here so integrators stay in sync.***

