---
group: Controls
description: WButtonGroup — a segmented control that picks one value out of a short list, bound with v-model.
---

# Button group

## Basic usage

`WButtonGroup` is a segmented control bound with `v-model`. `list` takes plain values; for objects, also pass `valueGetter` to pick the model value out of each item.

Options have no default label: render each one through the `option` slot, or pass an `optionComponent` that receives `option` and `selected`.

<!-- @example Button/Group -->

<DocsDemo name="Button/Group" />

```vue
<template>
  <WButtonGroup
    v-model="period"
    :list="periods"
    title="Period"
  >
    <template #option="{option}">
      {{ option }}
    </template>
  </WButtonGroup>

  <p class="mt-2 text-sm text-gray-500">
    Selected: {{ period }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'

const periods = ['day', 'week', 'month'] as const

const period = ref<typeof periods[number]>('week')
</script>
```

<!-- @example-end -->

## API

<!-- @api WButtonGroup -->

### WButtonGroup

```ts
import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `Entity[] \| readonly Model[]` | **required** | — |
| `valueGetter` | `ValueGetter \| ((value: Entity) => Model)` | — | — |
| `optionComponent` | `ButtonGroupOptionComponent<Entity> \| ButtonGroupOptionComponent<Model>` | — | — |
| `modelValue` | `Model` | **required** | — |
| `wrap` | `boolean` | — | — |
| `col` | `boolean` | — | — |
| `semanticType` | `SemanticType` | `SemanticType.PRIMARY` | — |
| `loading` | `boolean` | — | — |
| `stretch` | `boolean` | — | — |
| `allowClear` | `boolean` | — | — |
| `disabledItems` | `Model[]` | — | — |

::: details Inherited from `src/components/FieldWrapper/types.ts` (25)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | — |
| `titleIcon` | `SVGComponent` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | — |
| `tooltipText` | `string` | — | — |
| `maxLength` | `number` | — | — |
| `mono` | `boolean` | — | — |
| `hasChanges` | `boolean` | — | — |
| `skeleton` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `readonly` | `boolean` | — | — |
| `required` | `boolean` | — | — |
| `mandatory` | `boolean` | — | — |
| `noMargin` | `boolean` | — | — |
| `allowCopy` | `boolean` | — | — |
| `leftError` | `boolean` | — | — |
| `filterField` | `string` | — | — |
| `filterValue` | `unknown` | — | — |
| `subgrid` | `boolean` | — | — |
| `seamless` | `boolean` | — | — |
| `savedText` | `string` | — | — |
| `topText` | `boolean` | — | — |
| `allowDropFile` | `boolean` | — | — |
| `hideTitle` | `boolean` | — | — |
| `embedded` | `boolean` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(Model)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | — |
| `subtitle` | — | — |
| `option` | `{ option: Model \| Entity; selected: boolean; }` | — |
| `right` | — | — |

<!-- @api-end -->
