<template>
  <div>
    <div class="mb-4 grid grid-cols-2 gap-5">
      <CalendarValue
        title="From:"
        :value="dateRange?.from"
        :current-date="currentDate"
        auto-focus
        @update:current-date="setCurrentDate"
      />

      <CalendarValue
        title="To:"
        :value="dateRange?.to"
        :current-date="currentDate"
        @update:current-date="setCurrentDate"
      />
    </div>

    <div 
      class="bg-default dark:bg-default-dark overflow-hidden rounded-xl border border-solid border-gray-300 py-3 dark:border-gray-700"
      :style="{'--direction-factor': isDirect ? '1' : '-1'}"
    >
      <div class="grid grid-cols-2 gap-5 px-3 pb-4">
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
            :today="today && isSameMonth(today, currentDate) ? today : undefined"
            :readonly="isReadonly || isDisabled || isSkeleton"
            class="px-3"
            @click:day="onClickDay"
            @hover:day="setRange"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {DateRange} from './models/types'

import {ref, toRef, watch} from 'vue'

import {getStartOfDay, isSameMonth, monthShortFormatter} from '@/utils/dateTime'
import {useComponentStates} from '@/utils/useComponentStates'

import CalendarMonth from './components/CalendarMonth.vue'
import CalendarToggle from './components/CalendarToggle.vue'
import CalendarValue from './components/CalendarValue.vue'
import {useCalendarNavigation} from './use/useCalendarNavigation'

const props = withDefaults(
  defineProps<{
    modelValue: DateRange | undefined
    minDate?: Date
    maxDate?: Date
    readonly?: boolean
    disabled?: boolean
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
  (e: 'update:model-value', value: DateRange | undefined): void
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

const dateRange = ref<DateRange | undefined>(props.modelValue)
const preselectedValue = ref<Date | null>(null)

const today = ref(getStartOfDay())

const onClickDay = (value: Date): void => {
  if (!preselectedValue.value) {
    preselectedValue.value = value

    setRange(value)
  } else {
    setRange(value)

    preselectedValue.value = null

    emit('update:model-value', dateRange.value)

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

  if (!modelValue) return

  if (!isSameCalendarPage(modelValue.from) && !isSameCalendarPage(modelValue.to)) {
    setCurrentDate(modelValue.from)
  }
})
</script>
