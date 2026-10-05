---
group: Display
description: WExpansion and WExpansionItem — content that expands and collapses with an animated height, and a toggle row with a title for accordions.
---

# Expansion

`WExpansion` expands and collapses its content with `isOpen`, animating its height. Collapsed content is kept alive, so a form inside keeps what was typed. `isShown` hides it at once instead, without the animation.

`WExpansionItem` adds a toggle row with a title and an arrow. It doesn't open itself: it emits `toggle` and takes `isOpen`, so the page decides — e.g. one item open at a time, as below. `hasFlag` puts a dot after the title. The row spans the content's inner margin (`--inner-margin`), like list rows.

<!-- @example Expansion/Basic -->

<DocsDemo name="Expansion/Basic" />

```vue
<template>
  <div class="grid gap-8">
    <div class="rounded-xl border border-solid border-line-subtle [--inner-margin:1rem]">
      <WExpansionItem
        v-for="(item, index) in sections"
        :key="item.title"
        :title="item.title"
        :is-open="open === index"
        :has-flag="item.flag"
        @toggle="open = open === index ? null : index"
      >
        <p class="text-description px-4 pb-4">
          {{ item.text }}
        </p>
      </WExpansionItem>
    </div>

    <div class="grid gap-2">
      <WToggle
        v-model="details"
        title="Show details"
      />

      <WExpansion :is-open="details">
        <div class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 rounded-xl bg-surface-muted p-4">
          <span class="text-description">Sown</span>
          <span>March 12</span>

          <span class="text-description">Sprouted</span>
          <span>March 20</span>
        </div>
      </WExpansion>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WExpansion from 'eco-vue-js/dist/components/Expansion/WExpansion.vue'
import WExpansionItem from 'eco-vue-js/dist/components/Expansion/WExpansionItem.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const sections = [
  {title: 'When should I repot?', text: 'When roots grow out of the drainage holes — usually every year or two, in spring.'},
  {title: 'Which soil is best?', text: 'A light, well-draining mix: add bark for aroids and grit for succulents.'},
  {title: 'What changed this month?', text: 'The days are getting shorter, so move sun lovers closer to the window.', flag: true},
]

const open = ref<number | null>(0)
const details = ref(false)
</script>
```

<!-- @example-end -->

## API

<!-- @api WExpansion -->

### WExpansion

```ts
import WExpansion from 'eco-vue-js/dist/components/Expansion/WExpansion.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | `true` | Expands the content, animating its height. Collapsed content stays alive, keeping its state. |
| `isShown` | `boolean` | `true` | Shows the content. `false` hides it at once, without the animation. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:visible` | `(value: boolean)` | `true` as the content starts to expand, `false` once it has collapsed. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content that expands and collapses. |

<!-- @api-end -->

<!-- @api WExpansionItem -->

### WExpansionItem

```ts
import WExpansionItem from 'eco-vue-js/dist/components/Expansion/WExpansionItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | — | Expands the content. The item doesn't toggle itself: set it on `toggle`. |
| `title` | `string` | — | Text of the toggle row. |
| `icon` | `SVGComponent` | — | Icon before the title. |
| `hasFlag` | `boolean` | — | Shows a dot after the title, e.g. for new content inside. |
| `minTitle` | `boolean` | — | Smaller title text. |
| `toggleClass` | `string` | — | Class of the toggle row. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `toggle` | — | The toggle row was clicked, or Enter or Space was pressed on it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content that expands under the toggle row. The component's class goes on it. |
| `title` | — | An empty element that the toggle row renders as instead of a `div`, e.g. `<h3 />` for a heading. |

<!-- @api-end -->
