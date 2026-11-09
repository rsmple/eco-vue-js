---
group: Layout
description: WSection and WCard — the page's containers, shaped by the theme's layout style.
---

# Section and card

Two containers, styled by the theme's [layout style](/guide/theming#layout-styles):

- `WSection` — a page-level area: a list, a form, a settings group. Paints nothing in flat; a rounded padded surface in card and glass.
- `WCard` — a block shown in every style, like a tile or a stat; one step off whatever it sits on.

Both take a `title` (prop or slot) and an `actions` slot beside it. A section also takes an `eyebrow` (a short line above the heading, e.g. a step number) and a `footer` slot for buttons below a line; in flat on the page, the footer gets only space, not a line. Radius, padding and border come from the theme, so containers match. Surface-painting content (sticky list columns, soft tones) follows its container.

`semanticType` tints a section in that tone in every style, heading included. Use `NEGATIVE` for a danger zone instead of an info card in a section.

Without the component, use the `surface-section` and `surface-card` classes. A window-scrolling list is its own section — put it on the page, not in a `WSection`.

<!-- @example Surface/Basic page -->

<DocsDemo name="Surface/Basic" page />

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

## Danger zone

Irreversible or costly actions get their own section: a `title`, a `description` of what goes, what stays or what to expect, and the button in `footer` (where a form's Save goes — in the content it would stretch). Use `NEGATIVE` for permanent loss; a plain section for actions that only cost time, like clearing a cache.

<!-- @example Surface/DangerZone -->

<DocsDemo name="Surface/DangerZone" />

```vue
<template>
  <WSection
    title="Danger zone"
    description="The garden, its beds and their watering plans are deleted for good. Photos you exported stay on your device."
    :semantic-type="SemanticType.NEGATIVE"
  >
    <template #footer>
      <WButton :semantic-type="SemanticType.NEGATIVE">
        <IconTrash /> Delete garden
      </WButton>
    </template>
  </WSection>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WSection from 'eco-vue-js/dist/components/Surface/WSection.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'
</script>
```

<!-- @example-end -->

## Sections in a row

Split long pages into one section per topic, placed directly on the page (`w-page`) with no wrapper — the kit spaces them. Card and glass put `--w-section-gap` between them; flat draws a line with `--w-stack-divide` (`2rem`) above and below, and spaces other blocks the same without the line. Toned sections paint their own edge and skip the line. See [Settings page](/recipes/settings-page).

Off the page (e.g. a preview), use `surface-stack-divided` for the same. `surface-stack` runs them together in flat — no gap, so it looks unsplit. These docs work this way: one section per heading and per example.

```vue
<template>
  <div class="surface-stack">
    <WSection title="Watering" />

    <WSection title="Light" />
  </div>
</template>
```

## A section that scrolls inside

A section with its own height (e.g. a column beside a list) takes `scroll`: content scrolls inside, while the heading and `head` slot stay. Put what should stay in view in `head`, not a sticky opaque block — in glass that shows as a strip of another color. Give the section a height (`max-h-*`, `h-full`); it sets its own overflow.

```vue
<template>
  <WSection
    scroll
    class="sticky top-(--w-header-inner) max-h-[calc(100vh-var(--w-header-inner)-var(--w-chrome-gap))]"
  >
    <template #head>
      <PlantCard :plant="plant" />
    </template>

    <WateringLog :plant-id="plant.id" />
  </WSection>
</template>
```

## Nesting

Sections don't nest: an inner section paints nothing and has no padding — it's a part of the outer one, with a smaller heading and, after other content, a line above (`--w-subsection-divide`, `1rem`). Cards nest: inside a section or card they're filled and flat, one step darker; in a glass section, a translucent pane with a hairline and lit top edge.

A page preview inside a container (layout picker, demo) is its own page: mark its box `surface-root` so nesting starts over and sections don't reach into the page gutter. The box is a well of the page background (gradient included) with an outline.

| Class | What it does |
| --- | --- |
| `surface-section` | A section; inside another section, nothing. |
| `surface-card` | A card; inside a section or a card, one step darker. |
| `surface-stack` | Sections `--w-section-gap` apart; run together in flat. |
| `surface-stack-divided` | The same, with lines between sections in flat. |
| `surface-root` | A page of its own in a well; nesting starts over inside. |

## On the page

The main area is `w-page`; the kit places sections on it: full-width on phones, kept in view beside wide lists, with room after the last. Pages set no padding or positioning. See [Page layout](/recipes/page-layout).

| Class | What it does |
| --- | --- |
| `w-page` | The app's main area: page inset, end room, content kept in view beside wide lists. |
| `w-page-bleed` | A row of cards on the canvas, reaching into the gutter like a section. |
| `surface-columns` | Side-by-side sections on a grid, spaced per layout style. |
| `w-page-column` | First column holding a page list beside other content; keeps the list's section, header and bottom edge in the column. |

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
| `eyebrow` | `string` | — | A short line above the heading, such as a step number. |
| `description` | `string` | — | A line under the heading on what the section is for, such as what a danger zone's action deletes and what stays, with its button in the `footer`. |
| `tag` | `string` | `"section"` | Element to render. |
| `semanticType` | `SemanticType` | — | Paints the section in the type's soft tone in every layout style, and its heading in the tone, such as a danger zone with `NEGATIVE`. `SECONDARY` is a plain section. |
| `scroll` | `boolean` | — | Keeps to the height the page gives it, such as a column stuck beside a list, and scrolls its content inside, under the heading and the `head` slot, which stay. The content scrolls to the section's bottom edge: nothing sticky has to repaint the section over it, so it looks the same in every layout style. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the section. |
| `title` | — | Heading of the section, in place of `title`. |
| `description` | — | Line under the heading, in place of `description`. |
| `actions` | — | Buttons beside the heading. |
| `head` | — | Content under the heading, before the content: with `scroll` it stays in view while the content scrolls, such as the item a list in the section belongs to, or a label of its own in place of the heading. |
| `footer` | — | Buttons under the content, such as Save: past a line, or on the page in flat, past a space. |

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
