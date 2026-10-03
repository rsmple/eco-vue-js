---
group: Data
description: WDragContainer to reorder a list by dragging, WShine and WShineEffect for the moving shine on buttons, WBorderSvg for dashed or animated borders, and WEmptyComponent to render content without an element.
---

# Utilities

## Reorder by dragging

`WDragContainer` lets the user reorder `list` by dragging its items. It doesn't render the items itself: the default slot renders each one, and binds `container` — the drag attributes and its place in the order — to the item's root. An item becomes draggable when `initDrag` is called, usually on mousedown of a drag handle, so that text in the item can still be selected. The items move as the dragged one passes over them; `update:list` emits the new order once it is dropped.

<!-- @example DragContainer/Basic -->

<DocsDemo name="DragContainer/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-4">
    <WDragContainer
      :list="steps"
      @update:list="steps = $event"
    >
      <template #default="{item, index, container, initDrag}">
        <div
          v-bind="container"
          class="bg-surface mb-2 flex items-center gap-3 rounded-xl border border-solid border-line-subtle p-3"
        >
          <IconDrag
            class="text-description square-5 cursor-grab"
            @mousedown="initDrag"
          />

          <span class="text-description w-4">{{ index + 1 }}</span>

          <span>{{ item }}</span>
        </div>
      </template>
    </WDragContainer>

    <span class="text-description text-sm">Saved order: {{ steps.join(' → ') }}</span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WDragContainer from 'eco-vue-js/dist/components/DragContainer/WDragContainer.vue'

import IconDrag from 'eco-vue-js/dist/assets/icons/IconDrag'

const steps = ref(['Sow', 'Prick out', 'Pot on', 'Harden off', 'Plant out'])
</script>
```

<!-- @example-end -->

## Effects

- **`WShine`** is the light that sweeps across the kit's action buttons every few seconds. Put it inside a positioned element; it takes its corners. The sweep comes from one `WShineEffect` mounted at the app root, next to the [global containers](/guide/getting-started#global-containers) — without it, there is no shine. It is hidden on phones and in print.
- **`WBorderSvg`** draws a border as SVG over a positioned element — for dashes that a CSS border can't do, or a border that moves, as on the file picker's drop zone. `strokeDasharray` sets the dashes, and an `animate` element in the slot animates them. The `w-border-svg-rounded-*`, `w-border-svg-stroke-*` and `w-border-svg-padding-*` utilities set its corners, width and inset.
- **`WEmptyComponent`** renders its slot without an element, for `<component :is="wrap ? WTooltip : WEmptyComponent">`-style optional wrappers.

## API

<!-- @api WDragContainer -->

### WDragContainer

```ts
import WDragContainer from 'eco-vue-js/dist/components/DragContainer/WDragContainer.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `list` | `Data[]` | **required** | Items in their saved order. |
| `disabled` | `boolean` | — | Stops dragging and dims the items. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:list` | `(Data[])` | The items in their new order, once an item is dropped. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ item: Data; index: number; last: boolean; orderedList: Data[]; dragging: boolean; initDrag: () => void; container: HTMLAttributes; }` | An item. Bind `container` to its root element, and call `initDrag` on mousedown of its drag handle — or of the whole item — to make it draggable. `index` and `last` follow the order while dragging, and `dragging` is true while an item of this list is dragged. |

<!-- @api-end -->

<!-- @api WShine -->

### WShine

```ts
import WShine from 'eco-vue-js/dist/components/Shine/WShine.vue'
```

#### Props

_No props._

<!-- @api-end -->

<!-- @api WShineEffect -->

### WShineEffect

```ts
import WShineEffect from 'eco-vue-js/dist/components/Shine/WShineEffect.vue'
```

#### Props

_No props._

<!-- @api-end -->

<!-- @api WBorderSvg -->

### WBorderSvg

```ts
import WBorderSvg from 'eco-vue-js/dist/components/BorderSvg/WBorderSvg.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stroke` | `string` | — | Color of the border, e.g. `currentColor`. |
| `strokeDasharray` | `string` | — | Dash pattern of the border, e.g. `4px 8px`. |
| `strokeDashoffset` | `string` | — | Offset of the dash pattern, e.g. to animate it. |
| `strokeLinecap` | `"butt" \| "round" \| "square" \| "inherit"` | — | Shape of the dashes' ends. |
| `rectClass` | `string` | — | Class of the border's `rect`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | SVG animation elements for the border, such as an `animate` of `stroke-dashoffset`. |

<!-- @api-end -->

<!-- @api WEmptyComponent -->

### WEmptyComponent

```ts
import WEmptyComponent from 'eco-vue-js/dist/components/EmptyComponent/WEmptyComponent.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ [key: string]: never; }` | Content rendered without a wrapping element. It gets no slot props. |

<!-- @api-end -->
