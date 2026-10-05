---
group: Data
description: WDragContainer — lets the user reorder a list by dragging its items by a handle, emitting the new order once an item is dropped.
---

# Drag container

`WDragContainer` lets the user reorder `list` by dragging its items. It doesn't render the items itself: the default slot renders each one, and binds `container` — the drag attributes and its place in the order — to the item's root. An item becomes draggable when `initDrag` is called, usually on mousedown of a drag handle, so that text in the item can still be selected. The items move as the dragged one passes over them; `update:list` emits the new order once it is dropped.

The `w-drag-item-overlay-*` utility sets the color laid over the item being dragged.

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
