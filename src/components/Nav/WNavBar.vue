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
        fixed top-0 left-0 h-full w-full backdrop-blur bg-primary-light/40 dark:bg-primary-darkest/40
        z-30 overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain print:hidden
      "
      @click.stop.prevent="close"
    >
      <div class="h-[calc(100%+1px)]" />
    </div>
  </Transition>

  <div
    class="
      fixed z-30 top-0 left-0 h-full grid overflow-hidden transition-[grid-template-columns] duration-200
      shadow-md xl:shadow-none xl:grid-cols-[1fr] xl-not:bg-default xl-not:dark:bg-default-dark print:hidden 
    "
    :class="{
      'xl-not:grid-cols-[0fr]': !isOpen,
      'grid-cols-[1fr]': isOpen,
    }"
  >
    <div class="overflow-hidden mt-[3.75rem] bg-default dark:bg-default-dark">
      <slot />
    </div>
  </div>

  <div
    class="fixed top-0 left-0 xl:hidden flex square-[3.75rem] items-center justify-center cursor-pointer w-ripple z-30 print:hidden"
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
