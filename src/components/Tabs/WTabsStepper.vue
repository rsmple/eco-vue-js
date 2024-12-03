<template>
  <WTabs
    ref="tabs"
    v-bind="{
      ...props,
      customSlots: defaultSlots
    }"
    no-header
    @update:current="$emit('update:current', $event)"
    @update:current-index="current = $event; $emit('update:current-index', $event)"
    @update:current-title="$emit('update:current-title', $event)"
    @update:has-changes="$emit('update:has-changes', $event)"
    @update:tabs-length="tabsLength = $event"
  />
</template>

<script lang="ts" setup>
import type {TabsStepperProps} from './types'

import {computed, ref, useSlots, useTemplateRef, watch} from 'vue'

import WTabs from '@/components/Tabs/WTabs.vue'

import {Notify} from '@/utils/Notify'

const props = defineProps<TabsStepperProps>()

const emit = defineEmits<{
  (e: 'update:current', value: string): void
  (e: 'update:current-index', value: number): void
  (e: 'update:first', value: boolean): void
  (e: 'update:last', value: boolean): void
  (e: 'update:progress', value: number): void
  (e: 'update:has-changes', value: boolean): void
  (e: 'update:current-title', value: string): void
}>()

const slots = useSlots()

const tabsRef = useTemplateRef('tabs')

const defaultSlots = computed(() => props.customSlots ?? slots.default?.() ?? [])

const tabsLength = ref(0)
const current = ref<number>(0)

const first = computed<boolean>(() => current.value === 0)
const last = computed<boolean>(() => current.value === tabsLength.value - 1)

const progress = computed(() => 100 * (current.value + 1) / tabsLength.value)

const previous = (): void => {
  tabsRef.value?.previous()
}

const next = (): void => {
  const errorMessage = tabsRef.value?.validate(current.value)

  if (errorMessage) {
    Notify.warn({title: 'Form contains invalid values', caption: errorMessage.length < 200 ? errorMessage : undefined})

    return
  }

  tabsRef.value?.next()
}

watch(progress, value => {
  emit('update:progress', value)
}, {immediate: true})

watch(first, value => {
  emit('update:first', value)
}, {immediate: true})

watch(last, value => {
  emit('update:last', value)
}, {immediate: true})

defineExpose({
  next,
  previous,
})
</script>