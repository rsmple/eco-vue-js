<template>
  <div
    class="height-9 w-ripple-trigger relative my-px flex flex-1 select-none items-center justify-center"
    :class="{
      'text-accent': !isSelected && !isOutOfMonth,
      'text-description': !isSelected && isOutOfMonth,
      'text-default dark:text-default-dark selected': isSelected,
      'cursor-not-allowed': isDisabled,
      'cursor-pointer': !isDisabled && !readonly,
      'hover-enabled': isHoverEnabled,
    }"
    @click="!isDisabled && !readonly && $emit('click:day', startOfDay)"
    @mouseenter="!isDisabled && !readonly && isHoverEnabled && $emit('hover:day', startOfDay)"
  >
    <div
      v-show="isBetweenRange || (isFrom || isTo && !(isFrom && isTo)) || isDisabled"
      class="absolute h-9 opacity-50"
      :class="{
        'border-primary border-y border-solid': isHoverEnabled && !isDisabled,
        'bg-primary dark:bg-primary-dark': !isHoverEnabled && !isDisabled,
        'bg-gray-200 dark:bg-gray-700': isDisabled,
        'w-full': isBetweenRange || isDisabled,
        'left-1/2 w-1/2': isFrom && !isTo,
        'right-1/2 w-1/2': !isFrom && isTo,
      }"
    />

    <div
      class="square-9 relative flex items-center justify-center rounded-full"
      :class="{
        'w-ripple w-ripple-hover': !isDisabled && !readonly,
        'opacity-50': isDisabled,
        'bg-primary dark:bg-primary-dark text-default font-semibold': isSelected,
        'bg-negative dark:bg-negative-dark text-default font-semibold': !isSelected && isToday,
      }"
    >
      <div class="font-normal">
        {{ startOfDay.getDate() }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {DateRange} from '../models/types'

import {computed} from 'vue'

import {isSameDate} from '@/utils/dateTime'

const props = defineProps<{
  startOfMonth: Date
  startOfDay: Date
  dateRange?: DateRange
  isBetween: boolean
  isWeekOutOfMonth: boolean
  isHoverEnabled: boolean
  disabled?: boolean
  readonly?: boolean
  minDate?: Date
  maxDate?: Date
  isToday: boolean
}>()

defineEmits<{
  (e: 'click:day', value: Date): void
  (e: 'hover:day', value: Date): void
}>()

const isOutOfMonth = computed(() => {
  if (!props.isWeekOutOfMonth) return false

  return props.startOfDay.getMonth() !== props.startOfMonth.getMonth()
})

const isFrom = computed(() => {
  if (!props.dateRange) return false

  return isSameDate(props.startOfDay, props.dateRange.from)
})

const isTo = computed(() => {
  if (!props.dateRange) return false

  return isSameDate(props.startOfDay, props.dateRange.to)
})

const isSelected = computed(() => {
  if (!props.dateRange) return false

  return isFrom.value || isTo.value
})

const isBeforeTo = computed(() => {
  if (!props.dateRange) return false
  if (isSelected.value) return false

  return props.dateRange.to > props.startOfDay
})

const isAfterFrom = computed(() => {
  if (!props.dateRange) return false
  if (isSelected.value) return false

  return props.dateRange.from < props.startOfDay
})

const isBetweenRange = computed(() => {
  if (props.isBetween) return true
  if (isSelected.value) return false

  return isBeforeTo.value && isAfterFrom.value
})

const isDisabled = computed(() => {
  if (props.disabled) return true

  if (props.minDate) return props.minDate > props.startOfDay

  if (props.maxDate) return props.maxDate < props.startOfDay

  return false
})
</script>
