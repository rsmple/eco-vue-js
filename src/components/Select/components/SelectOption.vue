<template>
  <div
    ref="element"
    class="flex w-full select-none cursor-pointer py-2 px-4 first:pt-4 last:pb-4 hover:bg-gray-50 hover:dark:bg-gray-700"
    :class="{
      'bg-primary-light dark:bg-primary-darkest': isSelected,
      'bg-gray-50 dark:bg-gray-700': isCursor,
    }"
    @mousedown.prevent.stop=""
    @click.prevent.stop="toggle"
  >
    <div class="flex items-center max-w-[calc(100%-2.5rem)] flex-1 overflow-hidden">
      <slot :selected="isSelected" />
    </div>

    <Transition
      enter-active-class="fade-enter-active"
      leave-active-class="fade-leave-active"
      enter-from-class="fade-enter-from"
      leave-to-class="fade-leave-to"
    >
      <div
        v-if="isSelected"
        class="flex items-center justify-center text-primary-default dark:text-primary-dark w-10"
      >
        <IconCheck />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {watch, toRef, ref} from 'vue'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'

const props = defineProps<{
  isSelected?: boolean
  isCursor?: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'unselect'): void
}>()

const element = ref<HTMLDivElement>()

const toggle = () => {
  if (props.isSelected) emit('unselect')
  else emit('select')

  return false
}

watch(toRef(props, 'isCursor'), value => {
  if (!value) return

  element.value?.scrollIntoView({behavior: 'auto', block: 'center'})
})

</script>
