<template>
  <div class="flex">
    <CalendarDay
      v-for="(day, index) in days"
      :key="index"
      :start-of-month="startOfMonth"
      :start-of-day="day"
      :date-range="isEmpty || isBetweenRange ? undefined : dateRange"
      :is-between="isBetweenRange"
      :is-week-out-of-month="isWeekOutOfMonth"
      :is-hover-enabled="isHoverEnabled"
      :min-date="minDate"
      :max-date="maxDate"
      :disabled="isDisabled"
      @click:day="$emit('click:day', $event)"
      @hover:day="$emit('hover:day', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import type {DateRange} from '../models/types'
import CalendarDay from './CalendarDay.vue'

const props = defineProps<{
  startOfMonth: Date
  startOfWeek: Date
  dateRange?: DateRange
  isBetween: boolean
  isHoverEnabled: boolean
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click:day', value: Date): void
  (e: 'hover:day', value: Date): void
}>()

const days = computed<Date[]>(() => Array(7).fill(undefined).map((_, index) => {
  const date = new Date(props.startOfWeek)

  date.setDate(date.getDate() + index)

  return date
}))

const endOfWeek = computed(() => days.value[days.value.length - 1])

const isWeekOutOfMonth = computed(() => {
  const month = props.startOfMonth.getMonth()

  return props.startOfWeek.getMonth() !== month || endOfWeek.value.getMonth() !== month
})

const isBeforeTo = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.to > endOfWeek.value
})

const isAfterFrom = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.from < props.startOfWeek
})

const isBetweenRange = computed(() => {
  if (props.isBetween) return true

  return isBeforeTo.value && isAfterFrom.value
})

const isBeforeFrom = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.from > endOfWeek.value
})

const isAfterTo = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.to < props.startOfWeek
})

const isEmpty = computed(() => {
  if (props.isBetween) return false
  if (!props.dateRange) return true

  return (isBeforeFrom.value && isBeforeTo.value) || (isAfterFrom.value && isAfterTo.value)
})

const isDisabled = computed(() => {
  if (props.disabled) return true

  if (props.minDate) return props.minDate > endOfWeek.value

  if (props.maxDate) return props.maxDate < props.startOfWeek

  return false
})

</script>
