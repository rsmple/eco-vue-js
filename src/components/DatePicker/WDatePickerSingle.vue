<template>
  <div>
    <div class="mb-4">
      <CalendarValue
        :title="title ?? 'Value:'"
        :value="modelValue"
        :current-date="currentDate"
        auto-focus
        @update:current-date="setCurrentDate"
      />
    </div>

    <div 
      class="bg-default dark:bg-default-dark border border-solid border-gray-300 dark:border-gray-700 rounded-xl py-3 overflow-hidden"
      :style="{'--direction-factor': isDirect ? '1' : '-1'}"
    >
      <div class="grid grid-cols-2 px-3 pb-4">
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
            class="px-3"
            @click:day="onClickDay"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, watch, toRef} from 'vue'
import {getStartOfMonth, addMonth, addYear, monthShortFormatter, getStartOfWeek, addDay} from '@/utils/dateTime'
import CalendarMonth from './components/CalendarMonth.vue'
import CalendarToggle from './components/CalendarToggle.vue'
import CalendarValue from './components/CalendarValue.vue'
import type {DateRange} from './models/types'

const props = defineProps<{
  modelValue: Date | undefined
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | undefined): void
}>()

const currentDate = ref(getStartOfMonth())
const dateRange = ref<DateRange | undefined>(undefined)
const preselectedValue = ref<Date | null>(null)
const isDirect = ref(false)

const year = computed<number>(() => currentDate.value.getFullYear())

const setCurrentDate = (value: Date): void => {
  isDirect.value = value > currentDate.value
  currentDate.value = value
}

const onClickDay = (value: Date): void => {
  emit('update:modelValue', value)
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
