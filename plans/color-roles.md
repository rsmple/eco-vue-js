# Color roles migration

Living plan for moving the kit from palette classes (`bg-gray-100 dark:bg-gray-800`) to named color roles that a theme can configure end to end. Update the status table and the log as work lands; decisions go in [Decisions](#decisions) with a date.

| Phase | Status |
| --- | --- |
| 0. Spike | done |
| 1. Foundation in `tailwind-base` | done — on branch `color-roles` |
| 2. Codemod the kit | — |
| 3. Re-tune default colors | — |
| 4. Playground and presets on roles | — |
| 5. Consumers | — |

## Goals

- Every color a component paints comes from a role with a functional name, and every role can be set by a consumer theme — at build time in `@theme`, or at runtime by overriding a variable.
- A theme needs a handful of inputs; everything else is derived and can still be overridden.
- Colors that sit on a fill or in a scope adapt to it: text on a fill, borders and muted text inside an inverted area.
- Consumers' own extra colors use the same mechanism instead of a parallel set of `-dark` pairs.

Non-goals: changing how dark mode is switched (the `.dark` / `.light` classes stay), or touching non-color tokens (`w-*` sizes have their own variables already).

## Model

Three layers. Components only ever use layers 2 and 3.

### 1. Palette — the inputs

Raw colors a theme sets, as today in `@theme`: `primary`, `primary-dark`, `default`, `gray-*`, … The names stay valid as inputs; roles are built from them.

### Mode resolution

The kit sets `color-scheme: light` on `:root` and `.light`, and `color-scheme: dark` on `.dark`. A role holds both modes in one `--w-*` variable through `light-dark()`, and its value is declared on `:root, .light, .dark` — every mode boundary — not only on `:root`:

```css
/* package/tailwind-base/css/roles.css */
@theme inline {
  --color-accent: var(--w-text-accent);      /* → text-accent, bg-accent/50, … */
}

@layer base {
  :root, .light, .dark {
    --w-text-accent: light-dark(var(--color-black-default), var(--color-default));
  }
}
```

Why every boundary: Vite 8 minifies CSS with lightningcss, and with its default targets (Safari 16.4) it rewrites `light-dark(a, b)` into `var(--lightningcss-light, a) var(--lightningcss-dark, b)`, with the toggles set by its rewrite of `color-scheme`. A custom property substitutes `var()` where it is declared, so a role declared only on `:root` would freeze to the root's mode and break `.light`/`.dark` islands. Declared on each boundary, it re-resolves there — in native and lowered output alike. Every consumer is on Vite 8.

### 2. Roles — what neutral UI uses

Text (`text-accent`, `text-description`, `text-subtle`), surfaces (`bg-surface`, `-muted`, `-inset`, `bg-overlay`), control tracks (`bg-track`, `-strong`) and lines (`border-line`, `-subtle`, `outline-line-raised`). Full table with variables in [Names](#names). A focus-ring role is left for phase 2, when the focus styles get mapped.

### 3. Tones — a color with everything that sits on it

`tone-{name}` sets the current tone for an element and its children; generic classes read it:

| Sub-role | Class | Variable | Default for a derived tone |
| --- | --- | --- | --- |
| color | `text-tone`, `border-tone`, `bg-tone/10` | `--w-tone` | the tone's color |
| fill | `bg-tone-fill` | `--w-tone-fill` | the color |
| on-fill | `text-tone-on` | `--w-tone-on` | black or white by the fill's lightness: `oklch(from var(--w-tone-fill) clamp(0, (0.72 - l) * 1000, 1) 0 0)` |
| soft | `bg-tone-soft` | `--w-tone-soft` | 15% of the fill over `--w-surface` |

`tone` is the color as seen on a surface (text, icons, borders) and `tone-fill` the background, so the two can diverge in phase 3 for contrast. Today they are equal. A custom `text-tone` utility can't read a different variable than the `bg-tone` one generated from the same theme color — Tailwind merges both and the theme one wins — hence two names.

What `tone-*` accepts, resolved by `--value()`:

1. A kit tone (`primary`, `negative`, `positive`, `warning`, `info`) — explicit values from `--w-{name}`, `--w-{name}-on`, `--w-{name}-soft`, registered as `--tone-color-*`, `--tone-on-*`, `--tone-soft-*` in `@theme inline`.
2. Any theme color (`tone-scanner-sast` from `--color-scanner-sast`) or an arbitrary one (`tone-[#0f766e]`) — sub-roles derived.

An explicit value overrides the derived one because the utility writes both declarations and Tailwind drops a `--value()` declaration that doesn't resolve. A consumer tone can be made explicit the same way: `@theme inline { --tone-on-scanner-sast: …; }`.

WButton, WInfoCard and the maps in `src/utils/SemanticType.ts` become `tone-{type}` plus scopes.

### Scopes — context-aware areas

Scopes paint a background and re-map roles for their subtree:

| Class | Background | Re-maps |
| --- | --- | --- |
| `surface` | `--w-surface` | Resets every role to its default — `.surface` is a mode boundary in `roles.css` |
| `surface-muted` | `--w-surface-muted` | `--w-surface`, so soft tones inside mix over it |
| `surface-soft` | `--w-tone-soft` | nothing — re-mapping `--w-surface` would loop for derived tones, whose soft color is mixed over it |
| `surface-fill` | `--w-tone-fill` | `--w-text-accent` → on-fill, `--w-text-description` → on-fill 70%, `--w-text-subtle` → 50%, `--w-line` → 30%, `--w-line-subtle` → 15%, `--w-surface` → fill |

Inside `surface-fill`, `text-tone` matches the background; use `text-accent` / `text-description` there.

## Inventory

Measured 2026-10-01 on `src/` (docs examples excluded).

- 589 color class uses in 97 files, 134 distinct classes.
- Within a single class string: 210 complete light/dark pairs, 55 one-sided uses. The other ~120 uses are split across strings or built dynamically.
- 97 distinct light/dark combinations; the 25 used twice or more cover 176 of the 210 pairs.
- By family: gray 173, primary 141, default 108, negative 53, positive 33, info 26, warning 20, black-default 16.
- `plugins/text.ts` and `plugins/internal-classes.ts` read colors with `theme()`, which compiles to literals (`.text-description{color:oklch(70.7% …)}`) — runtime overrides never reach `text-description`, `text-accent`, `code-inline` or the autofill colors.
- `code-inline.bg-positive` builds its color by appending `4d` to a hex value; it breaks as soon as `positive` is not a 6-digit hex.
- Two "main text" colors in dark mode: `text-accent` is `default` (white), `text-black-default dark:text-gray-200` is gray-200.

### Mapping draft

Current combination → role, with the number of uses inside single class strings. The codemod is driven by this table.

| Current (light \| dark) | Uses | Role |
| --- | --- | --- |
| `bg-default` \| `bg-default-dark` | 30 | `bg-surface` |
| `text-primary` \| `text-primary-dark` | 19+3+2 | `tone-primary text-tone` |
| `border-gray-300` \| `border-gray-700` | 19 | `border-line` |
| `text-negative` \| `text-negative-dark` | 14 | `tone-negative text-tone` |
| `text-default` on a fill | 13 | `text-tone-on`, or nothing inside `surface-fill` |
| `bg-primary` \| `bg-primary-dark` | 10+2 | `tone-primary surface-fill` |
| `text-positive` \| `text-positive-dark` | 7 | `tone-positive text-tone` |
| `border-primary` \| `border-primary-dark` | 6+1 | `border-tone` |
| `bg-gray-100` \| `bg-gray-800` | 5 | `bg-surface-muted` |
| `bg-negative` \| `bg-negative-dark` | 5 | `tone-negative surface-fill` |
| `bg-gray-200` \| `bg-gray-700` | 4 | `bg-surface-inset` |
| `—` \| `outline-gray-800` | 4 | `outline-line-raised` |
| `bg-{status}/10` \| `bg-{status}-dark/10`, `bg-primary-light` \| `bg-primary-darkest` | ~14 | `bg-tone-soft` / `surface-soft` |
| `text-black-default` \| `text-gray-200` | 3 | `text-accent` (dark changes from gray-200 to white) |
| `bg-gray-300` \| `bg-gray-700`, `bg-gray-300` \| `bg-gray-600` | 4 | `bg-track` |
| `bg-gray-400` \| `bg-gray-500` | 2 | `bg-track-strong` |
| `text-gray-400` \| `text-gray-600` | 2 | `text-subtle` |
| `border-gray-200` \| `border-gray-700` | 2 | `border-line-subtle` |
| `bg-gray-200` \| `bg-gray-800` | 2 | `bg-surface-muted` (SemanticType secondary) |
| `bg-default/40` \| `bg-default-dark/60` | 1 | `bg-overlay` |
| one-sided `text-gray-400` in WPage | 5 | stays: print layout, light only |
| gradients (`from`/`via`/`to`) | ~15 | manual |

Unresolved rows get added here as the codemod surfaces them.

## Spike results (phase 0)

Done 2026-10-01 with Tailwind 4.3.3 through `@tailwindcss/node` `compile` + `optimize` (the same path `@tailwindcss/vite` takes in a build), then read back with `getComputedStyle` in Chromium 149 and Firefox 151.

- The optimizer leaves `light-dark()`, `color-scheme` and `oklch(from …)` untouched — no `--lightningcss-light` rewriting, even with its Safari 16.4 target.
- `light-dark()` inside a theme variable resolves at the element that uses it: `.dark` gives the dark value, `.light` inside `.dark` the light one, and a tone set outside `.dark` and used inside it gets the dark value.
- Opacity modifiers work on `light-dark()` variables (`bg-surface/50` → `color-mix(in oklab, var(--color-surface) 50%, transparent)`).
- `tone-*` as `@utility` with `--value(--color-*)` works, and so does `@theme inline { --color-tone: var(--tone) }` for the generic classes.
- Derived values (`--tone-on`, `--tone-soft`) must be declared in the same rule as `--tone` (the `tone-*` utility), not on `:root`, since a custom property substitutes `var()` where it is declared.
- Runtime override of `--color-negative` on `:root` reaches the fill, the derived on-color (flipped to black on a light fill) and the soft color. This is what the docs playground needs.
- Browser floor this sets: `light-dark()` Chrome 123, Firefox 120, Safari 17.5; relative colors Chrome 119, Firefox 128, Safari 18.
- WebKit 26.6: same results as Chromium and Firefox.
- The spike ran Tailwind's own optimizer only. The real docs build (Vite 8 + lightningcss minify) **does** lower `light-dark()` — see [Mode resolution](#mode-resolution). Relative colors (`oklch(from …)`) and `color-mix` are left alone at those targets.
- Tailwind keeps a theme variable when it is referenced only from another theme variable or from plain CSS (`var(--color-gray-200)` in a base rule), so roles can reference palette steps no utility uses.

## Contrast today

WCAG ratios of current defaults, as inputs for phase 3. 4.5 is the bar for text, 3 for large text and UI parts.

| Pair | Ratio |
| --- | --- |
| white on `positive` `#77d460` | 1.85 |
| white on `info` `#82adff` | 2.24 |
| white on `positive-dark` `#5bb245` | 2.66 |
| white on `primary` `#9087e2` | 3.11 |
| white on `negative` `#f35555` | 3.36 |
| `primary-dark` text on dark surface | 2.83 |
| `primary` text on white | 3.11 |
| `text-description` on white (gray-400) | 2.60 |
| `text-description` on dark surface (gray-500) | 3.66 |
| `border` on white (gray-300) | 1.47 |

Two conclusions:

- Derived on-colors can't reproduce today's look, because today's white-on-green and white-on-blue are unreadable. Phase 1 keeps on-colors explicit (white, as now); phase 3 switches to derived ones together with the recolor.
- Dark-mode text in a tone needs a lighter shade than the dark-mode fill. The `-dark` suffix conflates "for dark mode" with "a darker shade" — `text-primary-dark` is darker text on a dark background. Hence the separate `text` sub-role.

## How many values

- **Minimum inputs, about 12:** primary per mode, the neutral tint (or explicit gray steps), page background per mode, and the four status colors (one or two each).
- **Overridable roles, about 30:** the roles above plus tone sub-roles, each defaulting to a derived value.
- A theme link written by hand or by an LLM would set 5–12 keys.

## Consumers

Measured 2026-10-01.

| Repo | Palette overrides | Extra colors |
| --- | --- | --- |
| appsec-portal-app | — | `json-*`, `gwrt`/`pwrt` gradients, `scanner-*`, `graph`, `wrt-*`; 42 arbitrary hex classes |
| auditor | — | — |
| aspm (both fronts) | full: primary, status, `default`, `black-*`, `gray-50`…`gray-1000` | `json-*`, gradients |
| traio (both fronts) | full, `primary-dark: #ffffff`, partial gray scale (300–1000) | `json-*`, gradients, `scanner-*`, `score-*` |
| whitespots-io | partial | `scanner-*`, gradients, `site-blue-*`, `primary-lightest`, `primary-to`; 147 arbitrary hex classes |

Notes:

- traio's `primary-dark: #ffffff` with the kit's `bg-primary dark:bg-primary-dark text-default` and `default: #ffffff` is white on white in dark mode, unless patched locally. Derived on-colors fix this class of bug.
- traio leaves `gray-50`…`gray-200` at the kit's bluish defaults under a warm neutral scale.

Plan for extra colors, by kind:

- **Categorical** (`scanner-*`, `json-*`, `score-*`, `severity-*`): the kit ships a data palette of 8–10 named hues, each a tone. Consumers alias domain names to it (`--color-scanner-sast: var(--color-data-cyan)`), so a preset recolors charts and badges too. `severity-*` and `score-*` move out of the kit, or stay as deprecated aliases for a release.
- **Gradients** (`gwrt`, `pwrt`): three repos define the same idea; the kit gets a `gradient-from/via/to` role trio.
- **App-specific** (`site-blue-*`, raw hex): stay in the app, written as `light-dark()` variables. An optional rule in the shipped eslint config can flag raw palette and hex classes in new code.

## Phases

### 1. Foundation in `tailwind-base`

- [x] Re-run the spike in WebKit.
- [x] `color-scheme` on `:root`, `.light`, `.dark` (`css/roles.css`). Docs already had it from VitePress, so the docs diff can't show its side effects; check native scrollbars, form controls and the page canvas in a consumer app before release.
- [x] `text-accent` and `text-description` are theme colors reading `--w-text-accent` / `--w-text-description` instead of literals from the JS plugin — runtime overrides reach them, and opacity modifiers (`text-description/50`) now work.
- [x] Autofill and resizer colors in `internal-classes.ts`, and `code-inline` tints in `text.ts`, read variables through `light-dark()`; the hex-append trick is gone. Remaining `DARK_SELECTOR`: the striped progress overlay.
- [x] Color diff harness (below). Result for the above: 0 changes over 31 pages × 2 modes; islands checked in all three engines against the lowered production CSS.
- [x] Settle naming ([names](#names)).
- [x] Remaining roles, `tone-*` and `surface-*` in `css/roles.css`, defaulting to today's palette. Nothing in `src/` uses them yet.
- [x] On-colors explicit for kit tones, matching today (white; `black-default` / `default-dark` on warning).
- [x] Role equivalence test (below): passes.
- [x] Consumer check in auditor (below).

#### Consumer check

auditor (`front`, Vite 8) built against a local pack of `main` and of `color-roles`, then dependencies restored.

- **Compiled CSS:** the role variables, `color-scheme` rules and the variable-based `text-accent` / `text-description` / plugin colors, lowered by lightningcss as expected. Nothing else changed.
- **Cascade:** the old JS-plugin `text-accent` / `text-description` had a dark rule with higher specificity (`.dark .text-accent:not(:is(.light *))`), so in dark mode they beat any plain `text-*` on the same element; now they are single-class utilities. Scanned the kit and all consumers for `text-accent` / `text-description` combined with another plain text color: one hit, appsec `TaskTrackerConnectionForm.vue` (`text-description … text-primary dark:text-primary-dark`), which resolves the same in both modes. `@apply text-accent` in the shared `markdown.css` is unaffected — the `mark-*` / `hint-*` rules carry their own `dark:` variants.
- **Rendered app** (login page; no backend): computed colors of every element identical in light and dark; only `color-scheme` differs (`normal` → `light` / `dark`).
- **Native controls** in dark mode (full Chromium, app CSS): the date input icon, checkbox and range slider switch to the browser's dark rendering — before, the calendar icon was black on the dark background. Native popups (select, date picker) and classic scrollbars follow the mode too. Kit components are unaffected. This is the only visible change of phase 1, and it goes in the release notes.

#### Role equivalence test

`roles-test.mjs` compiles `theme.css` + `roles.css` + `default.css` with Tailwind, also lowers the output with lightningcss at Vite 8's default targets, and renders each new class next to the old pair it replaces — e.g. `tone-negative surface-soft` next to `bg-negative/10 dark:bg-negative-dark/10` — asserting equal computed colors. 27 pairs, plus checks for text inside `surface-fill`, the `surface` reset, derived on-colors (white on teal, black on yellow), a derived `surface-soft` that doesn't loop, and a `.light` island. Run in Chromium, Firefox and WebKit × native and lowered CSS × light and dark: all pass.

#### Color diff harness

Compares computed colors (`color`, backgrounds, borders, outline, shadow, fill, stroke, …) of every element on every docs page, in light and dark, between two builds. Unlike a pixel diff it names the element and the property that changed, and it is deterministic (two runs of the same build: 0 differences).

1. `npx vitepress build docs --outDir <dir>` for the baseline and for the change.
2. `node dump.mjs <dir> <out.json>` for each — serves the build under `/eco-vue-js/`, visits every page with Playwright.
3. `node diff.mjs base.json new.json` — changes grouped by `property: before → after`, with example elements.

The scripts (this and the role equivalence test) live in the session scratchpad for now; move them to `build/color-roles/` once phase 2 starts relying on them.

### 2. Codemod the kit

- [ ] Script applying the mapping table to complete pairs within one class string (about 70% of uses).
- [ ] Review the one-sided and split uses by hand (about 20%) — most missing dark variants are bugs, fixed here.
- [ ] Gradients and `SemanticType.ts` maps by hand (about 10%); the maps become tones.
- [ ] Screenshot diff: zero except listed fixes.
- Phases 1–2 ship as one minor. Nothing breaks for consumers: palette names still work as inputs.

### 3. Re-tune defaults

Separate minor, deliberate visual change.

- [ ] One neutral tint across `gray-*` and `default-dark` (zinc vs bluish gray today).
- [ ] Tone colors and text shades chosen for contrast, not taken from the Tailwind palette.
- [ ] Derived on-colors on by default.
- [ ] Contrast check in tests for every tone and surface pair.

### 4. Playground and presets

- [ ] Docs playground edits palette inputs, with roles in an advanced section.
- [ ] Presets set a neutral scale and tones, not just primary.
- [ ] Theme link schema and the theming page updated.

### 5. Consumers

- [ ] Ship the codemod as a script consumers can run on their own `dark:` pairs.
- [ ] Move `json-*`, `scanner-*`, `score-*` to data palette aliases; gradients to the kit trio.
- [ ] aspm and traio: drop palette overrides that equal the new defaults.

## Names

Agreed 2026-10-01. Keep the names consumers already use — `text-accent` (about 320 uses across consumers) and `text-description` (about 760) — and add the rest in the same style. Every role is a `--w-*` variable, like the kit's size variables, and a utility in the usual Tailwind namespaces.

| Class | Variable | Role |
| --- | --- | --- |
| `text-accent` | `--w-text-accent` | Main text |
| `text-description` | `--w-text-description` | Muted text |
| `text-subtle` | `--w-text-subtle` | Placeholders, disabled text, chart axes |
| `bg-surface` | `--w-surface` | Page, cards, dropdowns |
| `bg-surface-muted` | `--w-surface-muted` | Secondary fills |
| `bg-surface-inset` | `--w-surface-inset` | Fills inside controls |
| `bg-track`, `bg-track-strong` | `--w-track`, `--w-track-strong` | Inactive parts of controls |
| `bg-overlay` | `--w-overlay` | Backdrops |
| `border-line`, `border-line-subtle` | `--w-line`, `--w-line-subtle` | Borders, dividers |
| `outline-line-raised` | `--w-line-raised` | Outline of floating surfaces |

Tones and scopes — see [Tones](#3-tones--a-color-with-everything-that-sits-on-it) and [Scopes](#scopes--context-aware-areas):

```html
<!-- filled button: plain text and descriptions inside become readable on the fill -->
<button class="tone-negative surface-fill">
  Delete <span class="text-description">3 items</span>
</button>

<!-- soft card: normal text, tinted background and icon -->
<div class="tone-info surface-soft">
  <IconInfo class="text-tone" />
  <p class="text-accent">Title</p>
  <p class="text-description">Body</p>
</div>

<!-- tone text on the page -->
<p class="tone-negative text-tone">Required</p>
```

Without a scope, every role has its default — today's colors.

## Decisions

- 2026-10-01 — Mode switching for colors through `light-dark()` and `color-scheme`, not `dark:` pairs. Spike showed it survives the Tailwind build and resolves per element.
- 2026-10-01 — Phase 1 reproduces today's colors exactly; every visual change waits for phase 3.
- 2026-10-01 — Role values are `--w-*` variables declared on `:root, .light, .dark`; utilities read them through `@theme inline`. Keeps islands right under lightningcss lowering.
- 2026-10-01 — `text-accent` and `text-description` keep their names; the [names](#names) table is agreed.
- 2026-10-01 — `text-tone` is the tone's color on a surface and `bg-tone-fill` the fill, instead of `bg-tone` + `text-tone-text`: Tailwind can't give `text-tone` and `bg-tone` different variables.

## Open questions

- Nesting semantics differ slightly: the `dark:` variant is `.dark &:not(:is(.light *))`, so `.dark > .light > .dark` content counts as light, while `color-scheme` takes the nearest class (dark). `color-scheme` is arguably right; check no consumer relies on the old behaviour.
- Main text in dark mode: `text-accent` (white) is the standard; the `dark:text-gray-200` / `dark:text-gray-100` spots are inconsistencies and move to `text-accent` in phase 2, listed in its diff.

## Log

- 2026-10-01 — Plan written; spike done in Chromium and Firefox; inventory of the kit and five consumer repos.
- 2026-10-01 — Spike done in WebKit. Found lightningcss lowering of `light-dark()` in the docs build; roles moved to `css/roles.css` declared per mode boundary. `text-accent`, `text-description`, autofill, resizer and `code-inline` colors read variables. Color diff: 0 changes. `plans/` excluded from the docs build.
- 2026-10-01 — Names agreed. All roles, kit tones, `tone-*` and `surface-*` added to `css/roles.css` with today's values; role equivalence test passes in three engines; docs color diff 0.
- 2026-10-01 — Consumer check in auditor: CSS and rendered colors unchanged apart from `color-scheme`; native controls now follow dark mode. Phase 1 done.
