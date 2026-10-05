---
group: Utilities
description: WEmptyComponent — renders its slot without an element, as the "off" branch of an optional wrapper.
---

# Empty component

`WEmptyComponent` renders its default slot and nothing else — no element, no attributes. It is the "off" branch of an optional wrapper, so the content is written once:

```vue
<component :is="scroll ? WTextOverflow : WEmptyComponent">
  <span>{{ name }}</span>
</component>
```

The kit uses it this way for tab titles that scroll on overflow, and for `WNumberFormatter` without a `tag`.

<!-- @example EmptyComponent/Basic -->

<DocsDemo name="EmptyComponent/Basic" />

```vue
<template>
  <div class="grid max-w-60 gap-4">
    <WToggle
      v-model="scroll"
      title="Scroll long names on hover"
    />

    <div class="grid gap-2">
      <div
        v-for="name in names"
        :key="name"
        class="group/overflow grid rounded-lg bg-surface-muted px-3 py-2"
      >
        <component :is="scroll ? WTextOverflow : WEmptyComponent">
          <span
            class="whitespace-nowrap"
            :class="{truncate: !scroll}"
          >{{ name }}</span>
        </component>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WEmptyComponent from 'eco-vue-js/dist/components/EmptyComponent/WEmptyComponent.vue'
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const names = [
  'Basil',
  'Monstera deliciosa \'Thai Constellation\'',
  'Ficus lyrata, fiddle-leaf fig from the north greenhouse',
]

const scroll = ref(true)
</script>
```

<!-- @example-end -->

## API

<!-- @api WEmptyComponent -->

### WEmptyComponent

```ts
import WEmptyComponent from 'eco-vue-js/dist/components/EmptyComponent/WEmptyComponent.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ [key: string]: never; }` | Content rendered without a wrapping element. It gets no slot props. |

<!-- @api-end -->
