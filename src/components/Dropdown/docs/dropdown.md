---
group: Overlays
description: WDropdown and WDropdownTip — content placed in a fixed layer against an element or a text selection, following it as the page scrolls, with a tip pointing at it.
---

# Dropdown

`WDropdown` is the positioning layer under the kit's menus, selects and tooltips. It places its default slot in a fixed layer against `parentElement` — an element, or anything with `getBoundingClientRect`, such as a text selection `Range` — and follows it as the page scrolls. For a menu with a toggle, [`WDropdownMenu`](/components/dropdown-menu#custom-dropdown) adds the toggle and the teleport to `<body>`; use `WDropdown` directly for anything else, such as a toolbar over selected text.

- **`horizontalAlign`** lines the content up with the parent, as in `WDropdownMenu`. When it doesn't fit the screen, the next placement in order is tried.
- **Vertically** it opens below the parent, or above when there's more room there; `top` prefers above and `bottom` always opens below. The slot gets `isTop`, `isLeft` and `isRight` for the side it picked.
- **`updateAlign`** picks the placement again as the parent moves. `emitUpdate` stops following and emits `update:rect` on scroll and resize instead, e.g. to close it; `freeze` keeps the current position, e.g. while the parent leaves the page.
- **`innerClass`** goes on the content's box, `w-max` by default.

It is `position: fixed`, so put it in a `<Teleport to="body">`: a transformed or filtered ancestor would otherwise become what it's positioned in.

`WDropdownTip` is the small arrow of the kit's dropdowns and tooltips, drawn in the surface color of its tone with the raised line around it. Put it first in the slot with `top` set from `isTop`: it moves after the content when the dropdown opens above. `left` and `right` point it sideways, for content beside the parent.

<!-- @example Dropdown/Basic client -->

<DocsDemo name="Dropdown/Basic" client-only />

```vue
<template>
  <div class="grid max-w-xl gap-2">
    <span class="text-description text-sm">Select a few words:</span>

    <p
      ref="text"
      class="leading-relaxed"
      @mouseup="updateRange"
      @keyup="updateRange"
    >
      Monstera likes bright, indirect light and a chunky, well-draining mix. Water it when the top few centimetres of
      soil are dry, and wipe the leaves now and then so they can breathe.
    </p>

    <Teleport to="body">
      <WDropdown
        v-if="range"
        :parent-element="range"
        :horizontal-align="HorizontalAlign.CENTER"
        inner-class="w-max tone-surface-raised flex flex-col items-center"
        update-align
        top
        class="z-50"
      >
        <template #default="{isTop}">
          <WDropdownTip :top="isTop" />

          <div class="w-dropdown-frame w-tooltip-center-x flex gap-1 p-1">
            <WMenuItem @click="add">
              Add to notes
            </WMenuItem>
          </div>
        </template>
      </WDropdown>
    </Teleport>

    <ul
      v-if="notes.length"
      class="text-description list-disc pl-5 text-sm"
    >
      <li
        v-for="note in notes"
        :key="note"
      >
        {{ note }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef} from 'vue'

import {HorizontalAlign} from 'eco-vue-js/dist/utils/HorizontalAlign'

import WDropdown from 'eco-vue-js/dist/components/Dropdown/WDropdown.vue'
import WDropdownTip from 'eco-vue-js/dist/components/Dropdown/WDropdownTip.vue'
import WMenuItem from 'eco-vue-js/dist/components/MenuItem/WMenuItem.vue'

const textRef = useTemplateRef('text')

const range = shallowRef<Range>()
const notes = ref<string[]>([])

// The dropdown follows the selected text, a `Range`, as the page scrolls.
const updateRange = () => {
  const selection = document.getSelection()
  const selected = selection?.rangeCount ? selection.getRangeAt(0) : undefined

  range.value = selected && !selected.collapsed && textRef.value?.contains(selected.commonAncestorContainer) ? selected : undefined
}

const add = () => {
  const text = range.value?.toString().trim()

  if (text) notes.value.push(text)

  document.getSelection()?.removeAllRanges()
  range.value = undefined
}

onMounted(() => document.addEventListener('selectionchange', updateRange))
onBeforeUnmount(() => document.removeEventListener('selectionchange', updateRange))
</script>
```

<!-- @example-end -->

## API

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
| `parentElement` | `Pick<Element, "getBoundingClientRect"> & { contextElement?: Element \| undefined; }` | **required** | Element (or range) the dropdown is positioned against. A virtual one names the element it sits in with `contextElement`, so the dropdown follows its scrolling. |
| `updateAlign` | `boolean` | — | Picks the placement again as the parent moves, instead of keeping the first one. |
| `emitUpdate` | `boolean` | — | Emits `update:rect` on scroll and resize instead of following the parent. |
| `freeze` | `boolean` | — | Stops following the parent and keeps the current position, e.g. once the parent is leaving the page. |
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

<!-- @api WDropdownTip -->

### WDropdownTip

```ts
import WDropdownTip from 'eco-vue-js/dist/components/Dropdown/WDropdownTip.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `top` | `boolean` | — | Points down, placed after the content — for a dropdown above its parent. Without a side, it points up. |
| `left` | `boolean` | — | Points right, placed after the content — for a dropdown to the left of its parent. |
| `right` | `boolean` | — | Points left, placed before the content — for a dropdown to the right of its parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `mouseover` | `(value: MouseEvent)` | The pointer entered the tip, e.g. to keep a tooltip open while it moves onto the content. |
| `mouseleave` | `(value: MouseEvent)` | The pointer left the tip. |

<!-- @api-end -->
