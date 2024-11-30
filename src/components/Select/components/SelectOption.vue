<template>
  <div
    ref="element"
    class="relative grid w-full grid-cols-[auto,1fr,2.5rem] px-[1.0625rem] py-2"
    :class="{
      'bg-primary-light dark:bg-primary-darkest': isSelected,
      'before:opacity-5': !loading && isCursor && !skeleton,
      'cursor-progress': loading || skeleton,
      'w-ripple': !loading && !skeleton,
    }"
    @mousedown.prevent.stop=""
    @click.prevent.stop="toggle"
  >
    <slot name="prefix" />

    <div
      class="col-start-2 flex items-center overflow-hidden"
      :class="{
        'col-span-2': hideOptionIcon,
      }"
    >
      <slot :selected="isSelected" />
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="!hideOptionIcon && (isSelected || loading)"
        class="text-primary-default dark:text-primary-dark col-start-3 flex items-center justify-center [--spinner-size:1.5rem]"
      >
        <IconCheck v-if="isSelected && !loading" />
        <WSpinner v-else-if="loading" />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string">
import {onUnmounted, ref, watch, watchEffect} from 'vue'

import WSpinner from '@/components/Spinner/WSpinner.vue'

import IconCheck from '@/assets/icons/default/IconCheck.svg?component'

const props = defineProps<{
  isSelected: boolean
  isCursor?: boolean
  loading?: boolean
  skeleton?: boolean
  scroll?: boolean
  first?: boolean
  last?: boolean
  previous?: Model | null
  next?: Model | null
  isNoCursor?: boolean
  hideOptionIcon?: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'unselect'): void
  (e: 'update:is-cursor', value: {previous: Model | null | undefined, next: Model | null | undefined}): void
  (e: 'update:cursor'): void
  (e: 'update:previous', value: Model | null | undefined): void
  (e: 'update:next', value: Model | null | undefined): void
  (e: 'unmounted'): void
  (e: 'update:first'): void
  (e: 'update:last'): void
}>()

const element = ref<HTMLDivElement>()

const toggle = (): void => {
  if (props.skeleton || props.loading) return

  if (props.isSelected) emit('unselect')
  else emit('select')
}

const scrollIntoView = () => {
  element.value?.scrollIntoView({behavior: 'auto', block: 'center'})
}

watch(() => props.isCursor, value => {
  if (!value) return

  emit('update:is-cursor', {previous: props.previous, next: props.next})

  if (props.scroll) scrollIntoView()
}, {immediate: true})

watchEffect(() => {
  if (props.isNoCursor && props.first && !props.skeleton) {
    emit('update:cursor')
  }
})

watch(() => props.previous, value => {
  if (props.isCursor && !props.skeleton) emit('update:previous', value)
}, {immediate: true})

watch(() => props.next, value => {
  if (props.isCursor && !props.skeleton) emit('update:next', value)
}, {immediate: true})

watch(() => props.first, value => {
  if (value) emit('update:first')
}, {immediate: true})

watch(() => props.last, value => {
  if (value) emit('update:last')
}, {immediate: true})

watch(() => props.next, value => {
  if (props.isCursor && !props.skeleton) emit('update:next', value)
}, {immediate: true})

onUnmounted(() => {
  if (props.isCursor) emit('unmounted')
})

defineExpose({
  scrollIntoView,
})

defineSlots<{
  default: (props: {selected: boolean}) => void
  prefix: () => void
}>()
</script>
