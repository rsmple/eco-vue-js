---
group: Display
description: WInfoCard and WInfoCardNegative — notes with an icon in the color of their semantic type, and a card for an error or an empty state.
---

# Info card

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
