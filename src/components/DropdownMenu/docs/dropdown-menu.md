---
group: Overlays
title: Dropdown menu
description: Menus and dropdowns — WButtonMore and WButtonDropdown for action menus, WDropdownMenu for any content anchored to an element, WDropdownAdaptive for a bottom sheet on phones, and WMenuItem rows.
---

# Dropdown menu

Use a ready-made button for action menus; build anything else anchored to an element (a column picker, a filter, a date range) on `WDropdownMenu`.

## Action menus

- `WButtonMore` is the "⋯" button: its default slot is the menu, closed by any click. One menu opens at a time; on phones it's a bottom sheet. `WModal` renders it at the app root, keeping the slot's context, and a confirm opened from an item via `useOverlay` replaces it — see [Anchored confirm](/components/modal#anchored-confirm). The `toggle` slot swaps "⋯" for another button (e.g. `WButtonInput`), receiving `toggle`, `attrs` and `active`.
- `WButtonDropdown` is a split button: `button` holds the main action, `content` the rest (gets `close`).

Items are `WButtonMoreItem`s: `text` (or default slot), `icon`, and `to` or `href` for links. Disabled items can explain via `tooltipText`; `semanticType` colors them, like the red Delete below.

<!-- @example DropdownMenu/ButtonMore -->

<DocsDemo name="DropdownMenu/ButtonMore" />

```vue
<template>
  <div class="flex items-center gap-6">
    <span>Herb bed</span>

    <WButtonMore>
      <WButtonMoreItem
        text="Rename"
        :icon="markRaw(IconEdit)"
        @click="action = 'Rename'"
      />

      <WButtonMoreItem
        text="Duplicate"
        :icon="markRaw(IconCopy)"
        @click="action = 'Duplicate'"
      />

      <WButtonMoreItem
        text="Archive"
        :icon="markRaw(IconArchiveBook)"
        disabled
        tooltip-text="Only the head gardener can archive a bed"
      />

      <WButtonMoreItem
        text="Delete"
        :icon="markRaw(IconTrash)"
        :semantic-type="SemanticType.NEGATIVE"
        @click="action = 'Delete'"
      />
    </WButtonMore>

    <WButtonDropdown>
      <template #button>
        <WButton @click="action = 'Export as CSV'">
          Export as CSV
        </WButton>
      </template>

      <template #content="{close}">
        <WButtonMoreItem
          text="Export as JSON"
          @click="action = 'Export as JSON'; close()"
        />

        <WButtonMoreItem
          text="Export as PDF"
          @click="action = 'Export as PDF'; close()"
        />
      </template>
    </WButtonDropdown>

    <WButtonMore>
      <template #toggle="{toggle, active, attrs}">
        <WButtonInput
          :icon="markRaw(IconSort)"
          tooltip-text="Sort beds"
          :active="active"
          v-bind="attrs"
          @click="toggle"
        />
      </template>

      <WButtonMoreItem
        text="Sort by name"
        @click="action = 'Sort by name'"
      />

      <WButtonMoreItem
        text="Sort by planting date"
        @click="action = 'Sort by planting date'"
      />
    </WButtonMore>
  </div>

  <p class="text-description mt-4 text-sm">
    Last action: {{ action ?? 'none' }}
  </p>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonDropdown from 'eco-vue-js/dist/components/Button/WButtonDropdown.vue'
import WButtonInput from 'eco-vue-js/dist/components/Button/WButtonInput.vue'
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'
import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconCopy from 'eco-vue-js/dist/assets/icons/IconCopy'
import IconEdit from 'eco-vue-js/dist/assets/icons/IconEdit'
import IconSort from 'eco-vue-js/dist/assets/icons/IconSort'
import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

const action = ref<string>()
</script>
```

<!-- @example-end -->

## Custom dropdown

`WDropdownMenu` renders `toggle` in place and, while `isOpen`, the `content` slot in a `<body>` layer positioned against it. It's stateless: the parent opens and closes it, usually with a [`WClickOutside`](/components/click-outside) around the content. It's built on [`WDropdown`](/components/dropdown), which works without a toggle too (e.g. on a text selection).

<!-- @example DropdownMenu/Custom -->

<DocsDemo name="DropdownMenu/Custom" />

```vue
<template>
  <WDropdownMenu
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.LEFT_INNER"
  >
    <template #toggle>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        class="w-max"
        @click="isOpen = !isOpen"
      >
        Columns: {{ visible.length }} of {{ COLUMNS.length }}
      </WButton>
    </template>

    <template #content>
      <WClickOutside
        class="surface-raised my-2 grid w-64 gap-1 rounded-xl p-3 shadow-md border border-line-raised"
        @click="isOpen = false"
      >
        <WCheckbox
          v-for="column in COLUMNS"
          :key="column"
          :model-value="visible.includes(column)"
          :title="column"
          no-margin
          @update:model-value="visible = $event ? [...visible, column] : visible.filter(item => item !== column)"
        />
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {HorizontalAlign} from 'eco-vue-js/dist/utils/HorizontalAlign'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WClickOutside from 'eco-vue-js/dist/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from 'eco-vue-js/dist/components/DropdownMenu/WDropdownMenu.vue'

const COLUMNS = ['Name', 'Species', 'Height', 'Kind', 'Watered']

const isOpen = ref(false)
const visible = ref(['Name', 'Species', 'Height'])
</script>
```

<!-- @example-end -->

- **`horizontalAlign`**: `LEFT_INNER`/`RIGHT_INNER` align edges, `FILL` matches the toggle's width, `CENTER` centres, `OUTER` values place it beside.
- **Vertically** it opens below, or above when there's more room; `top` forces above. `content` gets `isTop`, `isLeft` and `isRight` for corner rounding or an arrow.
- **`parentElement`** anchors to an element other than the toggle; `updateAlign` re-picks sides if the toggle moves while open.
- **`dropdownClass`** goes on the positioned box, e.g. for width or max height.

`WDropdownAdaptive` opens `content` through the overlay manager, like the list's sort and filter menus: a `w-dropdown-frame` dropdown, or a [bottom sheet](/components/bottom-sheet) on phones. One at a time; emits `close` when dismissed (outside click, Escape, swipe, or replaced). Without `horizontalAlign` it centres on the toggle with a tip. The sheet starts with the `header` slot, or a copy of the toggle. Opened from a `closeOnClick` dropdown it replaces it; from any other (e.g. a filter) it stacks on top.

`WMenuItem` is the row `WButtonMoreItem` and list menus are built from: a button, a router link (`to`) or a link (`href`, plus `download`). `active` shows a check; `false` reserves its space so picker rows align. `loading` overlays a spinner.

## API

<!-- @api WDropdownMenu -->

### WDropdownMenu

```ts
import WDropdownMenu from 'eco-vue-js/dist/components/DropdownMenu/WDropdownMenu.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | **required** | Shows the menu. |
| `parentElement` | `(Pick<Element, "getBoundingClientRect"> & { contextElement?: Element \| undefined; })` | — | Element the menu is positioned against. Defaults to the element rendered by the `toggle` slot. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/Dropdown/types.ts` (6)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | **required** | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `top` | `boolean` | — | Prefers opening above the parent. |
| `bottom` | `boolean` | — | Always opens below the parent. |
| `updateAlign` | `boolean` | — | Picks the placement again as the parent moves, instead of keeping the first one. |
| `emitUpdate` | `boolean` | — | Emits `update:rect` on scroll and resize instead of following the parent. |
| `freeze` | `boolean` | — | Stops following the parent and keeps the current position, e.g. once the parent is leaving the page. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:rect` | — | The parent moved on scroll or resize, with `emitUpdate` set. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toggle` | `{ isTop: boolean; unclickable: undefined; }` | Element that opens the menu, and that it is positioned against. `isTop` is true while the menu is open above it. |
| `content` | `DropdownDefaultSlotScope` | Menu content, rendered while open. `isTop`, `isLeft` and `isRight` tell where it opened relative to the parent, `atBottom` that it sits in the lower half of the viewport. |

<!-- @api-end -->

<!-- @api WDropdownAdaptive -->

### WDropdownAdaptive

```ts
import WDropdownAdaptive from 'eco-vue-js/dist/components/DropdownMenu/WDropdownAdaptive.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | **required** | Shows the dropdown. |
| `parentElement` | `(Pick<Element, "getBoundingClientRect"> & { contextElement?: Element \| undefined; }) \| null` | — | Element the dropdown opens at. Defaults to the element rendered by the `toggle` slot. |
| `horizontalAlign` | `HorizontalAlign` | — | Aligns the dropdown to the parent without a tip, such as a field's menu with `HorizontalAlign.FILL`. Otherwise it is centered on the parent with a tip pointing at it. |
| `dialog` | `boolean` | — | The content is a small form, such as a filter: the `header` slot is its title on every screen, and the frame pads the content and sizes to it. |
| `frameClass` | `string` | — | Classes of the dropdown's box, replacing the default frame. |
| `closeOnClick` | `boolean` | — | A click on the content closes the layer, as in a menu. What is opened from it takes its place; from a dropdown without it, such as a filter, it stays over it. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The dropdown closed without `isOpen` turning false — a click outside, Escape, a swipe, or another dropdown taking its place. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toggle` | `{ isTop: boolean; unclickable: boolean \| undefined; }` | Element that opens the dropdown, which it points at. `isTop` is true while the dropdown is open above it. On phones it is repeated at the top of the bottom sheet, unless there is a `header` — `unclickable` is true for the one on the page and false for the copy in the sheet. |
| `header` | — | Heading of the bottom sheet on phones, instead of the copy of `toggle`. With `dialog`, the title of the dropdown too. |
| `content` | — | Content of the dropdown, which brings its own padding, unless it is a `dialog`. A click inside closes it with `closeOnClick`. |

<!-- @api-end -->

<!-- @api WButtonMore -->

### WButtonMore

```ts
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | — | Icon of the button. Defaults to three dots. |
| `disabled` | `boolean` | — | Blocks opening and dims the button. |
| `anchor` | `(Pick<Element, "getBoundingClientRect"> & { contextElement?: Element \| undefined; })` | — | Element the menu is positioned against instead of the button, aligned to its right edge — for a menu opened at a cursor or row. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The menu closed — by a click on the button or inside the menu, or by something opened from it taking its place. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Menu items, usually WButtonMoreItem. A click inside closes the menu. Only one menu is open at a time, and on phones it is a bottom sheet. A confirm opened from an item with `useOverlay` takes the menu's place at the same anchor. |
| `toggle` | `{ toggle: () => void; active: boolean; attrs: { 'aria-expanded': boolean; }; }` | Replaces the three-dots button, such as with WButtonInput: call `toggle` on click, bind `attrs` to the button and `active` to its highlight — `active` stays off while the menu is open at a custom anchor. |

<!-- @api-end -->

<!-- @api WButtonDropdown -->

### WButtonDropdown

```ts
import WButtonDropdown from 'eco-vue-js/dist/components/Button/WButtonDropdown.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `semanticType` | `SemanticType` | — | Color scheme of the arrow button. |
| `leftToggle` | `boolean` | — | Puts the arrow button before the `button` slot instead of after it. |
| `disabled` | `boolean` | — | Disables the arrow button. Buttons in the `button` slot keep their own state. |
| `tooltipText` | `string` | — | Tooltip over the whole button row. |
| `horizontalAlign` | `HorizontalAlign` | `HorizontalAlign.LEFT_INNER` | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `button` | — | Buttons joined to the arrow button. They keep their own click handlers. |
| `content` | `{ close: () => void; }` | Menu content, usually WButtonMoreItem. A click inside closes the menu, and so does `close`. On phones it is a bottom sheet. |

<!-- @api-end -->

<!-- @api WMenuItem -->

### WMenuItem

```ts
import WMenuItem from 'eco-vue-js/dist/components/MenuItem/WMenuItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | — | Grays the item out and ignores clicks. |
| `href` | `string` | — | URL of a plain link, when there is no `to`. |
| `download` | `string` | — | `download` attribute of the `href` link — the file name to save it as. |
| `replace` | `boolean` | — | With `to`, replaces the current history entry instead of pushing a new one. |
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | Native `target` of the link, with `href` or `to`. |
| `rel` | `string` | — | Native `rel` of the link, with `href` or `to`. |
| `active` | `boolean` | — | Marks the item as picked, with primary text and a check. `false` leaves room for the check, to line up with picked items. |
| `tooltipText` | `string` | — | Tooltip text on the left of the item. |
| `loading` | `boolean` | — | Shows a spinner over the item and ignores clicks. |
| `semanticType` | `SemanticType` | `SemanticType.PRIMARY` | Color of the item. Types other than `primary` and `secondary` color the text at rest — a red "Delete". |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The item was clicked, unless it is disabled or loading. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the item, laid out in a row. |

<!-- @api-end -->

<!-- @api WButtonMoreItem -->

### WButtonMoreItem

```ts
import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Label. The `default` slot replaces it. |
| `icon` | `SVGComponent` | — | Icon after the label. The `icon` slot replaces it. |
| `disabled` | `boolean` | — | Blocks clicks and dims the item. |
| `href` | `string` | — | Renders the item as a link to this URL. |
| `download` | `string` | — | Native `download` attribute, with `href`. |
| `replace` | `boolean` | — | With `to`, replaces the current history entry instead of pushing a new one. |
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | Native `target` of the link, with `href` or `to`. |
| `rel` | `string` | — | Native `rel` of the link, with `href` or `to`. |
| `tooltipText` | `string` | — | Tooltip over the item. |
| `semanticType` | `SemanticType` | — | Color of the item. Types other than `primary` and `secondary` color the text at rest — a red "Delete". |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The item was clicked. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Label. Replaces `text`. |
| `icon` | — | Icon after the label. Replaces `icon`. |

<!-- @api-end -->

