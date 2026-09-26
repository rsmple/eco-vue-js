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
