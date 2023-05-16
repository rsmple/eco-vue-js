<template>
  <div
    ref="element"
    class="flex w-full select-none cursor-pointer py-2 px-4 first:pt-4 last:pb-4"
    :class="{
      'bg-primary-light dark:bg-primary-darkest': isSelected,
      'before:opacity-5': isCursor,
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
import {ref} from 'vue'
import IconCheck from '@/assets/icons/default/IconCheck.svg?component'
import WSpinner from '@/components/Spinner/WSpinner.vue'

const props = defineProps<{
  isSelected?: boolean
  isCursor?: boolean
  loading?: boolean
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

const scrollIntoView = () => {
  element.value?.scrollIntoView({behavior: 'auto', block: 'center'})
}

defineExpose({
  scrollIntoView,
})

</script>
