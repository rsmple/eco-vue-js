---
group: Display
description: WSkeleton — a shimmering placeholder for content that is still loading, shaped with the w-skeleton-* utilities.
---

# Skeleton

`WSkeleton` is a shimmering placeholder for content that is still loading. It is one line of text tall and a random width between 40% and 80%, so a column of them doesn't look like a grid. Utilities from the kit's Tailwind base set its shape:

- `w-skeleton-w-*` and `w-skeleton-h-*` — width and height, e.g. `w-skeleton-h-12` for an avatar.
- `w-skeleton-rounded-*` — corner radius.
- `w-skeleton-static` — stops the shimmer, on the skeleton or any parent.

Controls, chips and list fields have a `skeleton` prop that renders their own skeleton. A form or an area can set it for everything inside at once — see [Conventions](/guide/conventions) and [Component states](/utilities/composables#component-states).

<!-- @example Skeleton/Basic -->

<DocsDemo name="Skeleton/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-4">
    <WToggle
      v-model="loading"
      title="Loading"
    />

    <div class="flex items-center gap-4 rounded-xl border border-solid border-line-subtle p-4">
      <WSkeleton
        v-if="loading"
        class="w-skeleton-w-12 w-skeleton-h-12 w-skeleton-rounded-full shrink-0"
      />

      <div
        v-else
        class="tone-primary surface-fill flex square-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
      >
        CL
      </div>

      <div class="grid flex-1">
        <WSkeleton v-if="loading" />

        <span
          v-else
          class="font-semibold"
        >
          Carl Linnaeus
        </span>

        <WSkeleton v-if="loading" />

        <span
          v-else
          class="text-description"
        >
          Herb bed, greenhouse, orchard
        </span>
      </div>

      <WChip
        text="Gardener"
        :skeleton="loading"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const loading = ref(true)
</script>
```

<!-- @example-end -->

## API

<!-- @api WSkeleton -->

### WSkeleton

```ts
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content inside the placeholder. With `w-skeleton-w-max` and hidden with `opacity-0`, it sizes the skeleton to the content it stands for. |

<!-- @api-end -->
