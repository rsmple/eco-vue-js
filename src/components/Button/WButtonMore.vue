<template>
  <button
    v-bind="$attrs"
    :disabled="disabled"
    :class="{
      'w-hover-circle-trigger cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
    class="flex justify-center outline-none"
    @click="toggle"
  >
    <WDropdownMenu
      :is-open="isOpen"
      :max-height="210"
      :max-width="320"
      :horizontal-align="anchor ? HorizontalAlign.RIGHT_INNER : HorizontalAlign.LEFT_INNER"
      :update-align="false"
      :parent-element="anchor"
    >
      <template #toggle>
        <div
          class="relative"
          :class="{
            'w-hover-circle': !disabled,
            'text-description': !isOpen || anchor,
            'text-primary dark:text-primary-dark': isOpen && !anchor,
          }"
        >
          <component
            :is="icon ?? IconMore"
            class="square-[1.25em]"
          />
        </div>
      </template>

      <template #content="{isTop, isRight, isLeft}">
        <WClickOutside
          no-filter
          class="
            bg-default dark:bg-default-dark overflow-hidden
            rounded-xl text-start font-normal shadow-md dark:border dark:border-solid dark:border-gray-800
          "
          :class="{
            'sm-not:-mr-4 my-4 -mr-5': !anchor,
            'rounded-bl-none': anchor && isRight && isTop,
            'rounded-tl-none': anchor && isRight && !isTop,
            'rounded-br-none': anchor && isLeft && isTop,
            'rounded-tr-none': anchor && isLeft && !isTop,
          }"
          @click="close"
        >
          <slot />
        </WClickOutside>
      </template>
    </WDropdownMenu>
  </button>
</template>

<script lang="ts" setup>
import type {DropdownProps} from '../Dropdown/types'

import {readonly, ref} from 'vue'

import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconMore from '@/assets/icons/IconMore.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

const props = defineProps<{
  icon?: SVGComponent
  disabled?: boolean
  anchor?: DropdownProps['parentElement']
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isOpen = ref(false)

const toggle = (): void => {
  if (props.disabled) return

  isOpen.value = !isOpen.value

  if (!isOpen.value) emit('close')
}

const close = (): void => {
  isOpen.value = false

  emit('close')
}

const open = () => {
  isOpen.value = true
}

defineExpose({
  open,
  isOpen: readonly(isOpen),
})
</script>