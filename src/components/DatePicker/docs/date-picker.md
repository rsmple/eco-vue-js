---
group: Controls
description: WDatePicker and WDatePickerSingle — calendars for picking a date range or a single day, limited by minDate and maxDate.
---

# Date picker

Calendars for picking dates. They have no title or field frame — use a [`WFieldWrapper`](/components/field-wrapper)'s `field` slot or your own label. In forms, prefer [`WInputDate`](/components/input#date): a field with this calendar in a dropdown.

`WDatePicker` picks a range: the first click starts it, it follows the pointer, and the second click emits `{from, to}`, ordered regardless of click order. The two cards on top show the ends; click one to jump to its month.

`WDatePickerSingle` picks one day per click.

`minDate` and `maxDate` limit pickable days and navigable months. Days are start-of-day, local time. Helpers like `getStartOfDay`, `addDay` and `dateFormat` are in [Formatting](/utilities/formatting#dates).

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
