<template>
  <button
    :disabled="disabled"
    :class="{
      'w-hover-circle-trigger cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
    class="outline-none"
    @click="toggle"
  >
    <WDropdownMenu
      :is-open="isOpen"
      :max-height="210"
      :max-width="320"
      :horizontal-align="HorizontalAlign.LEFT_INNER"
      :update-align="false"
      teleport
    >
      <template #toggle>
        <div
          class="relative rounded-full square-6 sm-not:square-5 sm-not:my-0.5 flex items-center justify-center outline-none"
          :class="{
            'w-hover-circle': !disabled,
            'text-description': !isOpen,
            'text-primary-default dark:text-primary-dark': isOpen,
          }"
        >
          <IconMore class="rotate-90" />
        </div>
      </template>

      <template #content>
        <WClickOutside 
          class="-mr-[1.375rem] sm-not:-mr-6 bg-default dark:bg-default-dark rounded-xl shadow-md my-4 overflow-hidden dark:border dark:border-solid dark:border-gray-800"
          @click="close"
        >
          <slot />
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