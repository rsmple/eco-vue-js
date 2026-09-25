---
description: WButton and its variants — semantic colors, loading and disabled states, links, tooltips and segmented groups (WButtonGroup).
---

# Button

`WButton` is the base action element. It renders a `<button>` by default, a router link when `to` is set, and an `<a>` with `tag="a"` and `href`. Every other button in this folder (`WButtonGroup`, `WButtonMore`, `WButtonCopy`, `WButtonSelection`…) builds on it.

## Basic usage

Put any content in the default slot. For icon-only buttons, set `tooltipText` — it is shown on hover and gives the button a readable hint.

<!-- @example Button/Basic -->

<DocsDemo name="Button/Basic" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton @click="count++">
      Clicked {{ count }} times
    </WButton>

    <WButton outline>
      Outline
    </WButton>

    <WButton tooltip-text="Add item">
      <IconAdd class="square-5" />
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'

const count = ref(0)
</script>
```

<!-- @example-end -->

## Semantic types

`semanticType` picks the color scheme. The classes behind each type are app-wide and can be swapped once at startup with `setSemanticTypeButtonBackgroundMap` from `eco-vue-js/dist/utils/SemanticType`.

<!-- @example Button/SemanticTypes -->

<DocsDemo name="Button/SemanticTypes" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton
      v-for="type in Object.values(SemanticType)"
      :key="type"
      :semantic-type="type"
    >
      {{ type }}
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
</script>
```

<!-- @example-end -->

## States

- `loading` hides the content behind a spinner but keeps the width, so the layout does not jump. Clicks are ignored.
- `disabled` and `skeleton` fall back to the state provided by a parent when not set. A form or list that is disabled or loading disables or skeletons every button inside it — only pass these props to override that.

<!-- @example Button/States -->

<DocsDemo name="Button/States" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton
      :loading="saving"
      @click="save"
    >
      Save
    </WButton>

    <WButton disabled>
      Disabled
    </WButton>

    <WButton skeleton>
      Skeleton
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const saving = ref(false)

const save = () => {
  saving.value = true

  setTimeout(() => saving.value = false, 1500)
}
</script>
```

<!-- @example-end -->

## Button group

`WButtonGroup` is a segmented control bound with `v-model`. `list` takes plain values; for objects, also pass `valueGetter` to pick the model value out of each item.

<!-- @example Button/Group -->

<DocsDemo name="Button/Group" />

```vue
<template>
  <WButtonGroup
    v-model="period"
    :list="periods"
    title="Period"
  />

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

<!-- @api WButton -->

### WButton

```ts
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `semanticType` | `SemanticType` | `SemanticType.PRIMARY` | Color scheme. Classes per type are app-wide and can be overridden with `setSemanticTypeButtonBackgroundMap`. |
| `disabled` | `boolean` | — | Blocks clicks and dims the button. When unset, inherits the disabled or readonly state provided by a parent. |
| `loading` | `boolean` | — | Replaces the content with a spinner and swallows clicks, keeping the button's width. |
| `tag` | `keyof HTMLElementTagNameMap` | `"button"` | Element to render when neither `to` nor `href` applies. |
| `type` | `string` | — | Native `type` attribute, e.g. `submit` inside a form. |
| `replace` | `boolean` | — | With `to`, replaces the current history entry instead of pushing a new one. |
| `href` | `string` | — | Link target when `tag` is `a`. |
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | — |
| `rel` | `string` | — | — |
| `join` | `boolean` | — | Squares off inner corners and borders so adjacent buttons read as one segmented control. |
| `tooltipText` | `string` | — | Shows a tooltip on hover — also the accessible hint for icon-only buttons. |
| `download` | `string` | — | Native `download` attribute, used with `tag="a"` and `href`. |
| `skeleton` | `boolean` | — | Renders a skeleton placeholder of the button's size. When unset, inherits the skeleton state provided by a parent. |
| `autofocus` | `boolean` | — | Focuses the button after mount and whenever it becomes enabled again. |
| `outline` | `boolean` | — | Border and text only, no background fill. |
| `borderComponent` | `VNode` | — | Custom decorative border layer, overriding the one registered for the `semanticType`. |
| `noBorderComponent` | `boolean` | — | Skips the decorative border layer. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(event: MouseEvent \| KeyboardEvent)` | — |
| `mousedown` | `(event: MouseEvent \| KeyboardEvent)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | — |

<!-- @api-end -->

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

::: details Inherited from `src/components/FieldWrapper/types.ts` (25)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | — | — |
| `tooltipText` | `string` | — | — |
| `skeleton` | `boolean` | — | — |
| `title` | `string` | — | — |
| `titleIcon` | `SVGComponent` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | — |
| `maxLength` | `number` | — | — |
| `mono` | `boolean` | — | — |
| `hasChanges` | `boolean` | — | — |
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
