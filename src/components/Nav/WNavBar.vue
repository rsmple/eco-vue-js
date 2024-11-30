<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen && hasBackdrop"
      title="Click to close"
      class="
        bg-primary-light/40 dark:bg-primary-darkest/40 no-scrollbar fixed left-0 top-0 z-30 size-full
        overflow-y-auto overflow-x-hidden overscroll-contain backdrop-blur print:hidden
      "
      @click.stop.prevent="close"
    >
      <div class="h-[calc(100%+1px)]" />
    </div>
  </Transition>

  <div
    class="
      xl-not:bg-default xl-not:dark:bg-default-dark fixed left-0 top-0 z-30 grid h-full overflow-hidden
      shadow-md transition-[grid-template-columns] duration-200 xl:grid-cols-[1fr] xl:shadow-none print:hidden 
    "
    :class="{
      'xl-not:grid-cols-[0fr]': !isOpen,
      'grid-cols-[1fr]': isOpen,
    }"
  >
    <div class="bg-default dark:bg-default-dark mt-[3.75rem] overflow-hidden">
      <slot />
    </div>
  </div>

  <div
    class="square-[3.75rem] w-ripple fixed left-0 top-0 z-30 flex cursor-pointer items-center justify-center xl:hidden print:hidden"
    :class="{'text-primary-default': isOpen}"
    @click.stop="toggle"
  >
    <IconMenu />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import IconMenu from '@/assets/icons/sax/IconMenu.svg?component'

import {isClientSide} from '@/utils/utils'

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const getHasBackdrop = () => {
  return isClientSide && window.innerWidth < 1280
}

const hasBackdrop = ref(getHasBackdrop())
const isOpen = ref(false)

const toggle = (): void => {
  hasBackdrop.value = getHasBackdrop()

  isOpen.value = !isOpen.value

  emit('update:isOpen', isOpen.value)
}

const close = (): void => {
  isOpen.value = false

  emit('update:isOpen', false)
}
</script>
