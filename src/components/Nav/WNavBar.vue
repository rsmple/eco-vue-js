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
        bg-primary-light/40 dark:bg-primary-darkest/40 no-scrollbar fixed left-0 top-0 size-full
        overflow-y-auto overflow-x-hidden overscroll-contain backdrop-blur print:hidden
      "
      :style="{zIndex: BASE_ZINDEX_NAV_BAR}"
      @click.stop.prevent="close"
    >
      <div class="h-[calc(100%+1px)]" />
    </div>
  </Transition>

  <div
    class="
      fixed left-0 top-0 grid h-full overflow-hidden w-nav-bar
      transition-[grid-template-columns] duration-200 xl:grid-cols-[1fr] print:hidden 
    "
    :class="[{
      'xl-not:grid-cols-[0fr]': !isOpen,
      'grid-cols-[1fr]': isOpen,
    }, $attrs.class]"
    :style="{zIndex: BASE_ZINDEX_NAV_BAR}"
  >
    <div class="-mt--header-height overflow-hidden">
      <slot />
    </div>
  </div>

  <div
    class="-square--header-height w-ripple fixed left-0 top-0 flex cursor-pointer items-center justify-center xl:hidden print:hidden"
    :class="{'text-primary': isOpen}"
    :style="{zIndex: BASE_ZINDEX_NAV_BAR}"
    @click.stop="toggle"
  >
    <IconMenu />
  </div>
</template>

<script lang="ts" setup>
import {provide, ref} from 'vue'

import IconMenu from '@/assets/icons/IconMenu.svg?component'

import {useIsMobile} from '@/utils/mobile'
import {BASE_ZINDEX_NAV_BAR, wBaseZIndex} from '@/utils/utils'

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

provide(wBaseZIndex, BASE_ZINDEX_NAV_BAR)

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
