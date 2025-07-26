<template>
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

import {computed, ref, toRef, watch} from 'vue'

import {addDay, addMonth, addYear, getStartOfDay, getStartOfMonth, getStartOfWeek, monthShortFormatter} from '@/utils/dateTime'
import {useComponentStates} from '@/utils/useComponentStates'

import CalendarMonth from './components/CalendarMonth.vue'
import CalendarToggle from './components/CalendarToggle.vue'

const props = withDefaults(
  defineProps<{
    modelValue: Date | undefined
    title?: string
    minDate?: Date
    maxDate?: Date
    readonly?: boolean
    disabled?: boolean
    skeleton?: boolean
  }>(),
  {
    title: undefined,
    minDate: undefined,
    maxDate: undefined,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const {isReadonly, isDisabled, isSkeleton} = useComponentStates(props)

const emit = defineEmits<{
  (e: 'update:model-value', value: Date | undefined): void
}>()

const currentDate = ref(getStartOfMonth())
const dateRange = ref<DateRange | undefined>(undefined)
const preselectedValue = ref<Date | null>(null)
const isDirect = ref(false)
const today = ref(getStartOfDay())

const year = computed<number>(() => currentDate.value.getFullYear())

const setCurrentDate = (value: Date): void => {
  isDirect.value = value > currentDate.value
  currentDate.value = value
}

const onClickDay = (value: Date): void => {
  emit('update:model-value', value)
}

const firstDay = computed(() => getStartOfWeek(currentDate.value))
const lastDay = computed(() => addDay(firstDay.value, 41))

const isSameCalendarPage = (value: Date) => {
  return value >= firstDay.value && value <= lastDay.value
}

watch(toRef(props, 'modelValue'), modelValue => {
  dateRange.value = modelValue ? {from: modelValue, to: modelValue} : undefined

  if (!modelValue) return

  if (!isSameCalendarPage(modelValue)) {
    setCurrentDate(getStartOfMonth(modelValue))
  }
}, {immediate: true})
</script>
