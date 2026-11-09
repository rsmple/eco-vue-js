---
group: Controls
description: WSlider and WSliderRange — pick a number or a range by dragging, with an eager value while dragging and colors set by utilities.
---

# Slider

`WSlider` picks a number, `WSliderRange` a range, from `min` to `max` by `step`. They have no title or field frame — use a [`WFieldWrapper`](/components/field-wrapper)'s `field` slot or your own label.

Dragging emits `update-eager:model-value` per step and `update:model-value` on release, so a live value can show (in the `right` slot) while the model — and any query using it — changes once.

`WSlider` is colored by `semanticType`. `WSliderRange` fades between its ends' colors, set with `w-slider-from-*` and `w-slider-to-*` (e.g. `w-slider-from-positive w-slider-to-negative`); both default to primary.

For a color scale like hues, set `--w-slider-track` and `--w-slider-fill` to background images — the whole track, and the picked part over the end colors.

<!-- @example Slider/Basic -->

<DocsDemo name="Slider/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-6">
    <WSlider
      v-model="rating"
      :min="1"
      :max="10"
      @update-eager:model-value="ratingEager = $event"
    >
      <template #right>
        <span class="w-8 text-right font-semibold">{{ ratingEager ?? rating }}</span>
      </template>
    </WSlider>

    <WSliderRange
      v-model="score"
      :min="0"
      :max="100"
      :step="10"
      class="w-slider-from-positive w-slider-to-negative"
      @update-eager:model-value="scoreEager = $event"
    >
      <template #right>
        <span class="w-16 text-right font-semibold">{{ (scoreEager ?? score).from }}–{{ (scoreEager ?? score).to }}</span>
      </template>
    </WSliderRange>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'

import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'
import WSliderRange from 'eco-vue-js/dist/components/Slider/WSliderRange.vue'

const rating = ref(7)
const ratingEager = ref<number>()

const score = ref({from: 30, to: 70})
const scoreEager = ref<{from: number, to: number}>()

// The eager value is only for showing the drag; the picked value takes over once it ends.
watch(rating, () => ratingEager.value = undefined)
watch(score, () => scoreEager.value = undefined)
</script>
```

<!-- @example-end -->

## API

<!-- @api WSlider -->

### WSlider

```ts
import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `number` | **required** | Picked value, from `min` to `max`. |
| `min` | `number` | `1` | Value at the left end. |
| `max` | `number` | `10` | Value at the right end. |
| `step` | `number` | `1` | Values snap to steps of this size from `min`. |
| `semanticType` | `SemanticType` | `SemanticType.PRIMARY` | Color of the filled part. |
| `disabled` | `boolean` | — | Grays the slider out and stops dragging. |
| `readonly` | `boolean` | — | Stops dragging. |
| `errorMessage` | `string` | — | Error shown under the slider. The filled part turns red. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: number)` | The value where dragging ended. |
| `update-eager:model-value` | `(value: number)` | The value under the pointer while dragging, for showing it before it is picked. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `right` | — | Content to the right of the slider, such as the value. |

<!-- @api-end -->

<!-- @api WSliderRange -->

### WSliderRange

```ts
import WSliderRange from 'eco-vue-js/dist/components/Slider/WSliderRange.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Range` | **required** | Picked range, with `from` no greater than `to`. |
| `min` | `number` | `1` | Value at the left end. |
| `max` | `number` | `10` | Value at the right end. |
| `step` | `number` | `1` | Values snap to steps of this size from `min`. |
| `disabled` | `boolean` | — | Grays the slider out and stops dragging. |
| `readonly` | `boolean` | — | Stops dragging. |
| `errorMessage` | `string` | — | Error shown under the slider. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: Range)` | The range where dragging ended. |
| `update-eager:model-value` | `(value: Range)` | The range under the pointer while dragging, for showing it before it is picked. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `right` | — | Content to the right of the slider, such as the range. |

<!-- @api-end -->
