---
group: Controls
order: 3
description: WToggle — an on/off switch bound with v-model, with title, description, small and right-label layouts — and WToggleTheme for the light or dark theme.
---

# Toggle

`WToggle` is a switch for a `boolean` model. The title sits on the left and the switch on the right, so a column of toggles lines up; `rightLabel` puts the title after the switch instead.

<!-- @example Toggle/Basic -->

<DocsDemo name="Toggle/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-2">
    <WToggle
      v-model="notify"
      title="Email notifications"
      description="A digest once a day."
    />

    <WToggle
      v-model="compact"
      title="Compact rows"
      right-label
      small
    />

    <WToggle
      :model-value="true"
      title="Disabled"
      disabled
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const notify = ref(true)
const compact = ref(false)
</script>
```

<!-- @example-end -->

`validate` checks the new value before it is emitted: when it returns an error, the change is dropped and the error is shown as a warning notification. `negate` flips the switch so it shows `true` as off, for settings phrased the other way round.

## Theme toggle

`WToggleTheme` is a toggle for the app's light or dark theme: on with a sun for `Theme.LIGHT`, off with a moon for `Theme.DARK`. It only switches the `Theme` value — applying it, usually as a `dark` class on `<html>`, and remembering it is up to the app. See [App shell](/guide/app-shell#layout-component) and [Theming](/guide/theming).

<!-- @example Toggle/Theme -->

<DocsDemo name="Toggle/Theme" />

```vue
<template>
  <div class="grid max-w-md gap-2">
    <WToggleTheme
      v-model="theme"
      title="Theme"
    />

    <span class="text-description text-sm">
      Picked: {{ theme }} — this demo only keeps the value; the header's toggle applies it to the site.
    </span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {Theme} from 'eco-vue-js/dist/utils/utils'

import WToggleTheme from 'eco-vue-js/dist/components/Toggle/WToggleTheme.vue'

const theme = ref(Theme.LIGHT)
</script>
```

<!-- @example-end -->

## API

<!-- @api WToggle -->

### WToggle

```ts
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Value` | **required** | Switch state. `null` puts the caret in the middle, the mixed state used with `intermediate`. |
| `title` | `string` | — | Label next to the switch; the `title` slot replaces it. |
| `icon` | `SVGComponent` | — | Icon drawn inside the caret. Hidden while `loading`. |
| `small` | `boolean` | — | Smaller title text. |
| `disabled` | `boolean` | — | Blocks changes and dims the toggle. When unset, inherits the disabled state provided by a parent. |
| `loading` | `boolean` | — | Shows a spinner in the caret and ignores clicks. |
| `readonly` | `boolean` | — | Shows the state without allowing changes, and keeps the title selectable. When unset, inherits the readonly state provided by a parent. |
| `rightLabel` | `boolean` | — | Puts the title after the switch instead of before it. |
| `noMargin` | `boolean` | — | Drops the default vertical margin around the toggle. |
| `description` | `string` | — | Secondary text under the toggle. |
| `intermediate` | `boolean` | `false` | Cycles through three states on click — `true`, `false`, then `null` — instead of two. |
| `negate` | `boolean` | — | Inverts the display: a `true` model shows the switch as off, and turning it on emits `false`. |
| `validate` | `ValidateFn \| ValidateFn[]` | — | Checks the new value before it is emitted. A returned error message cancels the change and is shown as a warning notification. |
| `center` | `boolean` | — | Centers the switch in its row. |
| `skeleton` | `boolean` | — | Renders a skeleton placeholder. When unset, inherits the skeleton state provided by a parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(Value)` | The new state, after `negate` is applied and `validate` passes. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |

<!-- @api-end -->

<!-- @api WToggleTheme -->

### WToggleTheme

```ts
import WToggleTheme from 'eco-vue-js/dist/components/Toggle/WToggleTheme.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Theme` | **required** | Current theme: the toggle is on, with a sun, for `Theme.LIGHT`, and off, with a moon, for `Theme.DARK`. |
| `title` | `string` | — | Label next to the switch; the `title` slot replaces it. |
| `small` | `boolean` | — | Smaller title text. |
| `disabled` | `boolean` | — | Blocks changes and dims the toggle. When unset, inherits the disabled state provided by a parent. |
| `loading` | `boolean` | — | Shows a spinner in the caret and ignores clicks. |
| `readonly` | `boolean` | — | Shows the state without allowing changes, and keeps the title selectable. When unset, inherits the readonly state provided by a parent. |
| `rightLabel` | `boolean` | — | Puts the title after the switch instead of before it. |
| `noMargin` | `boolean` | — | Drops the default vertical margin around the toggle. |
| `description` | `string` | — | Secondary text under the toggle. |
| `validate` | `ValidateFn \| ValidateFn[]` | — | Checks the new value before it is emitted. A returned error message cancels the change and is shown as a warning notification. |
| `center` | `boolean` | — | Centers the switch in its row. |
| `skeleton` | `boolean` | — | Renders a skeleton placeholder. When unset, inherits the skeleton state provided by a parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: Theme)` | The picked theme. |

<!-- @api-end -->
