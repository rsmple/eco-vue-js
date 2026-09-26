---
group: Overlays
description: WTooltip — a hover tooltip placed inside the element it describes, with text or rich content, placement, delay and overflow-only mode.
---

# Tooltip

`WTooltip` goes *inside* the element it describes and opens while the pointer is over that element — its parent. It renders nothing in place: the tooltip itself is drawn by the `WTooltipContainer` mounted once at the app root (see [Getting started](/guide/getting-started#global-containers)), so it is never clipped by an `overflow: hidden` ancestor.

<!-- @example Tooltip/Basic -->

<DocsDemo name="Tooltip/Basic" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-6">
    <span class="cursor-help underline decoration-dotted">
      SLA
      <WTooltip text="Service level agreement: fix critical issues within 24 hours." />
    </span>

    <span class="cursor-help underline decoration-dotted">
      On the right
      <WTooltip
        text="Placed to the right of its element."
        right
      />
    </span>

    <span class="cursor-help underline decoration-dotted">
      Rich content
      <WTooltip>
        <div class="grid gap-1">
          <b>Last scan</b>
          <span>12 findings · 3 critical</span>
        </div>
      </WTooltip>
    </span>

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      tooltip-text="Buttons take the text as a prop."
    >
      Button
    </WButton>

    <span class="w-40 truncate">
      A title too long to fit in its column
      <WTooltip
        text="A title too long to fit in its column"
        overflow-only
      />
    </span>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WTooltip from 'eco-vue-js/dist/components/Tooltip/WTooltip.vue'
</script>
```

<!-- @example-end -->

- **Content** is the `text` prop, or the default slot for markup. The slot stays reactive while the tooltip is open.
- **Placement** is above or below the element, whichever fits; `top` and `bottom` force one, `left` and `right` put it at the side.
- **`overflowOnly`** opens only when the parent's content is cut off — for truncated titles in narrow columns.
- **`delay`** waits that many milliseconds before opening.
- **`trigger`** listens on another element instead of the parent; `noTouch` skips the tooltip on touch devices.

The tooltip stays open while the pointer moves onto it, so its text can be selected and its links clicked; `static` closes it as soon as the pointer leaves the element.

Many components take a `tooltipText` prop that does the same without a child — `WButton`, `WCheckbox`, `WButtonMoreItem` and others.

## API

<!-- @api WTooltip -->

### WTooltip

```ts
import WTooltip from 'eco-vue-js/dist/components/Tooltip/WTooltip.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | — |
| `noTouch` | `boolean` | — | — |
| `overflowOnly` | `boolean` | — | — |
| `light` | `boolean` | — | — |
| `trigger` | `Element` | — | — |
| `noTrigger` | `boolean` | — | — |
| `maxHeight` | `number` | — | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `left` | `boolean` | — | — |
| `right` | `boolean` | — | — |
| `static` | `boolean` | — | — |
| `delay` | `number` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `any` | — |

<!-- @api-end -->
