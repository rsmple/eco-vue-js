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
| `modelValue` | `boolean \| null` | **required** | Checked state. `null` is the mixed state — drawn as a smaller mark with `intermediate`. |
| `title` | `string` | — | Label next to the box; the default slot replaces it. |
| `disabled` | `boolean` | — | Blocks changes and dims the checkbox. When unset, inherits the disabled state provided by a parent. |
| `readonly` | `boolean` | — | Shows the state without allowing changes. When unset, inherits the readonly state provided by a parent. |
| `icon` | `SVGComponent` | — | Icon drawn inside the box instead of the check mark. |
| `radio` | `boolean` | — | Round radio button with a dot instead of a square box with a check mark. |
| `loading` | `boolean` | — | Shows a spinner in the box and ignores clicks. |
| `skeleton` | `boolean` | — | Renders in a gray loading state and ignores clicks. When unset, inherits the skeleton state provided by a parent. |
| `intermediate` | `boolean` | — | Draws a `null` model as a smaller mark, the mixed state, instead of a filled box. |
| `tooltipText` | `string` | — | Tooltip on hover over the box. Not shown on touch devices. |
| `alignTop` | `boolean` | — | Aligns the box with the first line of a multi-line title instead of centering it. |
| `noMargin` | `boolean` | — | Drops the bottom padding added under a checkbox with a title. |
| `lessTransitions` | `boolean` | — | Checks and unchecks without the scale animation. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: boolean)` | The opposite of the current state — a `null` model becomes `true`. |
| `mousedown` | `(value: MouseEvent)` | Mouse down on the checkbox. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Label next to the box. Replaces `title`. |

<!-- @api-end -->

<!-- @api WCheckboxGroup -->

### WCheckboxGroup

```ts
import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `Model[] \| Entity[] \| readonly Entity[] \| readonly Model[]` | **required** | Option objects, turned into values by `valueGetter`. Option values. |
| `valueGetter` | `ValueGetter \| ((value: Entity) => Model)` | — | Maps a `list` item to its value. Maps a `list` item to its value. Required when `list` holds objects. |
| `optionComponent` | `CheckboxGroupOptionComponent<Entity> \| CheckboxGroupOptionComponent<Model>` | — | Renders an option's label. The `option` slot replaces it. |
| `modelValue` | `Model \| undefined` | **required** | Selected value. |
| `wrap` | `boolean` | — | Lays the options out in a row that wraps, instead of a column. |
| `stretch` | `boolean` | — | Lays the options out in one row, stretched to equal widths. |
| `loading` | `boolean` | — | Shows a spinner in the last clicked option and disables the others, while its change is saved. |
| `allowClear` | `boolean` | — | Clicking the selected option again emits `null`. |
| `iconMap` | `Record<GroupModelStringified<Model>, SVGComponent>` | — | Icon inside each option's box, keyed by the option's value as a string. |
| `titleMap` | `Record<GroupModelStringified<Model>, string>` | — | Label of each option, keyed by the option's value as a string. |
| `tooltipTextMap` | `Record<GroupModelStringified<Model>, string>` | — | Tooltip on each option's box, keyed by the option's value as a string. |
| `classMap` | `Record<GroupModelStringified<Model>, string>` | — | Classes for each option, keyed by the option's value as a string. |
| `optionClass` | `string` | — | Classes for every option. |
| `radio` | `boolean` | — | Round radio button with a dot instead of a square box with a check mark. |
| `alignTop` | `boolean` | — | Aligns the box with the first line of a multi-line title instead of centering it. |
| `lessTransitions` | `boolean` | — | Checks and unchecks without the scale animation. |

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
| `update:model-value` | `(Model)` | The clicked option's value, or `null` when `allowClear` unselects it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the options. |
| `option` | `{ option: ValueGetter extends undefined ? Model : Entity; selected: boolean; }` | Renders an option's label. Replaces `optionComponent` and `titleMap`. |
| `right` | — | Content to the right of the options. |

<!-- @api-end -->

<!-- @api WCheckboxGroupMultiple -->

### WCheckboxGroupMultiple

```ts
import WCheckboxGroupMultiple from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroupMultiple.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `Model[] \| Entity[] \| readonly Entity[] \| readonly Model[]` | **required** | Option objects, turned into values by `valueGetter`. Option values. |
| `valueGetter` | `ValueGetter \| ((value: Entity) => Model)` | — | Maps a `list` item to its value. Maps a `list` item to its value. Required when `list` holds objects. |
| `optionComponent` | `CheckboxGroupOptionComponent<Entity> \| CheckboxGroupOptionComponent<Model>` | — | Renders an option's label. The `option` slot replaces it. |
| `modelValue` | `Model[] \| undefined` | **required** | Selected values. |
| `radio` | `boolean` | — | Round radio button with a dot instead of a square box with a check mark. |
| `loading` | `boolean` | — | Shows a spinner in the last clicked option and disables the others, while its change is saved. |
| `alignTop` | `boolean` | — | Aligns the box with the first line of a multi-line title instead of centering it. |
| `lessTransitions` | `boolean` | — | Checks and unchecks without the scale animation. |
| `wrap` | `boolean` | — | Lays the options out in a row that wraps, instead of a column. |
| `stretch` | `boolean` | — | Lays the options out in one row, stretched to equal widths. |
| `iconMap` | `Record<GroupModelStringified<Model>, SVGComponent>` | — | Icon inside each option's box, keyed by the option's value as a string. |
| `titleMap` | `Record<GroupModelStringified<Model>, string>` | — | Label of each option, keyed by the option's value as a string. |
| `tooltipTextMap` | `Record<GroupModelStringified<Model>, string>` | — | Tooltip on each option's box, keyed by the option's value as a string. |
| `classMap` | `Record<GroupModelStringified<Model>, string>` | — | Classes for each option, keyed by the option's value as a string. |
| `optionClass` | `string` | — | Classes for every option. |

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
| `select` | `(Model)` | An unselected option was clicked. |
| `unselect` | `(Model)` | A selected option was clicked. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the options. |
| `option` | `{ option: ValueGetter extends undefined ? Model : Entity; selected: boolean; }` | Renders an option's label. Replaces `optionComponent` and `titleMap`. |
| `right` | — | Content to the right of the options. |

<!-- @api-end -->
