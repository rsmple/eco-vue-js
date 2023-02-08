<template>
  <div>
    <div class="flex text-xs text-accent font-semibold mb-2">
      <div
        v-for="(title, index) in weekDayTitles"
        :key="index"
        class="
          flex justify-center items-center
          h-[var(--date-picker-day-height)] w-[var(--date-picker-day-width)]
          min-h-[var(--date-picker-day-height)] min-w-[var(--date-picker-day-width)]
          max-h-[var(--date-picker-day-height)] max-w-[var(--date-picker-day-width)]
        "
      >
        <div>
          {{ title.toLocaleUpperCase() }}
        </div>
      </div>
    </div>

    <CalendarWeek
      v-for="(week, index) in weeks"
      :key="index"
      :start-of-month="startOfMonth"
      :start-of-week="week"
      :date-range="isEmpty || isBetweenRange ? undefined : dateRange"
      :is-between="isBetweenRange"
      :is-hover-enabled="isHoverEnabled"
      @click:day="$emit('click:day', $event)"
      @hover:day="$emit('hover:day', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import CalendarWeek from './CalendarWeek.vue'
import {getStartOfWeek, WeekDay, weekdayShortFormatter} from '@/utils/dateTime'
import type {DateRange} from '../models/types'

const props = defineProps<{
  startOfMonth: Date
  startDayOfWeek?: WeekDay
  dateRange?: DateRange
  isBetween?: boolean
  isHoverEnabled: boolean
}>()

defineEmits<{
  (e: 'click:day', value: Date): void
  (e: 'hover:day', value: Date): void
}>()

const startDayOfWeekPrepared = computed(() => props.startDayOfWeek || 1)

const startOfFirstWeek = computed(() => {
  return getStartOfWeek(props.startOfMonth, startDayOfWeekPrepared.value)
})

const weekDayTitles = computed<string[]>(() => {
  return Array(7).fill(undefined).map((_, index) => {
    const date = getStartOfWeek(new Date(), props.startDayOfWeek)

    date.setDate(date.getDate() + index)

    return weekdayShortFormatter.format(date)
  })
})

const weeks = computed<Date[]>(() => Array(6).fill(undefined).map((_, index) => {
  const date = new Date(startOfFirstWeek.value)

  date.setDate(date.getDate() + (index * 7))

  return date
}))

const startOfLastWeek = computed(() => weeks.value[weeks.value.length - 1])

const endOfLastWeek = computed(() => {
  const date = new Date(startOfLastWeek.value)

  date.setDate(date.getDate() + 7)

  return date
})

const isBeforeTo = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.to > endOfLastWeek.value
})

const isAfterFrom = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.from < startOfFirstWeek.value
})

const isBetweenRange = computed(() => {
  if (props.isBetween) return true

  return isBeforeTo.value && isAfterFrom.value
})

const isBeforeFrom = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.from > endOfLastWeek.value
})

const isAfterTo = computed(() => {
  if (!props.dateRange) return false

  return props.dateRange.to < startOfFirstWeek.value
})

const isEmpty = computed(() => {
  if (props.isBetween) return false
  if (!props.dateRange) return true

  return (isBeforeFrom.value && isBeforeTo.value) || (isAfterFrom.value && isAfterTo.value)
})

</script>
