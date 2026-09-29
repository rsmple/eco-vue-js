---
group: Controls
description: WDatePicker and WDatePickerSingle calendars for a date range or a day, WSlider and WSliderRange for a number or a range, and WFilePicker, a drop zone for files.
---

# Pickers

Controls that pick a value by pointing at it rather than typing it. Unlike the inputs, they have no title or form-field frame of their own, except `WFilePicker` — put them in a `WFieldWrapper` or next to your own label.

## Dates

`WDatePicker` picks a range: the first click starts it, the range follows the pointer, and the second click ends it and emits `{from, to}`, in order whichever day was clicked first. The two cards on top show the ends; clicking one goes to its month.

`WDatePickerSingle` picks one day on the first click. It is the calendar in [`WInputDate`](/components/input), which is the one to use in a form.

`minDate` and `maxDate` limit the days that can be picked and the months the calendar goes to. Days come at the start of the day, in local time.

<!-- @example DatePicker/Basic -->

<DocsDemo name="DatePicker/Basic" />

```vue
<template>
  <div class="grid gap-8 md:grid-cols-2">
    <div class="grid content-start gap-2">
      <WDatePicker
        v-model="range"
        :max-date="today"
      />

      <span class="text-description text-sm">
        {{ range ? `${ dateFormat(range.from) } – ${ dateFormat(range.to) }` : 'No range' }}
      </span>
    </div>

    <div class="grid content-start gap-2">
      <WDatePickerSingle
        v-model="day"
        :min-date="today"
      />

      <span class="text-description text-sm">
        {{ day ? dateFormat(day) : 'No day' }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import type {DateRange} from 'eco-vue-js/dist/components/DatePicker/models/types'
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WDatePicker from 'eco-vue-js/dist/components/DatePicker/WDatePicker.vue'
import WDatePickerSingle from 'eco-vue-js/dist/components/DatePicker/WDatePickerSingle.vue'

const today = getStartOfDay()

const range = ref<DateRange | undefined>({from: addDay(today, -6), to: today})
const day = ref<Date>()
</script>
```

<!-- @example-end -->

## Sliders

`WSlider` picks a number and `WSliderRange` a range, from `min` to `max` in steps of `step`. Dragging emits `update-eager:model-value` at every step and `update:model-value` once it ends, so the value can be shown as it moves while the model — and a query using it — changes only once. The `right` slot is the place for it.

`WSlider` is colored by `semanticType`. `WSliderRange` fades from one end's color to the other's, set with the `w-slider-from-*` and `w-slider-to-*` utilities from the kit's Tailwind base, e.g. `w-slider-from-positive w-slider-to-negative`. Both ends are primary by default.

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

## Files

`WFilePicker` is a drop zone with a browse button. Dropped or picked files replace the model; each one shows with its name and a button to remove it. Without `multiple`, only the first dropped file is taken. `accept` limits what the browse dialog offers, but not what can be dropped — check the files before uploading them.

`placeholder` shows a file that is already saved, such as the current avatar, by its name, until another file is picked. Removing it emits `clear:placeholder`. The `positive` and `negative` slots replace the file's icon, e.g. with a preview of an image.

<!-- @example FilePicker/Basic -->

<DocsDemo name="FilePicker/Basic" />

```vue
<template>
  <div class="grid max-w-xl gap-4">
    <WFilePicker
      v-model="files"
      title="Attachments"
      accept="image/*,.pdf"
      multiple
    />

    <WFilePicker
      v-model="avatar"
      title="Avatar"
      :placeholder="current"
      accept="image/*"
      @update:model-value="current = undefined"
      @clear:placeholder="current = undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WFilePicker from 'eco-vue-js/dist/components/FilePicker/WFilePicker.vue'

const files = ref<File[]>([])

// The file that is already saved, shown until a new one is picked or it is removed.
const avatar = ref<File[]>([])
const current = ref<string | undefined>('avatar.png')
</script>
```

<!-- @example-end -->

## API

<!-- @api WDatePicker -->

### WDatePicker

```ts
import WDatePicker from 'eco-vue-js/dist/components/DatePicker/WDatePicker.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `DateRange \| undefined` | **required** | Picked range, from its first to its last day. The calendar opens at its month. |
| `minDate` | `Date` | — | First day that can be picked. The calendar doesn't go to earlier months. |
| `maxDate` | `Date` | — | Last day that can be picked. The calendar doesn't go to later months. |
| `readonly` | `boolean` | — | Shows the calendar without picking a range. When unset, inherits the readonly state provided by a parent. |
| `disabled` | `boolean` | — | Shows the calendar without picking a range. When unset, inherits the disabled state provided by a parent. |
| `skeleton` | `boolean` | — | Shows the calendar without picking a range. When unset, inherits the skeleton state provided by a parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: DateRange \| undefined)` | The picked range, once its second day is clicked. The days are in order whichever was clicked first. |

<!-- @api-end -->

<!-- @api WDatePickerSingle -->

### WDatePickerSingle

```ts
import WDatePickerSingle from 'eco-vue-js/dist/components/DatePicker/WDatePickerSingle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Date \| undefined` | **required** | Picked day. The calendar opens at its month. |
| `minDate` | `Date` | — | First day that can be picked. The calendar doesn't go to earlier months. |
| `maxDate` | `Date` | — | Last day that can be picked. The calendar doesn't go to later months. |
| `readonly` | `boolean` | — | Shows the calendar without picking a day. When unset, inherits the readonly state provided by a parent. |
| `disabled` | `boolean` | — | Shows the calendar without picking a day. When unset, inherits the disabled state provided by a parent. |
| `skeleton` | `boolean` | — | Shows the calendar without picking a day. When unset, inherits the skeleton state provided by a parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: Date \| undefined)` | The clicked day, at the start of the day. |

<!-- @api-end -->

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

<!-- @api WFilePicker -->

### WFilePicker

```ts
import WFilePicker from 'eco-vue-js/dist/components/FilePicker/WFilePicker.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `File[]` | **required** | Picked files. |
| `placeholder` | `string` | — | Name of a file that is already saved, such as the current avatar, shown while no file is picked. Removing it emits `clear:placeholder`. |
| `multiple` | `boolean` | — | Lets several files be picked at once. |
| `accept` | `string` | — | File types the browse dialog offers, as in the input's `accept` attribute, e.g. `image/*,.pdf`. |
| `errorMessage` | `string` | — | Error shown under the drop zone. The files get a cross instead of a check. |
| `title` | `string` | — | Label above the drop zone. |
| `skeleton` | `boolean` | — | Shows a placeholder for the title and stops picking. When unset, inherits the skeleton state provided by a parent. |
| `readonly` | `boolean` | — | Stops picking. When unset, inherits the readonly state provided by a parent. |
| `disabled` | `boolean` | — | Stops picking. When unset, inherits the disabled state provided by a parent. |
| `required` | `boolean` | — | Marks the title with a red asterisk. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `clear:placeholder` | — | The `placeholder` file was removed. |
| `update:model-value` | `(value: File[])` | Files picked with the dialog or dropped, replacing the previous ones, or the files left after one is removed. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `positive` | `{ file?: File \| undefined; }` | Icon of a file, replacing the check. `file` is unset for the `placeholder`. |
| `negative` | `{ file?: File \| undefined; }` | Icon of a file while there is an error, replacing the cross. `file` is unset for the `placeholder`. |

<!-- @api-end -->
