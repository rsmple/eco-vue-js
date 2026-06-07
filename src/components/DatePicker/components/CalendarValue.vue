<template>
  <div
    class="relative w-full select-none rounded-xl bg-gradient-to-tr px-4 py-3"
    :class="[{
      'w-ripple w-ripple-hover cursor-pointer': clickable,
    }, semanticTypeBackgroundMap[SemanticType.PRIMARY]]"
    @click="updateCurrentDate"
  >
    <div class="mb-0.5 font-normal tracking-wide">
      {{ title }}
    </div>

    <div
      class="font-semibold tracking-wide"
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

import {SemanticType, useSemanticTypeBackgroundMap} from '@/utils/SemanticType'
import {dateFormat, getStartOfMonth, isSameMonth} from '@/utils/dateTime'

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

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()

onBeforeMount(() => {
  if (props.autoFocus) {
    updateCurrentDate()
  }
})
</script>
