---
group: Guide
order: 5
description: Theme eco-vue-js with a palette, color roles and w-* CSS variables — a live playground, presets, CSS to copy into an app, the tone and surface classes for app code, and theme links that open any docs page with a theme applied.
---

# Theming

The kit's look comes from CSS variables:

- **Palette** — primary, four status colors, a neutral `gray-*` scale, page background, text and fonts. Tailwind theme tokens, overridden in the app's `@theme`.
- **Color roles** — what components paint with, named by purpose: text, surfaces, lines, focus. Each defaults to a palette color; override in `@theme`.
- **`w-*` variables** — sizes and radii of fields, buttons and list headers. Set on `body`, directly or with utilities (`w-input-h-9`, `w-button-rounded-xl`).
- **Layout style** — flat, card or glass containers ([Layout styles](#layout-styles)).
- **Overlays** — frosted or lens glass for floating UI ([Overlays](#overlays)).

They are plain CSS variables at runtime, so this whole site follows the playground below.

- **The theme in use** is at the top. **Save as…** stores it in this browser (later changes save into it; the palette button in the header switches to it from any page). **Copy link** shares it — a saved theme is added to the recipient's themes. **Copy CSS** gives the stylesheet for an app.
- **Presets** are starting points; **My themes** lists saved ones. **Random** picks a primary, matching status colors, a neutral scale, size, radius and dark background, all passing the kit's contrast checks in both modes. Bright fills (warning, or a yellow/lime primary) get black text, and their text shades and focus ring are darkened to stay readable on white.
- **Ask an AI assistant** opens Claude or ChatGPT with a prompt explaining the tokens, or copies it. Paste the reply (JSON, link or the whole text) into the field below the buttons.
- **The fields below** edit each token.

<ClientOnly>
  <ThemePlayground />
</ClientOnly>

## Preview

<DocsDemo name="Button/SemanticTypes" />

<DocsDemo name="Input/Basic" />

<DocsDemo name="Select/Multiple" />

<DocsDemo name="Checkbox/Basic" />

<DocsDemo name="Tabs/Basic" overflowHidden />

<DocsDemo name="Progress/Basic" />

<ClientOnly>
  <ThemeDataPreview />
</ClientOnly>

## Layout styles

A **section** ([WSection](/components/surface), `surface-section`) is a page-level area — a list, a form, a settings group. A **card** ([WCard](/components/surface), `surface-card`) is a block that shows in every style — a tile, a stat. The layout style sets how they and the bars look:

- **Flat** (default): sections paint nothing, cards are one step off the page, bars dock to the screen edges.
- **Card**: the canvas is a step darker than the surface; sections and cards are rounded, lightly shadowed surfaces; bars float off the edges.
- **Glass**: as card, but translucent and blurred over a canvas tinted with the primary and two data hues.

<ClientOnly>
  <ThemeLayoutPreview />
</ClientOnly>

Switch here or from the theme menu in the header; this overrides only the theme's `layout`. Radii and the bar gap are under **Layout** in the playground; canvas color, glass gradient and grain under **Page background**. On phones, bars dock and sections span the screen in every style.

Card and glass ship with the kit: put `class="w-layout-card"` or `class="w-layout-glass"` on `<html>`. The playground's CSS then holds only what the theme changes on top; roles the style sets go on `:root`, not `@theme`, so they win over the class.

<div class="vp-raw max-w-80">
  <ClientOnly>
    <ThemeLayoutSwitch />
  </ClientOnly>
</div>

On this site, with no per-style code:

- **Bars**: WHeaderBar and WNavBar, docked in flat, floating in card and glass.
- **Docs pages**: a stack of sections — one per heading, one per example, one for the outline. Flat runs them into one column; card and glass separate them.
- **Home page**: hero forms and gallery tiles are cards, the footer a section.
- **List page**: the [List page](/recipes/list-page) recipe's window-scrolling list draws its own section.

Surfaces inside a container (sticky columns, striped rows, soft tones) follow it. Contrast checks run against the final section or card color over the canvas — for glass, over each spot of the gradient. The canvas is checked for main text only, since everything else sits in a section or card.

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

Only changed colors are listed, but every `w-*` variable is, since this site's sizes differ from the kit's defaults ([shape table](#shape)). Card and glass add their roles to `@theme`, variables to `body`, and two rules: bars dock on phones, and the page doesn't bounce sideways.

### Light and dark mode

`X` is a color's light-mode value and `X-dark` its dark-mode value — not a darker shade. Primary and status colors default `-dark` to the light value, which works for mid-tones. Set `-dark` when one value can't serve both, as `compact` does with a near-black primary.

Swapping the neutral scale in the playground also sets `default-dark` to the scale's `gray-900`. In an app, set `default-dark` yourself — the kit keeps it fixed, since some apps use it and `gray-900` as different surfaces.

### Tones

The palette gives one color per tone, the fill. The rest is derived per mode:

- **Text and borders** — the fill's lightness clamped: at most 53% in light mode, at least 72% in dark.
- **Text on the fill** — black or white by APCA, so saturated purples and blues keep white text.
- **Soft background** — 12% of the fill over the surface.

To pin one, set `--tone-text-{name}`, `--tone-line-{name}`, `--tone-on-{name}` or `--tone-soft-{name}` in `@theme inline` — e.g. `--tone-on-warning: var(--color-black-default)`.

### Roles

| Role | Classes | Default, light / dark | Paints |
| --- | --- | --- | --- |
| `text-accent` | `text-accent` | `black-default` / `default` | Main text |
| `text-description` | `text-description` | `gray-500` / `gray-400` | Muted text |
| `text-subtle` | `text-subtle` | `gray-400` / `gray-600` | Placeholders, disabled text, chart axes |
| `surface` | `bg-surface` | `default` / `default-dark` | Page and cards |
| `surface-subtle` | `bg-surface-subtle` | `gray-50` / `gray-850` | Barely raised areas: striped rows, empty chart cells, panels inside a card |
| `surface-muted` | `bg-surface-muted` | `gray-100` / `gray-800` | Secondary fills, hovered rows |
| `surface-inset` | `bg-surface-inset` | `gray-200` / `gray-700` | Fills inside controls, chips |
| `surface-raised` | `bg-surface-raised`, `surface-raised` | `default` / `default-dark` lightened by 4% | Dropdowns and popovers — in dark mode a shadow hardly shows, so they are lighter than the page instead |
| `overlay` | `bg-overlay` | `default` 40% / `default-dark` 60% | Translucent bars over scrolling content |
| `backdrop` | `bg-backdrop` | `primary-light` 40% / `primary-darkest` 40% | Behind modals, bottom sheets and the mobile nav |
| `track` | `bg-track` | `gray-300` / `gray-700` | Unfilled tracks of sliders and progress bars, toggles and checkboxes when off |
| `track-strong` | `bg-track-strong` | `gray-400` / `gray-500` | The stronger track: neutral progress bars, slider and tab indicator parts |
| `line` | `border-line` | `gray-300` / `gray-700` | Field borders and dividers |
| `line-subtle` | `border-line-subtle` | `gray-200` / `gray-700` | Card and section borders |
| `line-raised` | `border-line-raised`, `outline-line-raised` | `gray-300` / `gray-700` | Edge of dropdowns, popovers and tooltips |
| `shadow` | `shadow-md`, `drop-shadow-md` | black 15% / black 50% | Shadow under dropdowns, modals, tooltips and toasts — a primary mix makes it a glow |
| `focus` | `border-focus`, `outline-focus` | `primary` / `primary-dark` | Focused field border and ring |
| `gradient-start`, `gradient-middle`, `gradient-end` | `from-gradient-start via-gradient-middle to-gradient-end` | `primary`, turned 30° and 60° towards pink / the same from `primary-dark` | The brand gradient |

Set a role with `--role-{name}` and `--role-{name}-dark` in `@theme`:

```css
@theme {
  --role-line: var(--color-gray-400);
  --role-surface-muted-dark: oklch(25% 0.02 250);
}
```

`--w-shadow-lift` sets how far the shadow falls; `0` centers it, turning `shadow-md` into a glow:

```css
@theme {
  --role-shadow-dark: color-mix(in oklab, var(--color-primary-dark) 45%, transparent);
}

body {
  --w-shadow-lift: 0rem;
}
```

On a dark page a glow's brightness is roughly alpha × lightness, so yellow glows brighter than purple. Divide the alpha by the lightness to even it out — this matches 45% at lightness 0.6 for every hue:

```css
@theme {
  --role-shadow-dark: oklch(from var(--color-primary-dark) l c h / min(0.675, calc(0.27 / l)));
}
```

### Data palette

Categories — chart series, kinds, syntax colors — use the data hues: `data-red`, `data-orange`, `data-amber`, `data-green`, `data-teal`, `data-cyan`, `data-blue`, `data-violet`, `data-fuchsia`, `data-pink` and `data-gray`. They are mid-tones, so each works as a tone in both modes without `-dark` values.

Name categories after them, so retuning the palette retunes the categories:

```css
@theme {
  --color-kind-fern: var(--color-data-green);
  --color-kind-succulent: var(--color-data-teal);
}
```

```html
<span class="tone-kind-fern text-tone">Fern</span>
<span class="tone-kind-succulent surface-soft text-tone">Succulent</span>
```

### In app code

App code should use the same classes: roles and tones follow theme and mode with no `dark:` pair.

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
| `tone-{name}` | Sets the tone for the element and its children: `primary`, `negative`, `positive`, `warning`, `info`, any theme color (`tone-kind-fern`) or an arbitrary one (`tone-[#0f766e]`) |
| `text-tone` | The tone's readable shade, for text and icons on the page |
| `border-tone-line` | The tone's shade for borders — nearer the fill than `text-tone` |
| `bg-tone-fill`, `border-tone-fill`, `text-tone-on` | The fill, and the text that goes on it |
| `bg-tone-soft` | The tone's soft background |
| `surface-fill` | Fill background; roles inside switch to the text-on-fill color |
| `surface-soft` | Soft background; roles inside stay as they are |
| `surface-muted` | Muted background; a soft tone set inside it mixes over it |
| `surface-raised` | Dropdown background; soft tones and `bg-surface` inside follow it |
| `surface` | Page background and text; resets roles changed by an outer scope |
| `light`, `dark` | Forces a mode for the subtree, as tooltips do with `dark` |

Roles take opacity like any color: `bg-surface-muted/50`, `outline-focus/20`.

### Migrating `dark:` pairs

A codemod rewrites light/dark palette pairs in class strings to roles and tones:

```sh
npx eco-vue-color-roles                      # report what it would change in src/
npx eco-vue-color-roles --write src          # apply
npx eco-vue-color-roles --exact --write src  # only replacements that render the same colors
```

Without `--exact` it also maps near-duplicate grays to roles and tone text to the derived shade. It ends by listing unmapped pairs, most frequent first — a frequent one usually means the app's surface or line differs from the kit's. Set it as a role in the theme and rerun with `--theme`:

```css
@theme {
  --role-surface-dark: var(--color-gray-900);
}
```

```sh
npx eco-vue-color-roles --theme src/assets/styles/index.css --write src
```

## Theme links

Any page of this site accepts a `theme` query parameter. Opening it applies and keeps the theme, then drops the parameter. **Copy link** above makes one.

The value is a preset id, or URL-encoded JSON of tokens with an optional `preset` to override:

```
https://rsmple.github.io/eco-vue-js/guide/theming?theme=ocean
https://rsmple.github.io/eco-vue-js/components/select?theme={"preset":"compact","color-primary":"#e11d48","neutral":"stone"}
```

Encode with `encodeURIComponent` (browsers accept it unencoded when typed). Keys are variable names without `--`, plus `neutral` (`zinc`, `slate`, `gray`, `neutral`, `stone`), `layout` (`flat`, `card`, `glass`) and `overlay` (`frosted`, `lens`). An optional `name` saves it to the opener's themes, numbered if taken; an already-saved theme is switched to, not copied. Unknown keys are ignored, as are values containing `;`, `{`, `}`, `<`, `>`, `\`, `url(` or `@import`. Colors take any CSS color syntax, sizes any length. Radii double as side padding, so a pill is half the height (`1.125rem` for `2.25rem`), not `9999px`.

To build a theme from a description ("warm, rounded, for a finance dashboard"): pick a neutral scale and a primary, adjust status colors only where they clash, and link to the page it should be seen on. Mid-tone fills (OKLCH lightness 50–58%) need no `-dark` values.

### Presets

| Id | Look |
| --- | --- |
| `default` | The kit's violet on zinc, as this site ships |
| `ocean` | Blue primary, cyan info, slate neutrals, card layout |
| `forest` | Green primary, lime positive, stone neutrals, pill-shaped fields and buttons |
| `sunset` | Orange primary, rose negative, stone neutrals, glass layout |
| `compact` | Monochrome: near-black primary that turns light in dark mode, no tint, 2rem fields and buttons, small radii |

### Palette

| Key | Default | Controls |
| --- | --- | --- |
| `color-primary` | `oklch(62% 0.17 286.8)` | Fills, links, focus and selection |
| `color-primary-dark` | `primary` | The same in dark mode |
| `color-primary-light` | `primary` 10% over `default` | List headers and the backdrop in light mode |
| `color-primary-darkest` | `primary-dark` 20% over `default-dark` | The same in dark mode |
| `neutral` | `zinc` | The `gray-*` scale: lines, fills, muted text |
| `color-default` | `#ffffff` | Page and card background in light mode |
| `color-default-dark` | `oklch(21% 0.006 285.885)`, zinc's 900 | Page and card background in dark mode |
| `color-black-default` | `#333333` | Main text in light mode |
| `color-negative` | `oklch(64% 0.2 24.1)` | Errors and destructive actions |
| `color-positive` | `oklch(69% 0.148 150)` | Success |
| `color-warning` | `oklch(85% 0.16 85)` | Warnings; black text on the fill |
| `color-info` | `oklch(63% 0.16 262.6)` | Information |
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
| `w-shadow-lift` | `0.5rem` | `0.5rem` | How far `shadow-md` falls under dropdowns, modals and tooltips; `0rem` centers it into a glow |

### Layout

| Key | Flat | Card and glass | Controls |
| --- | --- | --- | --- |
| `layout` | `flat` | `card`, `glass` | The [layout style](#layout-styles), and with it the defaults below |
| `w-inner-margin` | `1rem` | `1rem` | The page margin on phones (`--inner-margin`): where content starts off the screen edges and the bars. Card and glass sections reach into it and pad by it |
| `w-inner-margin-sm` | `1.5rem` | `1.5rem` | The same from `sm` up |
| `w-section-rounded` | `0px` | `1.5rem` | Radius of sections |
| `w-section-gap` | `0px` | `0.75rem` | Between sections in a `surface-stack`, such as the parts of a docs page |
| `w-card-padding` | `1rem` | `1rem` | Inside cards |
| `w-card-rounded` | `1rem` | `1rem` | Radius of cards |
| `w-chrome-gap` | `0px` | `0.75rem` | Between the floating bars, the screen edges and the page; `0px` on phones |
| `w-chrome-rounded` | `0px` | `1rem` | Radius of the floating header, nav and actions bar; docked bars stay square |

A layout also sets `role-canvas`, `role-card` and the `w-section-*`, `w-card-*` and `w-chrome-*` opacity, edge, shadow and blur variables; **Copy CSS** lists them.

Dropdowns, their phone bottom sheets and notifications take `w-card-backdrop` and `w-card-opacity` halfway to opaque (glass `0.4` → `0.7`; flat and card stay opaque). Override with `w-dropdown-opacity` and `w-dropdown-backdrop`.

### Overlays

| Key | Default | Values | Controls |
| --- | --- | --- | --- |
| `overlay` | `frosted` | `lens` | The material of dropdowns, menus, notifications and the bars, and with it the variables below |

**Frosted** (default) blurs what is behind, per the layout. **Lens** is a refractive effect similar to Apple's Liquid Glass: it bends the page along the rim, slightly magnifies the middle, and highlights the edge. It applies to dropdowns, their phone bottom sheets, nav group menus, notifications, WHeaderBar, WNavBar and WActionsBar, and shows best in glass. In lens, dropdowns and floating bars are rounder, and in card and glass the bars float on phones as pills. Where glass overlaps glass, only the top one bends; dropdowns from a floating header open below it, and bending dropdowns have no tip.

Bending is an SVG `backdrop-filter`, applied only by Chromium; Safari and Firefox get the lighter fill and blur. Switch it with **Overlays** under the playground's **Layout** or in the theme menu; **Copy CSS** writes its variables:

| Variable | Lens | Controls |
| --- | --- | --- |
| `w-lens-refraction` | `40` | Rim bend in pixels; `0` turns it off |
| `w-lens-bezel` | `28` | Rim width in pixels |
| `w-lens-magnify` | `0.04` | Middle magnification: `0.04` is 4% |
| `w-lens-dispersion` | `0` | Prism-like color split along the rim; off, since Chrome blurs it on high-density screens |
| `w-dropdown-opacity` | `0.4` | Fill of dropdowns and notifications |
| `w-dropdown-backdrop` | `blur(4px) saturate(1.8) brightness(1.1)` | Their blur |
| `w-chrome-opacity` | `0.35` | Fill of the bars |
| `w-chrome-backdrop` | `blur(2px) saturate(1.8) brightness(1.1)` | The bars' blur |
| `w-dropdown-rounded` | `1.25rem` | Radius of dropdowns and popovers |
| `w-chrome-rounded` | `1.5rem` | Radius of floating bars; docked ones stay square |
| `w-chrome-phone-gap` | `0.5rem` | Bar gap from the screen edges on phones, in card and glass |
| `w-chrome-phone-rounded` | `1.75rem` | Bar radius on phones |

More `w-*` variables exist for single components (`w-list-padding`, `w-modal-wrapper-rounded`); the playground covers the app-wide ones.
