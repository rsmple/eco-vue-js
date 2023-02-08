<template>
  <div class="[--date-picker-day-height:36px] [--date-picker-day-width:calc(100%/7)]">
    <div class="flex gap-8 mb-4">
      <CalendarValue
        title="From:"
        :value="dateRange?.from"
        :current-date="currentDate"
        auto-focus
        class="w-[calc(50% - 16px)]"
        @update:current-date="setCurrentDate"
      />

      <CalendarValue
        title="To:"
        :value="dateRange?.to"
        :current-date="currentDate"
        class="w-[calc(50% - 16px)]"
        @update:current-date="setCurrentDate"
      />
    </div>

    <div class="bg-default dark:bg-default-dark border border-solid border-gray-300 dark:border-gray-700 rounded-xl p-3">
      <div class="flex gap-8 mb-4">
        <CalendarToggle
          class="w-[calc(50% - 16px)]"
          @click:previous="setCurrentDate(addMonth(currentDate, -1))"
          @click:next="setCurrentDate(addMonth(currentDate, 1))"
        >
          {{ monthShortFormatter.format(currentDate).toLocaleUpperCase() }}
        </CalendarToggle>

        <CalendarToggle
          class="w-[calc(50% - 16px)]"
          @click:previous="setCurrentDate(addYear(currentDate, -1))"
          @click:next="setCurrentDate(addYear(currentDate, 1))"
        >
          {{ year }}
        </CalendarToggle>
      </div>

      <CalendarMonth
        :start-of-month="currentDate"
        :date-range="dateRange"
        :is-hover-enabled="preselectedValue !== null"
        @click:day="onClickDay"
        @hover:day="setRange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, watch, toRef} from 'vue'
import {getStartOfMonth, addMonth, addYear, monthShortFormatter} from '@/utils/dateTime'
import CalendarMonth from './components/CalendarMonth.vue'
import CalendarToggle from './components/CalendarToggle.vue'
import CalendarValue from './components/CalendarValue.vue'
import type {DateRange} from './models/types'

const props = defineProps<{
  modelValue: DateRange | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange | undefined): void
}>()

const currentDate = ref(getStartOfMonth())
const dateRange = ref<DateRange | undefined>(props.modelValue)
const preselectedValue = ref<Date | null>(null)

const year = computed<number>(() => currentDate.value.getFullYear())

const setCurrentDate = (value: Date): void => {
  currentDate.value = value
}

const onClickDay = (value: Date): void => {
  if (!preselectedValue.value) {
    preselectedValue.value = value

    setRange(value)
  } else {
    setRange(value)

    preselectedValue.value = null

    emit('update:modelValue', dateRange.value)

    dateRange.value = undefined
  }
}

const setRange = (value: Date): void => {
  if (!preselectedValue.value) {
    dateRange.value = {
      from: new Date(value),
      to: new Date(value),
    }

    return
  }

  if (value > preselectedValue.value) {
    dateRange.value = {
      from: new Date(preselectedValue.value),
      to: new Date(value),
    }
  } else {
    dateRange.value = {
      from: new Date(value),
      to: new Date(preselectedValue.value),
    }
  }
}

watch(toRef(props, 'modelValue'), modelValue => {
  dateRange.value = modelValue
})

</script>
