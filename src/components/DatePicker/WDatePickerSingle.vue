<template>
  <div
    class="bg-default dark:bg-default-dark overflow-hidden rounded-xl border border-solid border-gray-300 py-3 dark:border-gray-700"
    :style="{'--direction-factor': isDirect ? '1' : '-1'}"
  >
    <div class="grid grid-cols-2 gap-8 px-3 pb-4">
      <CalendarToggle
        :text="monthShortFormatter.format(currentDate).toLocaleUpperCase()"
        :disabled-previous="isPreviousDisabled"
        :disabled-next="isNextDisabled"
        @click:previous="toPreviousMonth"
        @click:next="toNextMonth"
      />

      <CalendarToggle
        :text="year.toString()"
        :disabled-previous="isPreviousDisabled"
        :disabled-next="isNextDisabled"
        @click:previous="toPreviousYear"
        @click:next="toNextYear"
      />
    </div>

    <div class="relative">
      <Transition
        enter-active-class="transition-transform duration-250 w-full"
        leave-active-class="transition-transform duration-250 w-full absolute top-0"
        enter-from-class="translate-x-[calc(100%*var(--direction-factor))]"
        leave-to-class="translate-x-[calc(100%*var(--direction-factor)*-1)]"
      >
        <CalendarMonth
          :key="currentDate.toISOString()"
          :start-of-month="currentDate"
          :date-range="dateRange"
          :is-hover-enabled="preselectedValue !== null"
          :min-date="minDate"
          :max-date="maxDate"
          :today="today"
          :readonly="isReadonly || isDisabled || isSkeleton"
          class="px-3"
          @click:day="onClickDay"
        />
      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {DateRange} from './models/types'

import {ref, toRef, watch} from 'vue'

import {getStartOfDay, monthShortFormatter} from '@/utils/dateTime'
import {useComponentStates} from '@/utils/useComponentStates'

import CalendarMonth from './components/CalendarMonth.vue'
import CalendarToggle from './components/CalendarToggle.vue'
import {useCalendarNavigation} from './use/useCalendarNavigation'

const props = withDefaults(
  defineProps<{
    /** Picked day. The calendar opens at its month. */
    modelValue: Date | undefined
    /** First day that can be picked. The calendar doesn't go to earlier months. */
    minDate?: Date
    /** Last day that can be picked. The calendar doesn't go to later months. */
    maxDate?: Date
    /** Shows the calendar without picking a day. When unset, inherits the readonly state provided by a parent. */
    readonly?: boolean
    /** Shows the calendar without picking a day. When unset, inherits the disabled state provided by a parent. */
    disabled?: boolean
    /** Shows the calendar without picking a day. When unset, inherits the skeleton state provided by a parent. */
    skeleton?: boolean
  }>(),
  {
    minDate: undefined,
    maxDate: undefined,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const {isReadonly, isDisabled, isSkeleton} = useComponentStates(props)

const emit = defineEmits<{
  /** The clicked day, at the start of the day. */
  (e: 'update:model-value', value: Date | undefined): void
}>()

const {
  currentDate,
  isDirect,
  year,
  isPreviousDisabled,
  isNextDisabled,
  setCurrentDate,
  toPreviousMonth,
  toNextMonth,
  toPreviousYear,
  toNextYear,
  isSameCalendarPage,
} = useCalendarNavigation(props)

const dateRange = ref<DateRange | undefined>(undefined)
const preselectedValue = ref<Date | null>(null)
const today = ref(getStartOfDay())

const onClickDay = (value: Date): void => {
  emit('update:model-value', value)
}

watch(toRef(props, 'modelValue'), modelValue => {
  dateRange.value = modelValue ? {from: modelValue, to: modelValue} : undefined

  if (!modelValue) return

  if (!isSameCalendarPage(modelValue)) {
    setCurrentDate(modelValue)
  }
}, {immediate: true})
</script>
