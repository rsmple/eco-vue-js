---
group: Display
description: WTextOverflow — one line cut at its width that scrolls the rest into view on hover, of itself or of a group/overflow parent.
---

# Text overflow

`WTextOverflow` shows one line cut at its width, and scrolls the rest into view on hover — or on hover of a parent with the `group/overflow` class, such as a list row or a card. Text that fits doesn't move.

The content has to stay on one line, so give it `whitespace-nowrap`.

<!-- @example TextOverflow/Basic -->

<DocsDemo name="TextOverflow/Basic" />

```vue
<template>
  <div class="grid max-w-60 gap-4">
    <div class="grid gap-1">
      <span class="text-description text-sm">Hover the name:</span>

      <WTextOverflow>
        <span class="whitespace-nowrap font-semibold">Monstera deliciosa 'Thai Constellation', half-moon variegation</span>
      </WTextOverflow>
    </div>

    <div class="group/overflow grid gap-1 rounded-xl border border-solid border-line-subtle p-3 hover:bg-surface-muted">
      <span class="text-description text-sm">Hover the card:</span>

      <WTextOverflow>
        <span class="whitespace-nowrap">North greenhouse, bench 4, row 2 — next to the fig cuttings</span>
      </WTextOverflow>
    </div>
  </div>
</template>

<script lang="ts" setup>
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
</script>
```

<!-- @example-end -->

## API

<!-- @api WTextOverflow -->

### WTextOverflow

```ts
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | One line of text. When it is wider than the component, hovering scrolls it to its end. |

<!-- @api-end -->
