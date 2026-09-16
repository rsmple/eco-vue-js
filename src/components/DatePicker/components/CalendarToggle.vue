<template>
  <div class="my-2 flex h-8 w-full items-center">
    <div
      class="square-8 text-description relative mr-auto flex select-none items-center justify-center rounded-xl"
      :class="disabledPrevious
        ? 'cursor-not-allowed opacity-50'
        : 'w-ripple hover:bg-primary hover:dark:bg-primary-dark hover:text-default dark:hover:text-default cursor-pointer'"
      @click="!disabledPrevious && $emit('click:previous')"
    >
      <IconArrow class="-ml-1 rotate-90" />
    </div>

    <div class="relative overflow-hidden">
      <Transition
        enter-active-class="transition-transform duration-250 w-full"
        leave-active-class="transition-transform duration-250 w-full absolute top-0"
        enter-from-class="translate-x-[calc(100%*var(--direction-factor))]"
        leave-to-class="translate-x-[calc(100%*var(--direction-factor)*-1)]"
      >
        <div
          :key="text"
          class="text-accent w-14 select-none text-center font-medium"
        >
          {{ text }}
        </div>
      </Transition>
    </div>

    <div
      class="square-8 text-description relative ml-auto flex select-none items-center justify-center rounded-xl"
      :class="disabledNext
        ? 'cursor-not-allowed opacity-50'
        : 'w-ripple hover:bg-primary hover:dark:bg-primary-dark hover:text-default dark:hover:text-default cursor-pointer'"
      @click="!disabledNext && $emit('click:next')"
    >
      <IconArrow class="-mr-1 -rotate-90" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconArrow from '@/assets/icons/IconArrow.svg?component'

defineProps<{
  text: string
  disabledPrevious?: boolean
  disabledNext?: boolean
}>()

defineEmits<{
  (e: 'click:next'): void
  (e: 'click:previous'): void
}>()
</script>
