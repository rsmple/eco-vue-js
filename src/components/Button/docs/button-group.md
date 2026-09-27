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

::: details Inherited from `src/components/FieldWrapper/types.ts` (23)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `maxLength` | `number` | — | Shows a `length / maxLength` counter under the field while it is focused. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
| `readonly` | `boolean` | — | Shows the value without allowing changes. When unset, inherits the readonly state provided by a parent. |
| `required` | `boolean` | — | Adds an asterisk to the title. |
| `noMargin` | `boolean` | — | Drops the default bottom margin. |
| `allowCopy` | `boolean` | — | Adds a button that copies the value. |
| `leftError` | `boolean` | — | Aligns the error message to the left instead of the right. |
| `filterField` | `string` | — | Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. |
| `filterValue` | `unknown` | — | Value the filter button puts in the query. Defaults to `modelValue`. |
| `subgrid` | `boolean` | — | Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. |
| `seamless` | `boolean` | — | Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. |
| `topText` | `boolean` | — | Moves the counter and messages above the field instead of below it. |
| `allowDropFile` | `boolean` | — | Accepts files dropped onto the field. |
| `hideTitle` | `boolean` | — | Hides the title while keeping the rest of the layout. |
| `embedded` | `boolean` | — | For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. |

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
