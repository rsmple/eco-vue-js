<template>
  <div
    class="flex relative justify-center items-center cursor-pointer my-[1px] select-none height-9 flex-1 w-ripple-trigger"
    :class="{
      'text-accent': !isSelected && !isOutOfMonth,
      'text-description': !isSelected && isOutOfMonth,
      'text-default dark:text-default-dark selected': isSelected,
      'cursor-not-allowed': disabled,
      'hover-enabled': isHoverEnabled,
    }"
    @click="!disabled && $emit('click:day', startOfDay)"
    @mouseenter="!disabled && isHoverEnabled && $emit('hover:day', startOfDay)"
  >
    <div
      v-show="isBetweenRange || (isFrom || isTo && !(isFrom && isTo))"
      class="absolute opacity-50 h-9"
      :class="{
        'border-y border-solid border-primary-default': isHoverEnabled,
        'bg-primary-default dark:bg-primary-dark': !isHoverEnabled,
        'w-full': isBetweenRange,
        'w-1/2 left-1/2': isFrom && !isTo,
        'w-1/2 right-1/2': !isFrom && isTo,
      }"
    />

    <div
      class="relative flex justify-center items-center rounded-full square-9"
      :class="{
        'w-ripple w-ripple-hover': !disabled,
        'bg-primary-default dark:bg-primary-dark font-semibold': isSelected,
      }"
    >
      <div class="text-base font-normal">
        {{ startOfDay.getDate() }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {isSameDate} from '@/utils/dateTime'
import type {DateRange} from '../models/types'

const props = defineProps<{
  startOfMonth: Date
  startOfDay: Date
  dateRange?: DateRange
  isBetween: boolean
  isWeekOutOfMonth: boolean
  disabled?: boolean
  isHoverEnabled: boolean
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

</script>
