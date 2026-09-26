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

Menu items are `WButtonMoreItem`s: a `text` (or the default slot), an `icon`, and `to` or `href` to make the item a link. A disabled item can explain itself with `tooltipText`.

<!-- @example DropdownMenu/ButtonMore client -->

<DocsDemo name="DropdownMenu/ButtonMore" client-only />

```vue
<template>
  <div class="flex items-center gap-6">
    <span>Project Atlas</span>

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
        tooltip-text="Only owners can archive a project"
      />

      <WButtonMoreItem
        text="Delete"
        :icon="markRaw(IconTrash)"
        class="text-negative dark:text-negative-dark"
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

<!-- @example DropdownMenu/Custom client -->

<DocsDemo name="DropdownMenu/Custom" client-only />

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
        class="bg-default dark:bg-default-dark my-2 grid w-64 gap-1 rounded-xl p-3 shadow-md dark:border dark:border-gray-800"
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

const COLUMNS = ['Title', 'Author', 'Year', 'Genre', 'Available']

const isOpen = ref(false)
const visible = ref(['Title', 'Author', 'Year'])
</script>
```

<!-- @example-end -->

- **`horizontalAlign`** lines the content up with the toggle: `LEFT_INNER` and `RIGHT_INNER` align their left or right edges, `FILL` makes the content as wide as the toggle, `CENTER` centres it, and the `OUTER` values put it beside the toggle.
- **Vertically** it opens below the toggle, or above when there's more room there; `top` forces above. The `content` slot gets `isTop`, `isLeft` and `isRight`, to round the right corners or place an arrow.
- **`parentElement`** anchors the content to another element than the toggle. `updateAlign` picks the sides again when the toggle moves while the dropdown is open.
- **`dropdownClass`** goes on the positioned box, for its width or max height.

`WDropdownAdaptive` takes the same props and slots but opens a bottom sheet on phones instead. It emits `close` when the sheet is dismissed, and with `closeOnClickOutside` also on a click outside the dropdown.

## API

<!-- @api WDropdownMenu -->

### WDropdownMenu

```ts
import WDropdownMenu from 'eco-vue-js/dist/components/DropdownMenu/WDropdownMenu.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | **required** | — |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | — |
| `dropdownClass` | `string` | — | — |

::: details Inherited from `src/components/Dropdown/types.ts` (6)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | **required** | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `updateAlign` | `boolean` | — | — |
| `emitUpdate` | `boolean` | — | — |
| `innerClass` | `string` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:rect` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toggle` | `{ isTop: boolean; unclickable: undefined; }` | — |
| `content` | `DropdownDefaultSlotScope` | — |

<!-- @api-end -->

<!-- @api WDropdownAdaptive -->

### WDropdownAdaptive

```ts
import WDropdownAdaptive from 'eco-vue-js/dist/components/DropdownMenu/WDropdownAdaptive.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `closeOnClickOutside` | `boolean` | — | — |
| `isOpen` | `boolean` | **required** | — |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | — |
| `dropdownClass` | `string` | — | — |

::: details Inherited from `src/components/Dropdown/types.ts` (6)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | **required** | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `updateAlign` | `boolean` | — | — |
| `emitUpdate` | `boolean` | — | — |
| `innerClass` | `string` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | — |
| `update:rect` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toggle` | `{ isTop?: boolean \| undefined; unclickable?: boolean \| undefined; isMobile: boolean; }` | — |
| `header` | `any` | — |
| `content` | `Partial<DropdownDefaultSlotScope> & { isMobile: boolean; }` | — |

<!-- @api-end -->

<!-- @api WButtonMore -->

### WButtonMore

```ts
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | — | — |
| `disabled` | `boolean` | — | — |
| `anchor` | `Pick<Element, "getBoundingClientRect">` | — | — |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | — |

<!-- @api-end -->

<!-- @api WButtonDropdown -->

### WButtonDropdown

```ts
import WButtonDropdown from 'eco-vue-js/dist/components/Button/WButtonDropdown.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `semanticType` | `SemanticType` | — | — |
| `leftToggle` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `tooltipText` | `string` | — | — |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | — |
| `dropdownClass` | `string` | — | — |

::: details Inherited from `src/components/Dropdown/types.ts` (4)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `innerClass` | `string` | — | — |
| `horizontalAlign` | `HorizontalAlign` | `HorizontalAlign.LEFT_INNER` | — |

:::

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `button` | `any` | — |
| `content` | `{ close: () => void; }` | — |

<!-- @api-end -->

<!-- @api WButtonMoreItem -->

### WButtonMoreItem

```ts
import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `disabled` | `boolean` | — | — |
| `href` | `string` | — | — |
| `download` | `string` | — | — |
| `tooltipText` | `string` | — | — |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | — |
| `icon` | — | — |

<!-- @api-end -->
