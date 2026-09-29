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
