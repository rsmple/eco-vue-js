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

The tooltip stays open while the pointer moves onto it, so its text can be selected and its links clicked; `static` makes it ignore the cursor instead, so it closes as soon as the pointer leaves the element. Use it for short hints, where a tooltip that holds on to the cursor only gets in the way of the content under it.

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
| `text` | `string` | — | Plain text content, shown on one line. The default slot takes precedence. Nothing opens when both are empty. |
| `noTouch` | `boolean` | — | Skips the tooltip entirely on touch devices. |
| `overflowOnly` | `boolean` | — | Opens only when the trigger's content overflows it — for truncated text. |
| `trigger` | `Element` | — | Element that opens the tooltip on hover. Defaults to the tooltip's parent element. |
| `noTrigger` | `boolean` | — | Attaches no hover listeners; open and close it through the exposed `open` and `close`. |
| `top` | `boolean` | — | Prefers placing the tooltip above the parent. |
| `bottom` | `boolean` | — | Prefers placing the tooltip below the parent. |
| `left` | `boolean` | — | Places the tooltip to the left of the parent. |
| `right` | `boolean` | — | Places the tooltip to the right of the parent. |
| `static` | `boolean` | — | Makes the tooltip ignore the cursor, so it closes when the pointer leaves the trigger and its content cannot be interacted with. For small hints that would otherwise block content underneath. |
| `delay` | `number` | — | Milliseconds to wait on hover before opening. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Rich tooltip content, replacing `text`. It stays reactive while the tooltip is open. |

<!-- @api-end -->

<!-- @api WTooltipContainer -->

### WTooltipContainer

```ts
import WTooltipContainer from 'eco-vue-js/dist/components/Tooltip/WTooltipContainer.vue'
```

#### Props

_No props._

<!-- @api-end -->
