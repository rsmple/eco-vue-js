---
group: Data
description: WInfoCard and WInfoCardNegative notes, WExpansion and WExpansionItem for content that expands, WNumberFormatter for numbers and percentages, WTextOverflow for one line that scrolls on hover, and WImageViewer for an image thumbnail.
---

# Content blocks

Small blocks for the content of a page, around the controls and lists.

## Info cards

`WInfoCard` is a note with an icon, in the color of its `semanticType`: gray by default, with an info icon, or an exclamation mark for `WARNING` and `NEGATIVE`. `icon` sets another icon, `noIcon` hides it, and `noBg` drops the background for a note inside other content. The `top` and `bottom` slots go above and under the text, e.g. for actions. On phones the card spans the screen edge to edge.

`WInfoCardNegative` is a gray card with a warning icon, a `title` and a description, for an error or an empty state that explains what to do.

<!-- @example InfoCard/Basic -->

<DocsDemo name="InfoCard/Basic" />

```vue
<template>
  <div class="grid gap-4">
    <WInfoCard>
      Plants are grouped by the bed they grow in. Open a bed to see its plants.
    </WInfoCard>

    <WInfoCard :semantic-type="SemanticType.WARNING">
      The moisture sensors haven't reported for 3 days — readings may be out of date.

      <template #bottom>
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          class="mt-4"
        >
          Check now
        </WButton>
      </template>
    </WInfoCard>

    <WInfoCard
      :semantic-type="SemanticType.POSITIVE"
      :icon="markRaw(IconCheckCircle)"
    >
      All plants are watered.
    </WInfoCard>

    <WInfoCard
      :semantic-type="SemanticType.INFO"
      no-bg
    >
      Without a background, for a note inside other content.
    </WInfoCard>

    <WInfoCardNegative title="The greenhouse sensor can't be reached">
      Check its battery and that it is still in range of the Wi-Fi.
    </WInfoCardNegative>
  </div>
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
import WInfoCardNegative from 'eco-vue-js/dist/components/InfoCard/WInfoCardNegative.vue'

import IconCheckCircle from 'eco-vue-js/dist/assets/icons/IconCheckCircle'
</script>
```

<!-- @example-end -->

## Expansion

`WExpansion` expands and collapses its content with `isOpen`, animating its height. Collapsed content is kept alive, so a form inside keeps what was typed. `isShown` hides it at once instead, without the animation.

`WExpansionItem` adds a toggle row with a title and an arrow. It doesn't open itself: it emits `toggle` and takes `isOpen`, so the page decides — e.g. one item open at a time, as below. `hasFlag` puts a dot after the title. The row spans the content's inner margin (`--inner-margin`), like list rows.

`WNumberFormatter` shows a number with thousands separators, or a fraction as a percentage with `percent`. `compact` shortens it, 12840 to 13K, with the full number in a tooltip. `WTextOverflow` shows one line cut at its width, and scrolls the rest into view on hover — or on hover of a parent with the `group/overflow` class, such as a list row.

`WImageViewer` shows an image URL as a thumbnail with its file name, under an optional `title`; a click opens the full image in a modal.

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
          <span class="text-description">Seeds sown</span>
          <WNumberFormatter
            :model-value="12840"
            tag="span"
            compact
          />

          <span class="text-description">Sprouted</span>
          <WNumberFormatter
            :model-value="0.4375"
            tag="span"
            percent
          />
        </div>
      </WExpansion>
    </div>

    <div class="grid max-w-60 gap-1">
      <span class="text-description text-sm">Hover the name:</span>

      <WTextOverflow>
        <span class="whitespace-nowrap font-semibold">Monstera deliciosa 'Thai Constellation', half-moon variegation</span>
      </WTextOverflow>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WExpansion from 'eco-vue-js/dist/components/Expansion/WExpansion.vue'
import WExpansionItem from 'eco-vue-js/dist/components/Expansion/WExpansionItem.vue'
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
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

<!-- @api WInfoCard -->

### WInfoCard

```ts
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `noBg` | `boolean` | — | Drops the colored background, leaving the icon and text. |
| `noIcon` | `boolean` | — | Hides the icon. |
| `icon` | `SVGComponent` | — | Icon before the text. Defaults to an info icon, or an exclamation mark for `WARNING` and `NEGATIVE`. |
| `semanticType` | `SemanticType` | — | Color scheme of the background and icon. Defaults to `SECONDARY`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Text of the card, next to the icon. |
| `top` | — | Content above the icon and text. |
| `bottom` | — | Content under the icon and text, such as actions. |

<!-- @api-end -->

<!-- @api WInfoCardNegative -->

### WInfoCardNegative

```ts
import WInfoCardNegative from 'eco-vue-js/dist/components/InfoCard/WInfoCardNegative.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | **required** | Heading of the card, after a warning icon. |
| `semanticType` | `SemanticType` | — | Color of the icon. Defaults to `NEGATIVE`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Description under the title. |

<!-- @api-end -->

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

<!-- @api WNumberFormatter -->

### WNumberFormatter

```ts
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `number` | **required** | Number to show. With `percent`, a fraction: 0.25 is 25%. |
| `percent` | `boolean` | — | Formats the number as a percentage. |
| `compact` | `boolean` | — | Formats the number in compact notation, 1.2K for 1234, with the full number in a tooltip. |
| `tag` | `string` | — | Element to wrap the number in. Without it the number is plain text, and the tooltip attaches to the parent element. |
| `noTouch` | `boolean` | — | Skips the tooltip on touch devices. |

<!-- @api-end -->

<!-- @api WTextOverflow -->

### WTextOverflow

```ts
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | One line of text. When it is wider than the component, hovering scrolls it to its end. |

<!-- @api-end -->

<!-- @api WImageViewer -->

### WImageViewer

```ts
import WImageViewer from 'eco-vue-js/dist/components/ImageViewer/WImageViewer.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string` | — | URL of the image. Clicking the thumbnail opens it full size in a modal. Without it, a placeholder is shown. |
| `title` | `string` | — | Label above the thumbnail. |
| `skeleton` | `boolean` | — | Shows placeholders for the title and the thumbnail. |

<!-- @api-end -->
