---
group: Overlays
title: Dropdown menu
description: Menus and dropdowns — WButtonMore and WButtonDropdown for action menus, WDropdownMenu for any content anchored to an element, and WDropdownAdaptive for a bottom sheet on phones.
---

# Dropdown menu

For a menu of actions, use a ready-made button. For anything else anchored to an element — a column picker, a filter, a date range — build it on `WDropdownMenu`.

## Action menus

- `WButtonMore` is the "⋯" button: its default slot is the menu, and any click closes it. Only one `WButtonMore` is open at a time across the page.
- `WButtonDropdown` is a button with an arrow next to it: the `button` slot holds the main action and the `content` slot the others. The `content` slot gets `close`.

Menu items are `WButtonMoreItem`s: a `text` (or the default slot), an `icon`, and `to` or `href` to make the item a link. A disabled item can explain itself with `tooltipText`. `semanticType` colors an item, like the red Delete below.

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
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'
import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconCopy from 'eco-vue-js/dist/assets/icons/IconCopy'
import IconEdit from 'eco-vue-js/dist/assets/icons/IconEdit'
import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

const action = ref<string>()
</script>
```

<!-- @example-end -->

## Custom dropdown

`WDropdownMenu` renders the `toggle` slot in place and, while `isOpen` is true, the `content` slot in a layer on `<body>`, positioned against the toggle. It has no state of its own: the parent opens and closes it, usually with a `WClickOutside` around the content to close it on a click elsewhere.

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
        class="bg-surface my-2 grid w-64 gap-1 rounded-xl p-3 shadow-md border border-line-raised"
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

- **`horizontalAlign`** lines the content up with the toggle: `LEFT_INNER` and `RIGHT_INNER` align their left or right edges, `FILL` makes the content as wide as the toggle, `CENTER` centres it, and the `OUTER` values put it beside the toggle.
- **Vertically** it opens below the toggle, or above when there's more room there; `top` forces above. The `content` slot gets `isTop`, `isLeft` and `isRight`, to round the right corners or place an arrow.
- **`parentElement`** anchors the content to another element than the toggle. `updateAlign` picks the sides again when the toggle moves while the dropdown is open.
- **`dropdownClass`** goes on the positioned box, for its width or max height.

`WDropdownAdaptive` takes the same props and slots but opens a bottom sheet on phones instead. It emits `close` when the sheet is dismissed, and with `closeOnClickOutside` also on a click outside the dropdown.

`WMenuItem` is a row for the content of a custom menu — the row that `WButtonMoreItem` and the list menus are built from. It is a button, a router link with `to`, or a plain link with `href` (and `download` for a file). `active` marks the picked option with a check; `false` keeps room for the check, so that the rows of a picker line up. `loading` shows a spinner over it while its action runs.

## Building blocks

The menus are made of smaller parts, which also work on their own:

- **`WDropdown`** places its content in a fixed layer against `parentElement` — an element or a text selection `Range` — and follows it as the page scrolls. `WDropdownMenu` adds the toggle and the teleport to `<body>`; the tooltips use it as well.
- **`WClickOutside`** emits `click` on a click or right-click anywhere outside it. The click that mounted it doesn't count, so it can wrap content opened by a click.
- **`WBottomSheet`** is the phone version of a dropdown: a sheet that slides up from the bottom with the toggle repeated at its top, and emits `close` when swiped down or when the backdrop is clicked.
- **`WDismissable`** is the swipe under the sheet: a full-screen layer whose content scrolls up into view when `isOpen` turns on, and emits `close` when it is scrolled mostly out of view.

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
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | Element the menu is positioned against. Defaults to the element rendered by the `toggle` slot. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/Dropdown/types.ts` (5)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | **required** | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `top` | `boolean` | — | Prefers opening above the parent. |
| `bottom` | `boolean` | — | Always opens below the parent. |
| `updateAlign` | `boolean` | — | Picks the placement again as the parent moves, instead of keeping the first one. |
| `emitUpdate` | `boolean` | — | Emits `update:rect` on scroll and resize instead of following the parent. |

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
| `closeOnClickOutside` | `boolean` | — | Emits `close` on a click outside the menu. On mobile the bottom sheet emits `close` on its own. |
| `isOpen` | `boolean` | **required** | Shows the menu. |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | Element the menu is positioned against. Defaults to the element rendered by the `toggle` slot. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/Dropdown/types.ts` (5)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | **required** | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `top` | `boolean` | — | Prefers opening above the parent. |
| `bottom` | `boolean` | — | Always opens below the parent. |
| `updateAlign` | `boolean` | — | Picks the placement again as the parent moves, instead of keeping the first one. |
| `emitUpdate` | `boolean` | — | Emits `update:rect` on scroll and resize instead of following the parent. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The bottom sheet was dismissed on mobile, or a click landed outside the menu with `closeOnClickOutside`. |
| `update:rect` | — | The parent moved on scroll or resize, with `emitUpdate` set. Desktop only. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toggle` | `{ isTop?: boolean \| undefined; unclickable?: boolean \| undefined; isMobile: boolean; }` | Element that opens the menu. On mobile it is also repeated at the top of the bottom sheet — `unclickable` is true for the one on the page and false for the copy in the sheet. |
| `header` | — | Replaces the copy of `toggle` at the top of the bottom sheet on mobile. |
| `content` | `Partial<DropdownDefaultSlotScope> & { isMobile: boolean; }` | Menu content, rendered in a dropdown on desktop and in a bottom sheet on mobile. The placement props of WDropdownMenu are passed on desktop only. |

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
| `anchor` | `Pick<Element, "getBoundingClientRect">` | — | Element the menu is positioned against instead of the button, aligned to its right edge — for a menu opened at a cursor or row. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The menu closed — by a click on the button or inside the menu. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Menu items, usually WButtonMoreItem. A click inside closes the menu. Only one WButtonMore menu is open at a time. |

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
| `content` | `{ close: () => void; }` | Menu content, usually WButtonMoreItem. A click inside closes the menu, and so does `close`. |

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

<!-- @api WDropdown -->

### WDropdown

```ts
import WDropdown from 'eco-vue-js/dist/components/Dropdown/WDropdown.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | **required** | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `top` | `boolean` | — | Prefers opening above the parent. |
| `bottom` | `boolean` | — | Always opens below the parent. |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | **required** | Element (or range) the dropdown is positioned against. |
| `updateAlign` | `boolean` | — | Picks the placement again as the parent moves, instead of keeping the first one. |
| `emitUpdate` | `boolean` | — | Emits `update:rect` on scroll and resize instead of following the parent. |
| `innerClass` | `string` | — | Classes for the dropdown's content box. Defaults to `w-max`. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:rect` | — | The page scrolled or resized while `emitUpdate` is set, e.g. to close the dropdown. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `DropdownDefaultSlotScope` | Content of the dropdown. `isTop` is true when it opened above the parent, `isLeft` and `isRight` when it opened to that side, and `atBottom` when the parent is in the lower half of the screen. |

<!-- @api-end -->

<!-- @api WClickOutside -->

### WClickOutside

```ts
import WClickOutside from 'eco-vue-js/dist/components/ClickOutside/WClickOutside.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `noFilter` | `boolean` | — | Emits `click` on clicks inside the element too. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | — | A click or right-click outside the element. Clicks in the same tick as mounting, such as the one that opened it, are ignored. |
| `mouseenter` | `(value: MouseEvent)` | The pointer entered the element. |
| `mouseleave` | `(value: MouseEvent)` | The pointer left the element. |
| `mousedown` | `(value: MouseEvent)` | A mouse button was pressed on the element. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content that clicks count as inside of, such as a dropdown's content. |

<!-- @api-end -->

<!-- @api WBottomSheet -->

### WBottomSheet

```ts
import WBottomSheet from 'eco-vue-js/dist/components/BottomSheet/WBottomSheet.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | **required** | Opens the sheet. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The sheet was swiped down or the backdrop was clicked. Set `isOpen` to `false` on it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toggle` | `{ unclickable: boolean; isTop?: boolean \| undefined; }` | Element that opens the sheet, rendered in place and again at the top of the sheet — `unclickable` is `true` for the one in place and `false` for the copy. |
| `content` | — | Content of the sheet, which scrolls under the toggle. |

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
| `default` | `{ hide: () => void; }` | Content that slides up from the bottom. `hide` slides it out, which then emits `close`. |

<!-- @api-end -->
