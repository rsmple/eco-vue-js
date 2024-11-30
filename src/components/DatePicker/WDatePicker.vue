<template>
  <div>
    <div class="mb-4 grid grid-cols-2 gap-8">
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
      <div class="grid grid-cols-2 gap-8 px-3 pb-4">
        <CalendarToggle
          :text="monthShortFormatter.format(currentDate).toLocaleUpperCase()"
          @click:previous="setCurrentDate(addMonth(currentDate, -1))"
          @click:next="setCurrentDate(addMonth(currentDate, 1))"
        />

        <CalendarToggle
          :text="year.toString()"
          @click:previous="setCurrentDate(addYear(currentDate, -1))"
          @click:next="setCurrentDate(addYear(currentDate, 1))"
        />
      </div>

      <div class="relative">
        <Transition
          enter-active-class="transition-transform duration-[250ms] w-full"
          leave-active-class="transition-transform duration-[250ms] w-full absolute top-0"
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

import {computed, ref, toRef, watch} from 'vue'

import {addDay, addMonth, addYear, getStartOfMonth, getStartOfWeek, monthShortFormatter} from '@/utils/dateTime'

import CalendarMonth from './components/CalendarMonth.vue'
import CalendarToggle from './components/CalendarToggle.vue'
import CalendarValue from './components/CalendarValue.vue'

const props = defineProps<{
  modelValue: DateRange | undefined
  minDate?: Date
  maxDate?: Date
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange | undefined): void
}>()

const currentDate = ref(getStartOfMonth())
const dateRange = ref<DateRange | undefined>(props.modelValue)
const preselectedValue = ref<Date | null>(null)
const isDirect = ref(false)

const year = computed<number>(() => currentDate.value.getFullYear())

const setCurrentDate = (value: Date): void => {
  isDirect.value = value > currentDate.value
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

const firstDay = computed(() => getStartOfWeek(currentDate.value))
const lastDay = computed(() => addDay(firstDay.value, 41))

const isSameCalendarPage = (value: Date) => {
  return value >= firstDay.value && value <= lastDay.value
}

watch(toRef(props, 'modelValue'), modelValue => {
  dateRange.value = modelValue

  if (!modelValue) return

  if (!isSameCalendarPage(modelValue.from) && !isSameCalendarPage(modelValue.to)) {
    setCurrentDate(getStartOfMonth(modelValue.from))
  }
})
</script>
