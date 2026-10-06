---
group: Overlays
description: WBottomSheet and WDismissable — the phone version of a dropdown, a sheet that slides up from the bottom and closes when swiped down.
---

# Bottom sheet

`WBottomSheet` is the phone version of a dropdown: a sheet that slides up from the bottom with the toggle repeated at its top. The kit's menus and selects switch to it on phones on their own — through [`WDropdownAdaptive`](/components/dropdown-menu#custom-dropdown) and the overlay manager — so use it directly only for your own phone UI.

The `toggle` slot is rendered in place and again at the top of the sheet: `unclickable` is `true` for the one in place and `false` for the copy, so the copy can be made inert. The `content` slot scrolls under it. The sheet emits `close` when swiped down or when the backdrop is tapped — set `isOpen` to `false` on it. `compact` sizes it to its content, up to 90% of the screen, and `noOverlay` leaves the page in view without the backdrop; a tap on the page then closes it.

`WDismissable` is the swipe under the sheet: a full-screen layer whose content scrolls up into view when `isOpen` turns on, and emits `close` when it is scrolled mostly out of view. Build on it for another swipe-away panel.

<!-- @example BottomSheet/Basic client -->

<DocsDemo name="BottomSheet/Basic" client-only />

```vue
<template>
  <div class="flex flex-wrap items-center gap-4">
    <WBottomSheet
      :is-open="isOpen"
      compact
      @close="isOpen = false"
    >
      <template #toggle="{unclickable}">
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :class="{'pointer-events-none': !unclickable}"
          @click="isOpen = true"
        >
          {{ plant }}
        </WButton>
      </template>

      <template #content>
        <div class="grid pb-6">
          <WMenuItem
            v-for="item in plants"
            :key="item"
            :active="item === plant"
            @click="pick(item)"
          >
            {{ item }}
          </WMenuItem>
        </div>
      </template>
    </WBottomSheet>

    <span class="text-description text-sm">Swipe it down, or tap the backdrop, to close it.</span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WBottomSheet from 'eco-vue-js/dist/components/BottomSheet/WBottomSheet.vue'
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WMenuItem from 'eco-vue-js/dist/components/MenuItem/WMenuItem.vue'

const plants = ['Basil', 'Lavender', 'Mint', 'Rosemary', 'Thyme']

const plant = ref(plants[0]!)
const isOpen = ref(false)

const pick = (value: string) => {
  plant.value = value
  isOpen.value = false
}
</script>
```

<!-- @example-end -->

## API

<!-- @api WBottomSheet -->

### WBottomSheet

```ts
import WBottomSheet from 'eco-vue-js/dist/components/BottomSheet/WBottomSheet.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | **required** | Opens the sheet. |
| `compact` | `boolean` | — | Sizes the sheet to its content, up to 90% of the screen, instead of always taking 90%. |
| `noOverlay` | `boolean` | — | Leaves the page in view without the dimmed backdrop. A tap outside the sheet still closes it, and also reaches the page. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The sheet was swiped down, or the backdrop — with `noOverlay`, the page — was tapped. Set `isOpen` to `false` on it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toggle` | `{ unclickable: boolean; isTop?: boolean \| undefined; }` | Element that opens the sheet, rendered in place and again at the top of the sheet — `unclickable` is `true` for the one in place and `false` for the copy. |
| `content` | — | Content of the sheet, which scrolls under the toggle. |
| `footer` | — | Pinned at the bottom of the sheet, under the content that scrolls, such as a form's buttons. |

<!-- @api-end -->

<!-- @api WDismissable -->

### WDismissable

```ts
import WDismissable from 'eco-vue-js/dist/components/Dismissable/WDismissable.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | **required** | Shows the layer and scrolls the content into view. |
| `contentClass` | `string` | — | Class of the content's box. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The content was swiped or scrolled mostly out of view, or the space above it was clicked. Set `isOpen` to `false` on it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ hide: () => Promise<void>; }` | Content that slides up from the bottom. `hide` slides it out, which then emits `close`. |

<!-- @api-end -->
