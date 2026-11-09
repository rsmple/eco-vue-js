---
group: Actions
description: WButton — the base action element with semantic colors, loading and disabled states, links and tooltips — plus WButtonCopy and WButtonInput.
---

# Button

`WButton` is the base action element: a `<button>`, a router link with `to`, or an `<a>` with `tag="a"` and `href`. Other buttons here (`WButtonMore`, `WButtonCopy`, `WButtonSelection`…) build on it. For picking one of a few values, see [Button group](./button-group).

## Basic usage

Any content goes in the default slot. Give icon-only buttons a `tooltipText`.

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

`semanticType` picks the color scheme. Its classes are app-wide; swap them once at startup with `setSemanticTypeButtonBackgroundMap` from `eco-vue-js/dist/utils/SemanticType`.

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

- `loading` shows a spinner, keeps the width and ignores clicks.
- `disabled` and `skeleton` fall back to a parent's provided state, so a disabled or loading form or list covers its buttons — pass them only to override.

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

## Small buttons

`WButtonCopy` copies `value`; the icon briefly turns into a check. It takes one line of surrounding text so it fits inline; `noInline` makes it a block.

`WButtonInput` is a square icon button matching an input's height (`--w-input-height`), border and corners, for beside an input or its `right` slot. `tooltipText` labels it, `loading` shows a spinner, `to` makes it a link.

<!-- @example Button/SmallButtons -->

<DocsDemo name="Button/SmallButtons" />

```vue
<template>
  <div class="grid gap-6">
    <div class="flex items-center gap-2">
      <code class="rounded-lg bg-surface-muted px-2 py-1">{{ token }}</code>

      <WButtonCopy :value="token" />
    </div>

    <div class="flex max-w-md items-center gap-2">
      <WInput
        v-model="search"
        placeholder="Sensor"
        class="flex-1"
        no-margin
      />

      <WButtonInput
        :icon="markRaw(IconRefresh)"
        tooltip-text="Sync sensors"
        :loading="syncing"
        @click="sync"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WButtonCopy from 'eco-vue-js/dist/components/Button/WButtonCopy.vue'
import WButtonInput from 'eco-vue-js/dist/components/Button/WButtonInput.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

import IconRefresh from 'eco-vue-js/dist/assets/icons/IconRefresh'

const token = 'gh2_4f9c2e1a7b'
const search = ref<string>()
const syncing = ref(false)

const sync = () => {
  syncing.value = true
  setTimeout(() => syncing.value = false, 1500)
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
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | Native `target` of the link, with `href` or `to`. |
| `rel` | `string` | — | Native `rel` of the link, with `href` or `to`. |
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
| `click` | `(event: MouseEvent \| KeyboardEvent)` | Click or Enter. Not emitted while disabled or `loading`. |
| `mousedown` | `(event: MouseEvent)` | Mouse down. Not emitted while disabled or `loading`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Button content. |

<!-- @api-end -->

<!-- @api WButtonCopy -->

### WButtonCopy

```ts
import WButtonCopy from 'eco-vue-js/dist/components/Button/WButtonCopy.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | **required** | Text copied to the clipboard on click. |
| `noInline` | `boolean` | — | Lays the button out as a regular block instead of sizing it to one line of the surrounding text. |

<!-- @api-end -->

<!-- @api WButtonInput -->

### WButtonInput

```ts
import WButtonInput from 'eco-vue-js/dist/components/Button/WButtonInput.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | **required** | Icon of the button. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |
| `tooltipText` | `string` | — | Tooltip text, which also names the button. |
| `loading` | `boolean` | — | Shows a spinner instead of the icon and ignores clicks. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the button. |
| `disabled` | `boolean` | — | Grays the button out and ignores clicks. |
| `active` | `boolean` | — | Highlights the button, such as while the menu it opens is shown. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The button was clicked, unless it is disabled or loading. |

<!-- @api-end -->
