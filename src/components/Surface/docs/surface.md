---
group: Layout
description: WSection and WCard — the page's containers, shaped by the theme's layout style.
---

# Section and card

A page groups its content in two kinds of containers, and the theme decides how they look ([Layout styles](/guide/theming#layout-styles)):

- `WSection` is a page-level area: a list, a form, a settings group. In the flat style it paints nothing, and its content sits on the page as before. In the card and glass styles it is a rounded surface with padding.
- `WCard` is a block that shows in every style, such as a dashboard tile or a stat. On the page it is one step off the page background; inside a section or another card it is one step off that.

Both take a `title`, or a `title` slot, and an `actions` slot beside it. A section also takes an `eyebrow`, a short line above its heading such as a step number, and a `footer` slot for buttons under its content, past a line. On the page in flat, where the line between sections marks where one ends, the footer has no line of its own, only the space above it. They don't set their own radius, padding or border: those come from the theme, so every container on the page matches. Content that paints the surface, such as sticky list columns and soft tones, follows the container it is in.

With a `semanticType` a section is in that tone: its soft paint in every layout style, flat included, and its heading in the tone. For a danger zone, `NEGATIVE`, a block of its own that reads apart from the page, in place of an info card in a section.

The same look without the component is the `surface-section` and `surface-card` classes. A list that scrolls with the page is a section of its own: put it on the page, not inside a `WSection`.

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

An action that can't be undone, or that costs something later, gets a section of its own: a `title`, a `description` saying what goes and what stays or what to expect after, and the button in the `footer`, at the section's end, where a form's Save is. Put the button in the `footer`, not in the content, where it would stretch across the section. Give the section `NEGATIVE` when something is lost for good; a plain section when the action only costs time, such as clearing a cache.

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

A long page splits into several sections, one per topic. On the page (`w-page`) put them one after another, with no wrapper: the kit spaces them through any wrappers of the page. In card and glass the theme's section gap (`--w-section-gap`) goes between them, so they show as separate surfaces. In flat, where they paint nothing, a line goes between two sections, `--w-stack-divide` (`2rem`) below and above it, and other blocks, such as a page list, are as far apart without the line. A section in a tone paints its own edge and gets the space without the line. See [Settings page](/recipes/settings-page).

Off the page, such as in a preview, put the sections in `surface-stack-divided` for the same. `surface-stack` runs them together in flat instead: `0` apart, their content's margins carrying on across them, so the page looks the same as without the split. These docs are built this way: each page is a stack of sections, one per heading and one per example.

```vue
<template>
  <div class="surface-stack">
    <WSection title="Watering" />

    <WSection title="Light" />
  </div>
</template>
```

## A section that scrolls inside

A section with a height of its own, such as a column stuck beside a list, takes `scroll`: its content scrolls inside it, down to its bottom edge, while its heading and the `head` slot stay. Put what should stay in view in `head`, such as the item a list belongs to, not in a sticky block with a background: in glass the section's fill is the blurred page behind it, and an opaque block over the content shows as a strip of another color. Give the section its height, such as `max-h-*` or `h-full`; the section sets its own overflow.

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

Sections don't nest. A section inside another one paints nothing and takes no padding: it is a part of the outer section. A `WSection` there gets a smaller heading, one level down, and a part that follows other content gets a line above it, `--w-subsection-divide` (`1rem`) over its content. Cards do nest: a card in a section or in another card is filled and flat, one step darker than what it sits on. In a glass section it is a pane of glass over it instead, as a list card there: a light translucent fill the section shows through, with a hairline edge and a lit top edge.

A preview of a page inside a container, such as a layout picker or a demo, is a page of its own: mark its box `surface-root`, and the sections and cards in it render as on a page, not nested in the container around it. It also keeps sections inside the box, not reaching into the page gutter. The box is a well of the page's own background, the theme's gradient included, with a line around it in every layout style, so it reads apart from the page it sits on.

| Class | What it does |
| --- | --- |
| `surface-section` | A section; inside another section, nothing. |
| `surface-card` | A card; inside a section or a card, one step darker. |
| `surface-stack` | Sections one after another, `--w-section-gap` apart: run together in flat. |
| `surface-stack-divided` | The same, with a line between the sections in flat, as the page sets its blocks. |
| `surface-root` | A page of its own in a well of the page background: nesting starts over inside it. |

## On the page

The app's main area is `w-page`, and the kit places the sections on it: on phones a section spans the screen with its content at the page inset, beside a list wider than the screen it stays in view, and under the last one the main area leaves room. Pages set no padding or positioning of their own. The rules for a whole page are in [Page layout](/recipes/page-layout).

| Class | What it does |
| --- | --- |
| `w-page` | The app's main area: the page's inset at every width, the room under it, and content beside a wide list kept in view. |
| `w-page-bleed` | A row of cards on the canvas, reaching into the gutter as a section does. |
| `surface-columns` | Sections side by side on a grid, spaced for the layout style. |
| `w-page-column` | The page's first column, for a page list beside other content: the list's section, header and bottom edge keep to the column. |

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
