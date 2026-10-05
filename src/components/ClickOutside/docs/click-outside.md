---
group: Utilities
description: WClickOutside — emits click on a click or right-click anywhere outside it, to close or finish what's inside.
---

# Click outside

`WClickOutside` wraps content in a `div` and emits `click` on a click or right-click anywhere outside it — to close a custom dropdown, or to finish editing in place. The click that mounted it doesn't count, so it can wrap content that a click just opened. `noFilter` emits on clicks inside too.

[WDropdownMenu](/components/dropdown-menu#custom-dropdown) leaves its state to the parent, which usually closes it with a `WClickOutside` around the content.

<!-- @example ClickOutside/Basic -->

<DocsDemo name="ClickOutside/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-4">
    <WClickOutside
      class="rounded-xl border border-solid p-4 transition-colors"
      :class="active ? 'tone-primary border-tone' : 'border-line-subtle'"
      @click="clickOutside"
    >
      <button
        class="w-full cursor-pointer text-left"
        @click="active = true"
      >
        {{ active ? 'Editing — click anywhere else to finish' : 'Click to edit' }}
      </button>
    </WClickOutside>

    <span class="text-description text-sm">Clicks outside the card: {{ count }}</span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WClickOutside from 'eco-vue-js/dist/components/ClickOutside/WClickOutside.vue'

const active = ref(false)
const count = ref(0)

const clickOutside = () => {
  active.value = false
  count.value++
}
</script>
```

<!-- @example-end -->

## API

<!-- @api WClickOutside -->

### WClickOutside

```ts
import WClickOutside from 'eco-vue-js/dist/components/ClickOutside/WClickOutside.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `noFilter` | `boolean` | — | Emits `click` on clicks inside the element too. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(event: Event)` | A click or right-click outside the element. Clicks in the same tick as mounting, such as the one that opened it, are ignored. |
| `mouseenter` | `(value: MouseEvent)` | The pointer entered the element. |
| `mouseleave` | `(value: MouseEvent)` | The pointer left the element. |
| `mousedown` | `(value: MouseEvent)` | A mouse button was pressed on the element. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content that clicks count as inside of, such as a dropdown's content. |

<!-- @api-end -->
