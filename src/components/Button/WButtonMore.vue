<template>
  <button
    :disabled="disabled"
    :class="{
      'w-hover-circle-trigger cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
    class="outline-none flex justify-center"
    @click="toggle"
  >
    <WDropdownMenu
      :is-open="isOpen"
      :max-height="210"
      :max-width="320"
      :horizontal-align="HorizontalAlign.LEFT_INNER"
      :update-align="false"
      teleport
      no-z-index
    >
      <template #toggle>
        <div
          class="relative p-px"
          :class="{
            'w-hover-circle': !disabled,
            'text-description': !isOpen,
            'text-primary-default dark:text-primary-dark': isOpen,
          }"
        >
          <component :is="icon ?? IconMore" />
        </div>
      </template>

      <template #content>
        <WClickOutside
          class="
            -mr-[1.375rem] sm-not:-mr-6 bg-default dark:bg-default-dark rounded-xl shadow-md
            my-4 overflow-hidden dark:border dark:border-solid dark:border-gray-800 text-start font-normal
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
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import IconMore from '@/assets/icons/default/IconMore.svg?component'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'

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