---
group: Controls
order: 3
description: WToggle — an on/off switch bound with v-model, with title, description, small and right-label layouts.
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

## API

<!-- @api WToggle -->

### WToggle

```ts
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Value` | **required** | — |
| `title` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `small` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `readonly` | `boolean` | — | — |
| `rightLabel` | `boolean` | — | — |
| `noMargin` | `boolean` | — | — |
| `description` | `string` | — | — |
| `intermediate` | `boolean` | `false as unknown as undefined` | — |
| `negate` | `boolean` | — | — |
| `validate` | `ValidateFn \| ValidateFn[]` | — | — |
| `center` | `boolean` | — | — |
| `mandatory` | `boolean` | — | — |
| `skeleton` | `boolean` | — | — |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(Value)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | — |

<!-- @api-end -->
