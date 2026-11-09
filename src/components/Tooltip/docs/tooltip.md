---
group: Overlays
description: WTooltip — a hover tooltip placed inside the element it describes, with text or rich content, placement, delay and overflow-only mode.
---

# Tooltip

`WTooltip` goes *inside* the element it describes and opens while its parent is hovered. It renders nothing in place — the `WTooltipContainer` at the app root draws it (see [Getting started](/guide/getting-started#global-containers)), so `overflow: hidden` ancestors never clip it.

<!-- @example Tooltip/Basic -->

<DocsDemo name="Tooltip/Basic" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-6">
    <span class="cursor-help underline decoration-dotted">
      Hardy
      <WTooltip text="Survives winters outdoors down to −15 °C." />
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
          <b>Last watered</b>
          <span>2 days ago · 250 ml</span>
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
      Monstera deliciosa 'Thai Constellation'
      <WTooltip
        text="Monstera deliciosa 'Thai Constellation'"
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

- **Content** — the `text` prop, or the default slot for markup (reactive while open).
- **Placement** — above or below, whichever fits; `top`/`bottom` force one, `left`/`right` place it beside.
- **`overflowOnly`** — opens only when the parent's content is truncated.
- **`delay`** — milliseconds before opening.
- **`trigger`** — listens on another element; `noTouch` skips touch devices.

The tooltip stays open while hovered, so its text is selectable and links clickable. `static` closes it as soon as the pointer leaves the element — use it for short hints that would otherwise block content.

Many components (`WButton`, `WCheckbox`, `WButtonMoreItem`…) take a `tooltipText` prop instead.

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
