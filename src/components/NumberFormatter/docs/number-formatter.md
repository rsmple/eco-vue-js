---
group: Display
description: WNumberFormatter — a number with thousands separators, a fraction as a percentage, or a compact number with the full value in a tooltip.
---

# Number formatter

`WNumberFormatter` shows a number with thousands separators and up to three decimals, or a fraction as a percentage with `percent` — 0.25 is 25%. `compact` shortens it, 12840 to 13K, with the full number in a tooltip; `noTouch` skips the tooltip on touch devices.

Without `tag` the number is plain text and the tooltip attaches to the parent element — so the parent's whole box is the hover target. With `tag`, the number gets its own element.

The formatters behind it are exported for use in code — see [Formatting](/utilities/formatting#numbers).

<!-- @example NumberFormatter/Basic -->

<DocsDemo name="NumberFormatter/Basic" />

```vue
<template>
  <div class="grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-2">
    <span class="text-description">Seeds sown</span>
    <WNumberFormatter
      :model-value="12840"
      tag="span"
    />

    <span class="text-description">Compact</span>
    <WNumberFormatter
      :model-value="12840"
      tag="span"
      compact
    />

    <span class="text-description">Sprouted</span>
    <WNumberFormatter
      :model-value="0.4375"
      tag="span"
      percent
    />

    <span class="text-description">Of the region</span>
    <WNumberFormatter
      :model-value="0.000125"
      tag="span"
      percent
      compact
    />
  </div>
</template>

<script lang="ts" setup>
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'
</script>
```

<!-- @example-end -->

## API

<!-- @api WNumberFormatter -->

### WNumberFormatter

```ts
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `number` | **required** | Number to show. With `percent`, a fraction: 0.25 is 25%. |
| `percent` | `boolean` | — | Formats the number as a percentage. |
| `compact` | `boolean` | — | Formats the number in compact notation, 1.2K for 1234, with the full number in a tooltip. |
| `tag` | `string` | — | Element to wrap the number in. Without it the number is plain text, and the tooltip attaches to the parent element. |
| `noTouch` | `boolean` | — | Skips the tooltip on touch devices. |

<!-- @api-end -->
