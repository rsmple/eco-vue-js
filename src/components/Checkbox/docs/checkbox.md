---
group: Controls
order: 4
description: WCheckbox, WCheckboxGroup and WCheckboxGroupMultiple — a single checkbox, one value out of a list with radio buttons, and several values out of a list of plain values or objects.
---

# Checkbox

`WCheckbox` is a checkbox for a `boolean` model. The title comes from the `title` prop or the default slot, and `radio` draws a round radio button instead. With `intermediate`, a `null` model shows the partly-selected mark — for a "select all" over a partial selection.

<!-- @example Checkbox/Basic -->

<DocsDemo name="Checkbox/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-2">
    <WCheckbox
      v-model="agree"
      title="I agree to the terms"
    />

    <WCheckbox
      :model-value="null"
      title="Partly selected"
      intermediate
    />

    <WCheckbox
      v-model="compact"
      title="Radio look"
      radio
    />

    <WCheckbox
      :model-value="true"
      title="Disabled"
      tooltip-text="Managed by your organization"
      disabled
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'

const agree = ref(false)
const compact = ref(true)
</script>
```

<!-- @example-end -->

## Groups

For a choice out of a list there are two group components. Both take the options as `list` and render inside a field wrapper, so they have the field's `title`, `description` and error layout:

- `WCheckboxGroup` picks one value — `v-model` holds it. `allowClear` lets a click on the selected option clear it back to `null`.
- `WCheckboxGroupMultiple` picks several. Its model is an array, but it doesn't emit a new array: it emits `select` and `unselect` with the one value that changed, so the parent can save each change on its own.

`list` holds plain values, labelled with `titleMap` (and optionally `iconMap`, `tooltipTextMap`, `classMap`), or objects, with `valueGetter` to read the value out of each and the `option` slot or `optionComponent` to render it. `wrap` lays the options out in a row that wraps, `stretch` spreads them over the width.

<!-- @example Checkbox/Group -->

<DocsDemo name="Checkbox/Group" />

```vue
<template>
  <div class="grid max-w-md gap-6">
    <WCheckboxGroup
      v-model="plan"
      :list="PLANS"
      :title-map="PLAN_TITLES"
      title="Plan"
      radio
      wrap
    />

    <WCheckboxGroupMultiple
      :model-value="channels"
      :list="CHANNELS"
      :value-getter="item => item.id"
      title="Notify me by"
      @select="channels = [...channels, $event]"
      @unselect="channels = channels.filter(id => id !== $event)"
    >
      <template #option="{option}">
        {{ option?.title }}
      </template>
    </WCheckboxGroupMultiple>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
import WCheckboxGroupMultiple from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroupMultiple.vue'

const PLANS = ['free', 'pro', 'team'] as const

const PLAN_TITLES = {free: 'Free', pro: 'Pro', team: 'Team'}

const CHANNELS = [
  {id: 1, title: 'Email'},
  {id: 2, title: 'Slack'},
  {id: 3, title: 'Push notifications'},
]

const plan = ref<typeof PLANS[number]>('pro')
const channels = ref<number[]>([1])
</script>
```

<!-- @example-end -->

With `loading`, the option that was clicked last shows a spinner and the others are disabled — set it while the change saves.

## API

<!-- @api WCheckbox -->

### WCheckbox

```ts
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `boolean \| null` | **required** | — |
| `title` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `readonly` | `boolean` | — | — |
| `icon` | `SVGComponent` | — | — |
| `radio` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `skeleton` | `boolean` | — | — |
| `intermediate` | `boolean` | — | — |
| `tooltipText` | `string` | — | — |
| `alignTop` | `boolean` | — | — |
| `noMargin` | `boolean` | — | — |
| `lessTransitions` | `boolean` | — | — |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: boolean)` | — |
| `mousedown` | `(value: MouseEvent)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | — |

<!-- @api-end -->

<!-- @api WCheckboxGroup -->

### WCheckboxGroup

```ts
import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `Model[] \| Entity[] \| readonly Entity[] \| readonly Model[]` | **required** | — |
| `valueGetter` | `ValueGetter \| ((value: Entity) => Model)` | — | — |
| `optionComponent` | `CheckboxGroupOptionComponent<Entity> \| CheckboxGroupOptionComponent<Model>` | — | — |
| `modelValue` | `Model \| undefined` | **required** | — |
| `wrap` | `boolean` | — | — |
| `stretch` | `boolean` | — | — |
| `allowClear` | `boolean` | — | — |
| `iconMap` | `Record<GroupModelStringified<Model>, SVGComponent>` | — | — |
| `titleMap` | `Record<GroupModelStringified<Model>, string>` | — | — |
| `tooltipTextMap` | `Record<GroupModelStringified<Model>, string>` | — | — |
| `classMap` | `Record<GroupModelStringified<Model>, string>` | — | — |
| `optionClass` | `string` | — | — |
| `radio` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `alignTop` | `boolean` | — | — |
| `lessTransitions` | `boolean` | — | — |

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
| `option` | `{ option: ValueGetter extends undefined ? Model : Entity; selected: boolean; }` | — |
| `right` | — | — |

<!-- @api-end -->

<!-- @api WCheckboxGroupMultiple -->

### WCheckboxGroupMultiple

```ts
import WCheckboxGroupMultiple from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroupMultiple.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `Model[] \| Entity[] \| readonly Entity[] \| readonly Model[]` | **required** | — |
| `valueGetter` | `ValueGetter \| ((value: Entity) => Model)` | — | — |
| `optionComponent` | `CheckboxGroupOptionComponent<Entity> \| CheckboxGroupOptionComponent<Model>` | — | — |
| `modelValue` | `Model[] \| undefined` | **required** | — |
| `radio` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `alignTop` | `boolean` | — | — |
| `lessTransitions` | `boolean` | — | — |
| `wrap` | `boolean` | — | — |
| `stretch` | `boolean` | — | — |
| `iconMap` | `Record<GroupModelStringified<Model>, SVGComponent>` | — | — |
| `titleMap` | `Record<GroupModelStringified<Model>, string>` | — | — |
| `tooltipTextMap` | `Record<GroupModelStringified<Model>, string>` | — | — |
| `classMap` | `Record<GroupModelStringified<Model>, string>` | — | — |
| `optionClass` | `string` | — | — |

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
| `select` | `(Model)` | — |
| `unselect` | `(Model)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | — |
| `subtitle` | — | — |
| `option` | `{ option: ValueGetter extends undefined ? Model : Entity; selected: boolean \| undefined; }` | — |
| `right` | — | — |

<!-- @api-end -->
