<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen && isTablet"
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
    <div class="bg-default dark:bg-default-dark -mt--header-height overflow-hidden">
      <slot />
    </div>
  </div>

  <div
    class="-square--header-height w-ripple fixed left-0 top-0 z-30 flex cursor-pointer items-center justify-center xl:hidden print:hidden"
    :class="{'text-primary-default': isOpen}"
    @click.stop="toggle"
  >
    <IconMenu />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import IconMenu from '@/assets/icons/sax/IconMenu.svg?component'

import {useIsMobile} from '@/utils/mobile'

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const {isTablet} = useIsMobile()

const isOpen = ref(false)

const emitIsOpen = () => {
  emit('update:isOpen', isOpen.value)
}

const toggle = () => {
  isOpen.value = !isOpen.value

  emitIsOpen()
}

const close = () => {
  isOpen.value = false

  emitIsOpen()
}
</script>
