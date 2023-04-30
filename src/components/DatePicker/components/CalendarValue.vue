<template>
  <div
    class="
      bg-gradient-to-tr from-primary-default to-[#C376FF] dark:from-primary-dark dark:to-[#9b3be6]
      relative w-full rounded-xl py-3 px-4 select-none
      text-default dark:text-default-dark
    "
    :class="{
      'w-ripple w-ripple-hover cursor-pointer': clickable,
    }"
    @click="updateCurrentDate"
  >
    <div class="mb-0.5 text-base font-normal tracking-wide">
      {{ title }}
    </div>

    <div
      class="text-base font-semibold tracking-wide"
      :class="{
        'opacity-50': !value,
      }"
    >
      {{ value ? dateFormat(value) : 'NONE' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount} from 'vue'
import {dateFormat, isSameMonth, getStartOfMonth} from '@/utils/dateTime'

const props = defineProps<{
  title: string
  currentDate: Date
  value?: Date
  autoFocus?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:currentDate', value: Date): void
}>()

const clickable = computed(() => props.value && !isSameMonth(props.value, props.currentDate))

const updateCurrentDate = () => {
  if (!props.value || !clickable.value) return

  emit('update:currentDate', getStartOfMonth(props.value))
}

onBeforeMount(() => {
  if (props.autoFocus) {
    updateCurrentDate()
  }
})

</script>
