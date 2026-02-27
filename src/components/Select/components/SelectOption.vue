<template>
  <div
    ref="element"
    class="w-select-option relative grid w-full grid-cols-[auto,1fr,1.25em]"
    :class="{
      'bg-primary-light/30 dark:bg-primary-darkest/30': isSelected,
      'before:opacity-5': !loading && isCursor && !skeleton && !disabled,
      'cursor-progress': loading || skeleton,
      'w-ripple': !loading && !skeleton && !disabled,
      'cursor-not-allowed': disabled,
    }"
    @mousedown.prevent.stop
    @click.prevent.stop="toggle"
    @mouseenter="$emit('mouseenter', $event)"
  >
    <slot name="prefix" />

    <div
      class="-pr--w-option-padding col-start-2 flex items-center overflow-hidden"
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
        class="text-primary dark:text-primary-dark w-spinner-size-[1.25em] col-start-3 flex items-center justify-self-end"
      >
        <IconCheck
          v-if="isSelected && !loading"
          class="square-[1.25em]"
        />
        <WSpinner v-else-if="loading" />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string">
import {onUnmounted, toRef, useTemplateRef, watch, watchEffect} from 'vue'

import WSpinner from '@/components/Spinner/WSpinner.vue'

import IconCheck from '@/assets/icons/IconCheck.svg?component'

import {getScrollParent} from '@/utils/utils'

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
  disabled?: boolean
  index: number
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
  (e: 'mouseenter', value: MouseEvent): void
}>()

const elementRef = useTemplateRef('element')

const toggle = (): void => {
  if (props.skeleton || props.loading || props.disabled) return

  if (props.isSelected) emit('unselect')
  else emit('select')
}

const toggleCursor = (): void => {
  if (!props.isCursor) return

  toggle()
}

const scrollIntoView = () => {
  if (!elementRef.value) return

  const parent = getScrollParent(elementRef.value)

  if (!parent) return

  parent.scrollTo({top: elementRef.value.getBoundingClientRect().top - parent.getBoundingClientRect().top})
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
  toggleCursor,
  index: toRef(props, 'index'),
})

defineSlots<{
  default: (props: {selected: boolean}) => void
  prefix: () => void
}>()
</script>
