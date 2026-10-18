---
group: Layout
description: WSection and WCard — the page's containers, shaped by the theme's layout style.
---

# Section and card

A page groups its content in two kinds of containers, and the theme decides how they look ([Layout styles](/guide/theming#layout-styles)):

- `WSection` is a page-level area: a list, a form, a settings group. In the flat style it paints nothing, and its content sits on the page as before. In the card and glass styles it is a rounded surface with padding.
- `WCard` is a block that shows in every style, such as a dashboard tile or a stat. On the page it is one step off the page background; inside a section or another card it is one step off that.

Both take a `title`, or a `title` slot, and an `actions` slot beside it. They don't set their own radius, padding or border: those come from the theme, so every container on the page matches. Content that paints the surface, such as sticky list columns and soft tones, follows the container it is in.

The same look without the component is the `surface-section` and `surface-card` classes. A list that scrolls with the page is a section of its own: put it on the page, not inside a `WSection`.

<!-- @example Surface/Basic -->

<DocsDemo name="Surface/Basic" />

```vue
<template>
  <div class="grid gap-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <WCard
        v-for="stat in STATS"
        :key="stat.title"
        :title="stat.title"
      >
        <span class="text-accent text-2xl font-semibold tabular-nums">{{ stat.value }}</span>
      </WCard>
    </div>

    <WSection title="Beds">
      <template #actions>
        <WButton :semantic-type="SemanticType.SECONDARY">
          Add bed
        </WButton>
      </template>

      <p class="text-description">
        Each bed groups the plants that share its soil and watering.
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        <WCard title="North bed">
          <span class="text-description text-sm">12 plants, watered daily</span>
        </WCard>

        <WCard title="South bed">
          <span class="text-description text-sm">8 plants, watered every other day</span>
        </WCard>
      </div>
    </WSection>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WCard from 'eco-vue-js/dist/components/Surface/WCard.vue'
import WSection from 'eco-vue-js/dist/components/Surface/WSection.vue'

const STATS = [
  {title: 'Plants', value: 128},
  {title: 'Need water', value: 9},
  {title: 'Beds', value: 6},
]
</script>
```

<!-- @example-end -->

## API

<!-- @api WSection -->

### WSection

```ts
import WSection from 'eco-vue-js/dist/components/Surface/WSection.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Heading of the section. The `title` slot replaces it. |
| `tag` | `string` | `"section"` | Element to render. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the section. |
| `title` | — | Heading of the section, in place of `title`. |
| `actions` | — | Buttons beside the heading. |

<!-- @api-end -->

<!-- @api WCard -->

### WCard

```ts
import WCard from 'eco-vue-js/dist/components/Surface/WCard.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Heading of the card. The `title` slot replaces it. |
| `tag` | `string` | `"div"` | Element to render. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the card. |
| `title` | — | Heading of the card, in place of `title`. |
| `actions` | — | Buttons beside the heading. |

<!-- @api-end -->
