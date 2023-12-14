<template>
  <div
    ref="element"
    class="relative flex w-full select-none cursor-pointer py-2 px-[1.0625rem]"
    :class="{
      'bg-primary-light dark:bg-primary-darkest': isSelected,
      'before:opacity-5': isCursor && !skeleton,
      'cursor-progress': loading || skeleton,
      'w-ripple': !loading && !skeleton,
    }"
    @mousedown.prevent.stop=""
    @click.prevent.stop="toggle"
  >
    <div class="flex items-center max-w-[calc(100%-2.5rem)] flex-1 overflow-hidden">
      <slot :selected="isSelected" />
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isSelected || loading"
        class="flex items-center justify-center text-primary-default dark:text-primary-dark w-10 [--spinner-size:1.5rem]"
      >
        <IconCheck v-if="isSelected && !loading" />
        <WSpinner v-else-if="loading" />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {onUnmounted, ref, toRef, watch} from 'vue'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import WSpinner from '@/components/Spinner/WSpinner.vue'

const props = defineProps<{
  isSelected: boolean
  isCursor?: boolean
  loading?: boolean
  skeleton?: boolean
  scroll?: boolean
  first?: boolean
  last?: boolean
  previous?: number | null
  next?: number | null
  isNoCursor?: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'unselect'): void
  (e: 'update:is-cursor', value: {previous: number | null | undefined, next: number | null | undefined}): void
  (e: 'update:cursor'): void
  (e: 'update:previous', value: number | null | undefined): void
  (e: 'update:next', value: number | null | undefined): void
  (e: 'unmounted'): void
  (e: 'update:first'): void
  (e: 'update:last'): void
}>()

const element = ref<HTMLDivElement>()

const toggle = () => {
  if (props.isSelected) emit('unselect')
  else emit('select')

  return false
}

const scrollIntoView = () => {
  element.value?.scrollIntoView({behavior: 'auto', block: 'center'})
}

watch(toRef(props, 'isCursor'), value => {
  if (!value) return

  emit('update:is-cursor', {previous: props.previous, next: props.next})

  if (props.scroll) scrollIntoView()
}, {immediate: true})

watch(toRef(props, 'isNoCursor'), value => {
  if (value && props.first && !props.skeleton) emit('update:cursor')
}, {immediate: true})

watch(toRef(props, 'previous'), value => {
  if (props.isCursor && !props.skeleton) emit('update:previous', value)
}, {immediate: true})

watch(toRef(props, 'next'), value => {
  if (props.isCursor && !props.skeleton) emit('update:next', value)
}, {immediate: true})

watch(toRef(props, 'first'), value => {
  if (value) emit('update:first')
}, {immediate: true})

watch(toRef(props, 'last'), value => {
  if (value) emit('update:last')
}, {immediate: true})

watch(toRef(props, 'next'), value => {
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
}>()

</script>
