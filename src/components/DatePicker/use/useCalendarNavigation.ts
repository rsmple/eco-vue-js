import {computed, ref, watch} from 'vue'

import {addDay, addMonth, addYear, getStartOfMonth, getStartOfWeek} from '@/utils/dateTime'

export const useCalendarNavigation = (props: {minDate?: Date, maxDate?: Date}) => {
  const minMonth = computed<Date | undefined>(() => props.minDate ? getStartOfMonth(props.minDate) : undefined)
  const maxMonth = computed<Date | undefined>(() => props.maxDate ? getStartOfMonth(props.maxDate) : undefined)

  const clampMonth = (value: Date): Date => {
    if (minMonth.value && value < minMonth.value) return new Date(minMonth.value)
    if (maxMonth.value && value > maxMonth.value) return new Date(maxMonth.value)

    return value
  }

  const currentDate = ref(clampMonth(getStartOfMonth()))
  const isDirect = ref(false)

  const year = computed<number>(() => currentDate.value.getFullYear())

  const setCurrentDate = (value: Date): void => {
    const startOfMonth = clampMonth(getStartOfMonth(value))

    if (startOfMonth.getTime() === currentDate.value.getTime()) return

    isDirect.value = startOfMonth > currentDate.value
    currentDate.value = startOfMonth
  }

  const isPreviousDisabled = computed<boolean>(() => !!minMonth.value && currentDate.value <= minMonth.value)
  const isNextDisabled = computed<boolean>(() => !!maxMonth.value && currentDate.value >= maxMonth.value)

  const toPreviousMonth = (): void => setCurrentDate(addMonth(currentDate.value, -1))
  const toNextMonth = (): void => setCurrentDate(addMonth(currentDate.value, 1))
  const toPreviousYear = (): void => setCurrentDate(addYear(currentDate.value, -1))
  const toNextYear = (): void => setCurrentDate(addYear(currentDate.value, 1))

  const firstDay = computed(() => getStartOfWeek(currentDate.value))
  const lastDay = computed(() => addDay(firstDay.value, 41))

  const isSameCalendarPage = (value: Date): boolean => {
    return value >= firstDay.value && value <= lastDay.value
  }

  watch([minMonth, maxMonth], () => {
    setCurrentDate(currentDate.value)
  })

  return {
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
  }
}
