---
group: Guide
order: 5
description: Theme eco-vue-js with Tailwind theme tokens and w-* CSS variables — a live playground, presets, CSS to copy into an app, and theme links that open any docs page with a theme applied.
---

# Theming

The kit's look comes from two kinds of CSS variables:

- **Theme tokens** — colors and fonts, declared in the kit's Tailwind `@theme`. Utilities like `bg-primary` read them, so an app overrides them in its own `@theme`.
- **`w-*` variables** — sizes and radii of fields, buttons and list headers. An app sets them on `body`, directly or with the matching utilities (`w-input-h-9`, `w-button-rounded-xl`).

Both are plain CSS variables at runtime, so this site can swap them live. Pick a preset or change a value below: the whole site follows, including the header and every component page. The theme is kept in this browser until you reset it — the palette button in the header switches presets and resets from any page.

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

## In an app

**Copy CSS** gives what goes in the app's stylesheet, after the kit's base:

```css
@import "tailwindcss";
@import "eco-vue-js/tailwind-base/base.css";

@theme {
  --color-primary: #5aa9e6;
  --color-primary-dark: #2b7bc0;
}

body {
  --w-input-height: 2.25rem;
  --w-input-rounded: 0.5rem;
  /* … */
}
```

Only changed colors are listed, but every `w-*` variable is: this site sets its own sizes, and an app without them gets the kit's defaults instead (in the table below).

Each color has a dark mode counterpart with a `-dark` suffix — components use `bg-primary dark:bg-primary-dark`, not one variable that changes with the mode. Set both.

## Theme links

A link to any page of this site can carry a theme in a `theme` query parameter. Opening it applies the theme, keeps it in the browser like one picked here, and drops the parameter from the address. **Copy link** above makes one for this page.

The parameter is a preset id, or a URL-encoded JSON object of tokens, with an optional `preset` the tokens override:

```
https://rsmple.github.io/eco-vue-js/guide/theming?theme=ocean
https://rsmple.github.io/eco-vue-js/components/select?theme={"preset":"compact","color-primary":"#e11d48","color-primary-dark":"#be123c"}
```

Encode the JSON with `encodeURIComponent` when building a link in code; browsers accept it unencoded when typed. Keys are the variable names without `--`. Unknown keys are ignored, and so are values with `;`, `{`, `}`, `<`, `>`, `\`, `url(` or `@import`. Colors take any CSS color syntax; sizes any CSS length. Radii double as side padding, so a pill shape is half the height (`1.125rem` for `2.25rem`), not `9999px`.

To make a theme from a description — "a warm, rounded theme for a finance dashboard" — pick values for the tokens below and link to the page the theme should be seen on, or to this one to keep editing it.

### Presets

| Id | Look |
| --- | --- |
| `default` | The kit's purple, as this site ships |
| `ocean` | Blue primary |
| `forest` | Green primary, pill-shaped fields and buttons |
| `sunset` | Orange primary, warm dark background |
| `compact` | Neutral gray primary, 2rem fields and buttons, small radii |

### Tokens

| Key | Site value | Kit default | Controls |
| --- | --- | --- | --- |
| `color-primary` | `#9087e2` | same | Fills and accents in light mode |
| `color-primary-dark` | `#5b4fc4` | same | Fills and accents in dark mode, primary text |
| `color-primary-light` | `#f4f3fc` | same | Soft backgrounds in light mode, such as list headers |
| `color-primary-darkest` | `#23222e` | same | Soft backgrounds in dark mode |
| `color-default` | `#ffffff` | same | Page and card background in light mode |
| `color-default-dark` | `oklch(21% 0.006 285.885)` | same | Page and card background in dark mode |
| `color-black-default` | `#333333` | same | Main text in light mode |
| `color-negative`, `color-negative-dark` | `#f35555`, `#cc3636` | same | Errors and destructive actions |
| `color-positive`, `color-positive-dark` | `#77d460`, `#5bb245` | same | Success |
| `color-warning`, `color-warning-dark` | `#ffda56`, `#e6b919` | same | Warnings |
| `color-info`, `color-info-dark` | `#82adff`, `#407ae5` | same | Information |
| `w-input-height` | `2.25rem` | `2.75rem` | Inputs and selects; the options inside them follow |
| `w-input-rounded` | `0.5rem` | `0.75rem` | Radius of inputs and selects, and the side padding of their options |
| `w-input-gap` | `0.125rem` | `0.25rem` | Space between a field's border and the options in it |
| `w-button-height` | `2.25rem` | `2.75rem` | Buttons |
| `w-button-rounded` | `0.75rem` | `1rem` | Radius of buttons, and their side padding |
| `w-list-header-height` | `2.25rem` | `2rem` | List headers |
| `w-list-header-rounded` | `0.75rem` | `1rem` | Radius of list headers |
| `w-checkbox-size` | `0.75rem` | `1rem` | Checkboxes and radios |
| `font-sans` | `MontSerrat, system-ui, sans-serif` | same | Text font. Only MontSerrat is loaded on this site; other families must be installed on the viewer's machine |

The kit has more `w-*` variables for single components, such as `w-list-padding` and `w-modal-wrapper-rounded`; the playground covers the ones that shape the whole app.
