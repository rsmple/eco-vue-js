---
group: Actions
description: WButton — the base action element with semantic colors, loading and disabled states, links and tooltips.
---

# Button

`WButton` is the base action element. It renders a `<button>` by default, a router link when `to` is set, and an `<a>` with `tag="a"` and `href`. Every other button in this folder (`WButtonMore`, `WButtonCopy`, `WButtonSelection`…) builds on it. For picking one value out of a few, see [Button group](./button-group).

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
