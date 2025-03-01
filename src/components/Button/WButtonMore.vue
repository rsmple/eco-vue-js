<template>
  <button
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
      :horizontal-align="HorizontalAlign.LEFT_INNER"
      :update-align="false"
      :z-index="1"
      teleport
    >
      <template #toggle>
        <div
          class="relative"
          :class="{
            'w-hover-circle': !disabled,
            'text-description': !isOpen,
            'text-primary-default dark:text-primary-dark': isOpen,
          }"
        >
          <component
            :is="icon ?? IconMore"
            class="square-[1.25em]"
          />
        </div>
      </template>

      <template #content>
        <WClickOutside
          class="
            sm-not:-mr-6 bg-default dark:bg-default-dark my-4 mr-[-1.375rem] overflow-hidden
            rounded-xl text-start font-normal shadow-md dark:border dark:border-solid dark:border-gray-800
          "
          @click="close"
        >
          <slot :close="close" />
        </WClickOutside>
      </template>
    </WDropdownMenu>
  </button>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconMore from '@/assets/icons/default/IconMore.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

const props = defineProps<{
  icon?: SVGComponent
  disabled?: boolean
}>()

const isOpen = ref(false)

const toggle = (): void => {
  if (props.disabled) return

  isOpen.value = !isOpen.value
}

const close = (): void => {
  isOpen.value = false
}
</script>