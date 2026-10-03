# Color roles migration

Living plan for moving the kit from palette classes (`bg-gray-100 dark:bg-gray-800`) to named color roles that a theme can configure end to end. Update the status table and the log as work lands; decisions go in [Decisions](#decisions) with a date.

| Phase | Status |
| --- | --- |
| 0. Spike | done |
| 1. Foundation in `tailwind-base` | done — on branch `color-roles` |
| 2. Codemod the kit | done |
| 3. Re-tune default colors | done |
| 4. Playground and presets on roles | done |
| 5. Consumers | kit side on the branch, uncommitted; consumer side waits for a release |

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

`build/color-roles/roles-test.ts` compiles `theme.css` + `roles.css` + `default.css` with Tailwind, also lowers the output with lightningcss at Vite 8's default targets, and renders each new class next to the old pair it replaces — e.g. `tone-negative surface-soft` next to `bg-negative/10 dark:bg-negative-dark/10` — asserting equal computed colors. 27 pairs, plus checks for text inside `surface-fill`, the `surface` reset, derived on-colors (white on teal, black on yellow), a derived `surface-soft` that doesn't loop, and a `.light` island. Run in Chromium, Firefox and WebKit × native and lowered CSS × light and dark: all pass.

#### Color diff harness

Compares computed colors (`color`, backgrounds, borders, outline, shadow, fill, stroke, …) of every element on every docs page, in light and dark, between two builds. Unlike a pixel diff it names the element and the property that changed, and it is deterministic (two runs of the same build: 0 differences).

1. `npx vitepress build docs --outDir <dir>` for the baseline and for the change.
2. `node dump.mjs <dir> <out.json>` for each — serves the build under `/eco-vue-js/`, visits every page with Playwright.
3. `node diff.mjs base.json new.json` — changes grouped by `property: before → after`, with example elements.

Now `build/color-roles/color-diff.ts` (`dump` / `diff`). It sees what the docs demos render statically — hover, focus, error and open states mostly aren't covered, which is why the codemod also gets a static cascade scan (phase 2).

### 2. Codemod the kit

- [x] Move the color diff and role test to `build/color-roles/`; `playwright-core` added as a devDependency (browsers come from the Playwright cache: `npx playwright-core install chromium firefox webkit`).
- [x] `build/color-roles/codemod.ts`: replaces light/dark pairs inside one class string — neutral pairs only where the role default is exactly the pair (plus the `text-black-default dark:text-gray-200` → `text-accent` unification), equal-opacity pairs to the role with that opacity, and tone text/border pairs to `tone-X text-tone` / `border-tone` when the string has one tone and no state variant. Reports everything it leaves.
- [x] Automatic pass on `src/components` and `src/utils` (docs examples excluded): 93 pairs in 45 files. Docs color diff: only the listed unification (input text in dark mode, enabled and disabled, gray-200 → white). Role test: passes.
- [x] Cascade review of the automatic pass (below).
- [x] Codemod fix: it paired quotes from the start of the file, so a stray apostrophe skipped strings; it now takes every run between two consecutive quote characters. Second automatic pass: 46 more pairs.
- [x] Manual pass (below). 27 palette classes remain in 8 files, all kept on purpose.
- [x] Docs examples and the docs site's components: 31 pairs by the codemod (two border unifications added to its table: `gray-200|800` and `gray-100|800` → `line-subtle`), the rest by hand — example captions `text-gray-500` → `text-description`, fills and soft backgrounds to tones. Kept: the WPage example (print), logo fills, the docs home's `gray-850` alternate backgrounds (VitePress `--vp-c-bg-alt`). Color diff: example borders dark 800 → 700, light separators 100 → 200, captions light 500 → 400.
- [ ] Theming guide still describes palette pairs; rewrite with phase 4.
- [x] Color diff: only the listed changes. Transient UI (tooltip, dropdown, toast) compared in screenshots, light and dark.

#### Manual pass

Approach agreed 2026-10-01: keep the result where a role reproduces it; where a value was a near-duplicate or a dark-only tweak, move it to the nearest role and list the change.

New roles: `backdrop` (was `bg-primary-light/40 dark:bg-primary-darkest/40` — a tone scope on a backdrop would leak into the modal content it wraps), `focus` (WInput's field takes `tone-negative` on error, so its focus colors can't come from the tone). `line-raised` gets a light value.

| Where | Was | Now | Visible change |
| --- | --- | --- | --- |
| `SemanticType.ts` background map | `bg-X dark:bg-X-dark text-default` | `tone-X surface-fill` | none |
| `SemanticType.ts` chip map, secondary | `bg-gray-200 dark:bg-gray-800` | `bg-surface-inset` | dark gray-800 → 700 |
| InfoCard | `bg-X/10 dark:bg-X-dark/10` | `tone-X surface-soft` | primary: `primary/10` → `primary-light`, the same over white; dark slightly different |
| Progress bar | three maps of fills, labels, shine | `tone-X bg-tone-fill`, `text-tone-on`, `via-tone/40`; secondary `track-strong` | secondary bar gray-300/600 → 400/500 (stays visible on its track); shine opacity 40/50 → 40 |
| Striped progress | `bg-gray-200 dark:bg-gray-800`, `via-primary/60 dark:via-primary-dark/70` | `bg-surface-inset`, `via-tone/60` | dark track 800 → 700; dark shine 70 → 60 |
| Dropdowns, popovers (10 components) | `dark:border dark:border-gray-800`, `dark:outline-1 dark:outline-gray-800` | `border-line-raised` / `outline-line-raised` in both modes | light: a gray-100 edge appears |
| WNavItemExpand, ImageViewer, InputToolbar | gray-200/100/50 \| gray-800 borders | `border-line-raised` (`/50` for the toolbar) | nav popup light 200 → 100 |
| Tooltip, NotifyCard | `bg-black-default dark:bg-gray-800 text-default` | `.dark` island, `bg-surface-muted text-accent`; tooltip border `border-subtle` | light: #333 → gray-800; content inside renders in dark-mode colors |
| WButtonTab indicator | `bg-gray-400 dark:bg-gray-600` lost to `bg-inherit` in light (source order) | `bg-track-strong` | light: neutral indicator now gray, as in dark |
| Sliders, bottom sheet handle | `bg-gray-300\|600`, `bg-gray-200\|600`, `bg-gray-300` | `bg-track` | dark 600 → 700; range light 200 → 300; handle dark 300 → 700 |
| WButtonInput, InputToolbarButton | `border-gray-200\|800`, `border-gray-300\|600` | `border-line-subtle`, `border-line` | dark 800 → 700, 600 → 700 |
| List card stripes, heatmap empty cells, filter row hover | `gray-50 \| primary-darkest/25`, `gray-50 \| gray-800/20`, `gray-50 \| gray-800` | `bg-surface-muted/50`, `group-hover:bg-surface-muted` | dark stripe loses its purple tint; dark heatmap cells a bit stronger; hover light 50 → 100 |
| Checkbox disabled glyph, filter divider, file-picker remove hover | `text-gray-300\|700`, `bg-gray-400`, `hover:bg-black-default/5` | `text-subtle`, `bg-line`, `hover:bg-accent/5` | small; hover is now white/5 in dark |
| WNavBar open item | `text-primary` (light only) | `tone-primary text-tone` | dark: primary → primary-dark |
| Everything else migrated here | fills, hover fills, soft primary, tone text with `hover:`/`before:`, selected-day text | `surface-fill`, `hover:surface-fill`, `bg-tone-soft`, `hover:text-tone`, `text-surface` | none |

Also: `dark:border-b-transparent` in ListItem removed — it only existed to out-rank the old `dark:border-gray-700`. DragItem and WChartHeatmap fallbacks `var(--color-default)` / `var(--color-default-dark)` → `var(--w-surface)`.

Kept on purpose: WPage / WPageTitle (print, light only), white sheens (`via-white/*`, `bg-default/30`), black ripples (`before:text-black-default`), the image overlay in WImageViewer, the brand gradient in WProgressStriped, WShine (`primary-light` in both modes), WButtonAction's loading stripes, ImageModal's dark shadow.

#### Cascade review

The old pairs had a `dark:` class with higher specificity (`.dark .dark\:bg-x:not(:is(.light *))`), so in dark mode it beat any plain class of the same property on the element; roles are single classes and fall back to source order. Scanned every migrated template element for a role plus another plain color class of the same property: all hits are mutually exclusive conditions, other attributes (`content-class`), or width/gradient utilities, except WInput's field — `tone-negative border-tone` (error) and `border-line` (enabled) both apply, and `border-tone` sorts after `border-line`, so the error border wins as `border-negative` did over `border-gray-300`. Elements with several `tone-*` classes: all on mutually exclusive conditions or separate elements. WButton combines the background and border maps of `SemanticType.ts` for the same type, so they share a tone. Consumers override only the background and chip maps (appsec, auditor, traio), which the automatic pass left alone.

#### Left for the manual pass

Run `node build/color-roles/codemod.ts` for the current list. By kind:

- **Fills** (`bg-primary dark:bg-primary-dark` with `text-default`, same for the status colors; about 60 classes) — `tone-X surface-fill`, which also covers the text on them. Mostly `SemanticType.ts` background/chip maps, `progressBarClass.ts`, WButtonTab, CalendarDay, WCheckbox. The maps are overridable by consumers, so their keys stay and only the values change.
- **Soft primary** (`bg-primary-light dark:bg-primary-darkest`, often with opacity; about 14) — `tone-primary bg-tone-soft`, or `surface-soft`.
- **Dark-only lines** (`dark:border-gray-800`, `dark:outline-gray-800`; 8) — `line-raised`.
- **Near-duplicates** (`bg-gray-200 dark:bg-gray-800`, `bg-gray-300 dark:bg-gray-600`, `text-gray-300 dark:text-gray-700`, …) — pick the nearest role and list the change.
- **Gradients** (`via-*`; about 15) — tone colors in the progress bar shine; need `via-tone`.
- **Tones with state variants** (`hover:text-primary dark:hover:text-primary-dark`) — `tone-X hover:text-tone`.
- Phases 1–2 ship as one minor. Nothing breaks for consumers: palette names still work as inputs.

### 3. Re-tune defaults

Separate minor, deliberate visual change.

- [x] Contrast check: `build/color-roles/contrast-test.ts` resolves every role in the browser, composites translucent colors, and checks WCAG ratios in light and dark (`--report` prints all). Baseline before retuning: 23 pairs under their minimum; after: 0.
- [x] One neutral tint: `gray-*` is Tailwind's zinc, the scale `default-dark` (zinc-900) came from; `gray-850` interpolated.
- [x] Tone fills chosen for contrast: each keeps its hue, lightness set so white text reads (≥ 4.5) and the fill stands out on the dark surface (≥ 3), so one value serves both modes and `X-dark` defaults to `X`. Warning is a deeper amber, still with black text.
- [x] Derived sub-roles on by default; the kit's explicit on/soft values are gone.
- [x] Visual sign-off (screenshots: button, status, info cards, input, tabs, checkbox pages, before/after, light/dark).
- [x] Soft backgrounds read duller than before (12% of a darker fill): kept; fine-tune later with the rest of the kit's look.

#### Palette

| Token | Was | Now |
| --- | --- | --- |
| `primary` / `-dark` | `#9087e2` / `#5b4fc4` | `oklch(55% 0.17 286.8)` (#6e5bce) / same |
| `primary-light` / `-darkest` | `#f4f3fc` / `#23222e` | `color-mix` of `primary` 10% over `default` / 20% over `default-dark` — follow a theme's primary |
| `negative` / `-dark` | `#f35555` / `#cc3636` | `oklch(57% 0.2 24.1)` (#d42f37) / same |
| `positive` / `-dark` | `#77d460` / `#5bb245` | `oklch(54% 0.148 150)` (#02853c) / same |
| `warning` / `-dark` | `#ffda56` / `#e6b919` | `oklch(82% 0.16 85)` (#f3ba25) / same |
| `info` / `-dark` | `#82adff` / `#407ae5` | `oklch(55% 0.16 262.6)` (#3c6cce) / same |
| `gray-50`…`950` | Tailwind gray (bluish) | Tailwind zinc |

#### Derivation

`X` and `X-dark` keep meaning "the value for light mode" and "for dark mode" — aspm's `primary-dark` is lighter than its `primary`, traio's is white — so roles never treat `-dark` as a darker shade. Instead `tone-*` derives from the fill of the current mode:

- text and borders (`--w-tone`): lightness clamped to ≤ 0.53 in light, ≥ 0.72 in dark;
- on-fill (`--w-tone-on`): black or white, switching where APCA rates them the same — at the luminance of a gray of L 0.71, so the switch follows each hue's luminance rather than its lightness;
- soft (`--w-tone-soft`): 12% of the fill over the surface.

Pins per tone: `--tone-text-*`, `--tone-on-*`, `--tone-soft-*` in a theme's `@theme inline`. The semantic border map uses `border-tone-fill`, so a filled button's border stays its fill and an outlined one keeps today's look.

Other changes: `text-description` light gray-400 → 500 and dark 500 → 400 (4.8 and 6.8 instead of 2.6 and 3.7); docs VitePress link text (`--vp-c-brand-1`) uses the same clamped shade; docs body uses `bg-surface text-accent`.

Effects on consumers worth noting in the release: traio's dark primary fill (white) now gets black text; whitespots, which sets only `primary`, gets its own color in dark mode instead of the kit's old `primary-dark`.

### 4. Playground and presets

- [x] Roles are theme tokens: `--role-{name}` and `--role-{name}-dark` in `@theme` (`css/roles.css`), defaulting to the palette; `--w-*` reads them on every mode boundary. An app sets a role like a palette color. Role test checks an override reaches a `.light` island.
- [x] Docs playground edits palette inputs — `-dark` fields empty by default ("same as light"), tints shown as their `color-mix` — with a neutral scale picker and a collapsed Roles section. Defaults are read from `theme.css` and `roles.css` (`?raw`), so they can't drift. Swatches render `var(--key)`; the picker resolves it through a probe element.
- [x] Presets (`docs/.vitepress/themePresets.ts`, no browser code) set a neutral scale and tones: ocean slate + cyan info, forest stone + lime positive, sunset stone + rose negative + amber, compact neutral + near-black primary with a light `primary-dark`.
- [x] `contrast-test.ts --presets` checks every preset with the `@theme` CSS the playground gives an app: 0 pairs under minimum.
- [x] Theme link schema: `neutral` (scale name) and `role-*` keys. Theming page rewritten: palette, light/dark contract, tones and derivation, roles table, classes for app code, presets, palette and shape tables.
- [x] Leftover `dark:` pairs in `docs/examples` (guide and recipe demos) and the app-shell guide moved to roles.

`default-dark` stays a fixed value in the kit: whitespots sets its own `gray-900` (#1c1f22) and uses `default-dark` (zinc-900) as a separate, darker surface in 31 places. The playground's neutral swap sets `default-dark` to the scale's 900 instead. `gray-850` is mixed from 800 and 900, so it follows a consumer's scale (traio scrollbar gutter, five spots in whitespots; aspm sets its own).

Color diff against phase 3: only the edited pages, and gray-850 rounding below one unit.

### 5. Consumers

Kit side:

- [x] Codemod shipped as `npx eco-vue-color-roles` (`package/scripts/color-roles-codemod.js`, plain JS: Node won't strip types under `node_modules`); `build/color-roles/codemod.ts` removed.
  - Maps a pair on any property its role suits (`stroke-gray-200 dark:stroke-gray-700` → `stroke-line-subtle`); tone pairs with equal opacity, and tone backgrounds (`bg-tone-fill/10`).
  - `--exact`: only replacements that render the same colors (exact role pairs, tone fills); skips unifications and derived tone text.
  - `--theme <css>`: reads the app's `--role-*: var(--color-*)` overrides, so the app's own surface and line pairs map.
  - Reports the pairs without a role, most frequent first; scans `.vue .ts .tsx .js .jsx .astro .html .svelte`.
  - `gray-100|gray-800` borders map to `line-subtle` (a unification), not to `line-raised`, which matches exactly but means popup edges.
  - Dry run in whitespots: 574 pairs (was 115), 601 with `--role-surface-dark: var(--color-gray-900)` (×46 `bg-default dark:bg-gray-900`); 167 with `--exact`. aspm and traio fronts: almost no pairs (their app code lives in appsec-portal-app).
- [x] Data palette `--color-data-{red,orange,amber,green,teal,cyan,blue,violet,fuchsia,pink,gray}`: Tailwind hues, lightness set per hue so white text reads (orange and amber are light hues, black text) and fills stand out on the dark surface. Checked by the contrast test as tones.
- [x] Gradient roles `gradient-start/middle/end` (`from-gradient-start via-gradient-middle to-gradient-end`), default primary turned 0°, 30°, 60° in hue, per mode.
- [x] Playground: Data and Roles groups, collapsed; theming page: data palette, gradient roles, migrating `dark:` pairs; preview of data tones and the gradient.
- [x] Kit `severity-*` and `score-*` removed: they belong to consumers. aspm, traio and auditor define all 26 themselves; whitespots uses the 12 `severity-*` from the kit and has to define them when it bumps.

Consumer side, after a release:

- [ ] whitespots: copy the kit's 12 `severity-*` values into its theme (removed from the kit in 0.20.0).
- [ ] whitespots: run the codemod (with `--role-surface-dark` and a muted-surface role in its theme), then the manual pass.
- [ ] Alias `scanner-*`, `json-*`, `score-*` to the data palette and drop their `-dark` pairs; `gwrt` to the gradient roles where it's the brand gradient (`pwrt` stays app-specific).
- [ ] aspm and traio: drop palette overrides that equal the new defaults; traio's `gray-50…200` still default to the kit's (now zinc).
- [ ] appsec-portal-app: not touched from here (it has uncommitted work on a feature branch).

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
| `border-line-raised`, `outline-line-raised` | `--w-line-raised` | Edge of floating surfaces: dropdowns, popovers |
| `bg-backdrop` | `--w-backdrop` | Behind modals, bottom sheets, the mobile nav |
| `border-focus`, `outline-focus` | `--w-focus` | Focus border and ring of fields |

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

- 2026-10-01 — Roles are configurable as `--role-*` / `--role-*-dark` theme tokens, the same light/dark contract as the palette, rather than by redeclaring `--w-*` on the mode boundaries.
- 2026-10-01 — The kit's `default-dark` stays fixed rather than following `gray-900`; neutral presets set it.

## Open questions

- Nesting semantics differ slightly: the `dark:` variant is `.dark &:not(:is(.light *))`, so `.dark > .light > .dark` content counts as light, while `color-scheme` takes the nearest class (dark). `color-scheme` is arguably right; check no consumer relies on the old behaviour.
- Main text in dark mode: `text-accent` (white) is the standard; the `dark:text-gray-200` / `dark:text-gray-100` spots are inconsistencies and move to `text-accent` in phase 2, listed in its diff.

## Log

- 2026-10-01 — Plan written; spike done in Chromium and Firefox; inventory of the kit and five consumer repos.
- 2026-10-01 — Spike done in WebKit. Found lightningcss lowering of `light-dark()` in the docs build; roles moved to `css/roles.css` declared per mode boundary. `text-accent`, `text-description`, autofill, resizer and `code-inline` colors read variables. Color diff: 0 changes. `plans/` excluded from the docs build.
- 2026-10-01 — Names agreed. All roles, kit tones, `tone-*` and `surface-*` added to `css/roles.css` with today's values; role equivalence test passes in three engines; docs color diff 0.
- 2026-10-01 — Consumer check in auditor: CSS and rendered colors unchanged apart from `color-scheme`; native controls now follow dark mode. Phase 1 done.
- 2026-10-01 — Phase 2 started: harness and role test moved to `build/color-roles/`, codemod written; automatic pass replaced 93 pairs in 45 files; color diff shows only the agreed input text unification; cascade review clean. 166 classes left for the manual pass.
- 2026-10-01 — Codemod scanner fixed (46 more pairs). Manual pass done: fills, soft, raised lines (now both modes), islands for tooltip and toast, `backdrop` and `focus` roles. Visible changes listed in the manual pass table. Color diff, screenshots of transient UI, role test and build: clean.
- 2026-10-01 — Docs examples and docs site components migrated. Phase 2 done.
- 2026-10-01 — Phase 3 candidate: contrast test (23 → 0 failing pairs), zinc neutral, tone fills for contrast, derived tone text / on / soft. Awaiting visual sign-off.
- 2026-10-01 — Phase 3 committed after sign-off (soft backgrounds kept). Phase 4: `--role-*` theme tokens, playground with neutral scale and roles, presets with neutrals and tones checked by the contrast test, theming guide rewritten.
- 2026-10-01 — Phase 4 committed. Phase 5 kit side: codemod shipped as `eco-vue-color-roles` with `--exact`, `--theme` and the unmapped-pair report; data palette and gradient roles; contrast test covers data tones.
