---
group: Display
description: WChip — a short label in a colored box, such as a tag or a status flag, with a skeleton state.
---

# Chip

`WChip` is a short label in a colored box, such as a tag on a card or the status of a row. The `text` prop is the label and `icon` puts an icon before it; the default slot replaces the label.

The color comes from `semanticType`. The classes behind each type are set once per app with `setSemanticTypeChipMap` from `eco-vue-js/dist/utils/SemanticType` — [WCounter](/components/counter) reads the same map. `soft` turns the box into a rounded pill with a tinted background and colored text, for a status that sits on its own rather than inside a dense row; its classes come from `setSemanticTypeChipSoftMap`. `skeleton` shows a placeholder the size of a chip, and a form or an area can set it for everything inside — see [Conventions](/guide/conventions).

<!-- @example Chip/Basic -->

<DocsDemo name="Chip/Basic" />

```vue
<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-center gap-2">
      <WChip
        v-for="type in semanticTypes"
        :key="type"
        :text="type"
        :semantic-type="type"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <WChip
        v-for="type in semanticTypes"
        :key="type"
        :text="type"
        :semantic-type="type"
        soft
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <WChip
        text="Watered"
        :semantic-type="SemanticType.POSITIVE"
        :icon="IconCheck"
      />

      <WChip
        text="Watered"
        :semantic-type="SemanticType.POSITIVE"
        :icon="IconCheck"
        soft
      />

      <WChip
        text="Gardener"
        :skeleton="loading"
      />

      <WToggle
        v-model="loading"
        title="Loading"
        class="ml-4"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconCheck from 'eco-vue-js/dist/assets/icons/IconCheck'

const semanticTypes = Object.values(SemanticType)

const loading = ref(false)
</script>
```

<!-- @example-end -->

## API

<!-- @api WChip -->

### WChip

```ts
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Label of the chip. The default slot replaces it. |
| `semanticType` | `SemanticType` | `SemanticType.SECONDARY` | Color scheme of the chip. |
| `soft` | `boolean` | — | Renders a rounded pill with a tinted background and colored text instead of a filled box. |
| `icon` | `SVGComponent` | — | Icon shown before the label. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the chip. When unset, inherits the skeleton state provided by a parent. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the chip, replacing `text`. |

<!-- @api-end -->
