---
group: Guide
order: 5
description: Theme eco-vue-js with a palette, color roles and w-* CSS variables — a live playground, presets, CSS to copy into an app, the tone and surface classes for app code, and theme links that open any docs page with a theme applied.
---

# Theming

The kit's look comes from three kinds of CSS variables:

- **Palette** — a primary color, four status colors, a neutral `gray-*` scale, the page background and text, and fonts. They are Tailwind theme tokens: an app overrides them in its own `@theme`.
- **Color roles** — what components actually paint with, named by purpose: main and muted text, surfaces, lines, focus. Each reads the palette by default, and an app can set any of them in `@theme` too.
- **`w-*` variables** — sizes and radii of fields, buttons and list headers. An app sets them on `body`, directly or with the matching utilities (`w-input-h-9`, `w-button-rounded-xl`).

All are plain CSS variables at runtime, so this site can swap them live. Pick a preset or change a value below: the whole site follows, including the header and every component page. The theme is kept in this browser until you reset it — the palette button in the header switches presets and resets from any page.

<ClientOnly>
  <ThemePlayground />
</ClientOnly>

## Preview

<DocsDemo name="Button/SemanticTypes" />

<DocsDemo name="Input/Basic" />

<DocsDemo name="Select/Multiple" />

<DocsDemo name="Checkbox/Basic" />

<DocsDemo name="Tabs/Basic" />

<DocsDemo name="Progress/Basic" />

<ClientOnly>
  <ThemeDataPreview />
</ClientOnly>

## In an app

**Copy CSS** gives what goes in the app's stylesheet, after the kit's base:

```css
@import "tailwindcss";
@import "eco-vue-js/tailwind-base/base.css";

@theme {
  --color-primary: oklch(54% 0.15 250);
  --color-gray-50: oklch(98.4% 0.003 247.858);
  /* … the rest of the neutral scale */
}

body {
  --w-input-height: 2.25rem;
  --w-input-rounded: 0.5rem;
  /* … */
}
```

Only changed colors are listed, but every `w-*` variable is: this site sets its own sizes, and an app without them gets the kit's defaults instead (in the [shape table](#shape)).

### Light and dark mode

A color named `X` is its value in light mode and `X-dark` its value in dark mode — not a darker shade. The status colors and primary default their `-dark` to the light value, which works when the color is a mid-tone: dark enough for white text, light enough to stand out on a dark page. Set `-dark` when one value can't do both, as the `compact` preset does with a near-black primary that turns light gray in dark mode.

Swapping the neutral scale in the playground also sets the dark page background, `default-dark`, to the scale's `gray-900`, so both modes take its tint. In an app, set `default-dark` alongside the scale: the kit keeps it fixed, since some apps use it and `gray-900` as two different surfaces.

### Tones

The palette gives one color per tone, the fill. Everything else a tone needs is derived from it in the current mode:

- **Text and borders** on the page — the fill's lightness clamped to stay readable: at most 53% in light mode, at least 72% in dark.
- **Text on the fill** — black or white, whichever contrasts more.
- **Soft background** — 12% of the fill over the surface, as in info cards.

So a light brand color still gives readable links on white, and a yellow fill gets black text, without extra tokens. To pin one of them, set `--tone-text-{name}`, `--tone-on-{name}` or `--tone-soft-{name}` in an `@theme inline` block — for example `--tone-on-warning: var(--color-black-default)`.

### Roles

| Role | Classes | Default, light / dark | Paints |
| --- | --- | --- | --- |
| `text-accent` | `text-accent` | `black-default` / `default` | Main text |
| `text-description` | `text-description` | `gray-500` / `gray-400` | Muted text |
| `text-subtle` | `text-subtle` | `gray-400` / `gray-600` | Placeholders, disabled text, chart axes |
| `surface` | `bg-surface` | `default` / `default-dark` | Page, cards, dropdowns |
| `surface-muted` | `bg-surface-muted` | `gray-100` / `gray-800` | Secondary fills, striped rows, tooltips |
| `surface-inset` | `bg-surface-inset` | `gray-200` / `gray-700` | Fills inside controls, chips |
| `overlay` | `bg-overlay` | `default` 40% / `default-dark` 60% | Translucent bars over scrolling content |
| `backdrop` | `bg-backdrop` | `primary-light` 40% / `primary-darkest` 40% | Behind modals, bottom sheets and the mobile nav |
| `track` | `bg-track` | `gray-300` / `gray-700` | Unfilled tracks of sliders and progress bars, toggles and checkboxes when off |
| `track-strong` | `bg-track-strong` | `gray-400` / `gray-500` | The stronger track: neutral progress bars, slider and tab indicator parts |
| `line` | `border-line` | `gray-300` / `gray-700` | Field borders and dividers |
| `line-subtle` | `border-line-subtle` | `gray-200` / `gray-700` | Card and section borders |
| `line-raised` | `border-line-raised`, `outline-line-raised` | `gray-100` / `gray-800` | Edge of dropdowns and popovers |
| `focus` | `border-focus`, `outline-focus` | `primary` / `primary-dark` | Focused field border and ring |
| `gradient-start`, `gradient-middle`, `gradient-end` | `from-gradient-start via-gradient-middle to-gradient-end` | `primary`, turned 30° and 60° towards pink / the same from `primary-dark` | The brand gradient |

A theme sets a role with `--role-{name}` and `--role-{name}-dark` in `@theme`:

```css
@theme {
  --role-line: var(--color-gray-400);
  --role-surface-muted-dark: oklch(25% 0.02 250);
}
```

### Data palette

Categories — chart series, scanner types, syntax colors — take the kit's data hues: `data-red`, `data-orange`, `data-amber`, `data-green`, `data-teal`, `data-cyan`, `data-blue`, `data-violet`, `data-fuchsia`, `data-pink` and `data-gray`. They are mid-tones like the status colors, so each works as a tone in both modes without `-dark` values (the Preview above shows them as fills and as soft chips).

An app names its categories after them, so a theme that retunes the palette retunes the categories too:

```css
@theme {
  --color-scanner-sast: var(--color-data-cyan);
  --color-scanner-sca: var(--color-data-fuchsia);
}
```

```html
<span class="tone-scanner-sast text-tone">SAST</span>
<span class="tone-scanner-sca surface-soft text-tone">SCA</span>
```

### In app code

Components use the same classes, and app code should too: a color written as a role or a tone follows the theme and the mode by itself, with no `dark:` pair.

```html
<!-- muted text and a divider -->
<p class="text-description border-b border-line-subtle">3 items</p>

<!-- tone text on the page -->
<p class="tone-negative text-tone">Required</p>

<!-- filled: plain text and descriptions inside become readable on the fill -->
<div class="tone-primary surface-fill">
  Plan <span class="text-description">renews monthly</span>
</div>

<!-- soft: tinted background, normal text, a tone icon -->
<div class="tone-info surface-soft">
  <IconInfo class="text-tone" />
  <p class="text-accent">Title</p>
</div>
```

| Class | Effect |
| --- | --- |
| `tone-{name}` | Sets the tone for the element and its children: `primary`, `negative`, `positive`, `warning`, `info`, any theme color (`tone-scanner-sast`) or an arbitrary one (`tone-[#0f766e]`) |
| `text-tone`, `border-tone` | The tone's readable shade, for text, icons and outlines on the page |
| `bg-tone-fill`, `border-tone-fill`, `text-tone-on` | The fill, and the text that goes on it |
| `bg-tone-soft` | The tone's soft background |
| `surface-fill` | Fill background; `text-accent`, `text-description`, `text-subtle` and lines inside switch to the text-on-fill color |
| `surface-soft` | Soft background; roles inside stay as they are |
| `surface-muted` | Muted background; a soft tone set inside it mixes over it |
| `surface` | Page background and text, and resets roles a scope outside changed |
| `light`, `dark` | Forces a mode for the element and its children, as tooltips do with `dark` |

Roles take opacity like any color: `bg-surface-muted/50`, `outline-focus/20`.

### Migrating `dark:` pairs

The kit ships a codemod that rewrites light/dark palette pairs in an app's class strings to roles and tones:

```sh
npx eco-vue-color-roles                      # report what it would change in src/
npx eco-vue-color-roles --write src          # apply
npx eco-vue-color-roles --exact --write src  # only replacements that render the same colors
```

Without `--exact` it also moves near-duplicate grays to the role the kit uses and tone text to the readable shade derived from the fill. It ends with the pairs it found no role for, most frequent first. A frequent one usually means the app's surface or line differs from the kit's default. Set it as a role in the app's theme, then run again with `--theme`, so those pairs map too:

```css
@theme {
  --role-surface-dark: var(--color-gray-900);
}
```

```sh
npx eco-vue-color-roles --theme src/assets/styles/index.css --write src
```

## Theme links

A link to any page of this site can carry a theme in a `theme` query parameter. Opening it applies the theme, keeps it in the browser like one picked here, and drops the parameter from the address. **Copy link** above makes one for this page.

The parameter is a preset id, or a URL-encoded JSON object of tokens, with an optional `preset` the tokens override:

```
https://rsmple.github.io/eco-vue-js/guide/theming?theme=ocean
https://rsmple.github.io/eco-vue-js/components/select?theme={"preset":"compact","color-primary":"#e11d48","neutral":"stone"}
```

Encode the JSON with `encodeURIComponent` when building a link in code; browsers accept it unencoded when typed. Keys are the variable names without `--`, plus `neutral`, which takes a scale name: `zinc`, `slate`, `gray`, `neutral` or `stone`. Unknown keys are ignored, and so are values with `;`, `{`, `}`, `<`, `>`, `\`, `url(` or `@import`. Colors take any CSS color syntax, including `var(--color-gray-400)`; sizes any CSS length. Radii double as side padding, so a pill shape is half the height (`1.125rem` for `2.25rem`), not `9999px`.

To make a theme from a description — "a warm, rounded theme for a finance dashboard" — pick a neutral scale and a primary, adjust status colors only where they clash with it, and link to the page the theme should be seen on, or to this one to keep editing it. Mid-tone fills (OKLCH lightness 50–58%) work in both modes without `-dark` values.

### Presets

| Id | Look |
| --- | --- |
| `default` | The kit's violet on zinc, as this site ships |
| `ocean` | Blue primary, cyan info, slate neutrals |
| `forest` | Green primary, lime positive, stone neutrals, pill-shaped fields and buttons |
| `sunset` | Orange primary, rose negative, stone neutrals |
| `compact` | Monochrome: near-black primary that turns light in dark mode, no tint, 2rem fields and buttons, small radii |

### Palette

| Key | Default | Controls |
| --- | --- | --- |
| `color-primary` | `oklch(55% 0.17 286.8)` | Fills, links, focus and selection |
| `color-primary-dark` | `primary` | The same in dark mode |
| `color-primary-light` | `primary` 10% over `default` | List headers and the backdrop in light mode |
| `color-primary-darkest` | `primary-dark` 20% over `default-dark` | The same in dark mode |
| `neutral` | `zinc` | The `gray-*` scale: lines, fills, muted text |
| `color-default` | `#ffffff` | Page and card background in light mode |
| `color-default-dark` | `oklch(21% 0.006 285.885)`, zinc's 900 | Page and card background in dark mode |
| `color-black-default` | `#333333` | Main text in light mode |
| `color-negative` | `oklch(57% 0.2 24.1)` | Errors and destructive actions |
| `color-positive` | `oklch(54% 0.148 150)` | Success |
| `color-warning` | `oklch(82% 0.16 85)` | Warnings; black text on the fill |
| `color-info` | `oklch(55% 0.16 262.6)` | Information |
| `color-*-dark` | the light value | Each status color in dark mode |
| `color-data-*` | Tailwind's hues at mid lightness: white text on all but orange and amber; gray is the scale's 500 | [Data palette](#data-palette) |
| `role-*`, `role-*-dark` | see [Roles](#roles) | One role, per mode |
| `font-sans` | `MontSerrat, system-ui, sans-serif` | Text font. Only MontSerrat is loaded on this site; other families must be installed on the viewer's machine |

### Shape

| Key | Site value | Kit default | Controls |
| --- | --- | --- | --- |
| `w-input-height` | `2.25rem` | `2.75rem` | Inputs and selects; the options inside them follow |
| `w-input-rounded` | `0.5rem` | `0.75rem` | Radius of inputs and selects, and the side padding of their options |
| `w-input-gap` | `0.125rem` | `0.25rem` | Space between a field's border and the options in it |
| `w-button-height` | `2.25rem` | `2.75rem` | Buttons |
| `w-button-rounded` | `0.75rem` | `1rem` | Radius of buttons, and their side padding |
| `w-list-header-height` | `2.25rem` | `2rem` | List headers |
| `w-list-header-rounded` | `0.75rem` | `1rem` | Radius of list headers |
| `w-checkbox-size` | `0.75rem` | `1rem` | Checkboxes and radios |

The kit has more `w-*` variables for single components, such as `w-list-padding` and `w-modal-wrapper-rounded`; the playground covers the ones that shape the whole app.
