---
group: Utilities
description: WBorderSvg — a border drawn as SVG over a positioned element, for dashes a CSS border can't do or a border that moves.
---

# Border SVG

`WBorderSvg` draws a border as SVG over a positioned element — for dashes that a CSS border can't do, or a border that moves, as on the [file picker](/components/file-picker)'s drop zone while a file is dragged over the page.

`stroke` sets the color — `currentColor` follows the text color — and `strokeDasharray` the dashes. An `animate` element in the default slot animates the border, usually its `stroke-dashoffset`. Utilities from the kit's Tailwind base set the rest:

- `w-border-svg-rounded-*` — corner radius, to match the element's.
- `w-border-svg-stroke-*` — line width in pixels, 2 by default, e.g. `w-border-svg-stroke-3`.
- `w-border-svg-padding-*` — its inset.

<!-- @example BorderSvg/Basic -->

<DocsDemo name="BorderSvg/Basic" />

```vue
<template>
  <div class="flex flex-wrap gap-6">
    <div class="text-description relative flex h-28 w-48 items-center justify-center text-sm">
      Dashed

      <WBorderSvg
        stroke="currentColor"
        stroke-dasharray="6px 6px"
        class="w-border-svg-rounded-xl"
      />
    </div>

    <div class="tone-primary text-tone relative flex h-28 w-48 items-center justify-center text-sm">
      Moving

      <WBorderSvg
        stroke="currentColor"
        stroke-dasharray="8px 6px"
        stroke-linecap="round"
        class="w-border-svg-rounded-xl w-border-svg-stroke-3"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-28"
          dur="1s"
          repeatCount="indefinite"
        />
      </WBorderSvg>
    </div>

    <div class="tone-positive surface-fill relative flex h-28 w-48 items-center justify-center rounded-xl text-sm">
      Dotted

      <WBorderSvg
        stroke="currentColor"
        stroke-dasharray="2px 4px"
        stroke-linecap="round"
        class="text-tone w-border-svg-rounded-2xl"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import WBorderSvg from 'eco-vue-js/dist/components/BorderSvg/WBorderSvg.vue'
</script>
```

<!-- @example-end -->

## API

<!-- @api WBorderSvg -->

### WBorderSvg

```ts
import WBorderSvg from 'eco-vue-js/dist/components/BorderSvg/WBorderSvg.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stroke` | `string` | — | Color of the border, e.g. `currentColor`. |
| `strokeDasharray` | `string` | — | Dash pattern of the border, e.g. `4px 8px`. |
| `strokeDashoffset` | `string` | — | Offset of the dash pattern, e.g. to animate it. |
| `strokeLinecap` | `"butt" \| "round" \| "square" \| "inherit"` | — | Shape of the dashes' ends. |
| `rectClass` | `string` | — | Class of the border's `rect`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | SVG animation elements for the border, such as an `animate` of `stroke-dashoffset`. |

<!-- @api-end -->
