<template>
  <div class="flex items-center h-8 w-full my-2">
    <div
      class="
        relative flex justify-center items-center square-8
        rounded-xl cursor-pointer select-none w-ripple mr-auto
        hover:bg-primary-default hover:dark:bg-primary-dark hover:text-default text-description
      "
      @click="$emit('click:previous')"
    >
      <IconArrow class="rotate-90 -ml-1" />
    </div>

    <div class="relative overflow-hidden">
      <Transition
        enter-active-class="transition-transform duration-[250ms] w-full"
        leave-active-class="transition-transform duration-[250ms] w-full absolute top-0"
        enter-from-class="translate-x-[calc(100%*var(--direction-factor))]"
        leave-to-class="translate-x-[calc(100%*var(--direction-factor)*-1)]"
      >
        <div
          :key="text"
          class="text-base text-accent font-medium select-none text-center w-14"
        >
          {{ text }}
        </div>
      </Transition>
    </div>

    <div
      class="
        relative flex justify-center items-center square-8
        rounded-xl cursor-pointer select-none w-ripple ml-auto
        hover:bg-primary-default hover:dark:bg-primary-dark hover:text-default text-description
      "
      @click="$emit('click:next')"
    >
      <IconArrow class="-rotate-90 -mr-1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconArrow from '@/assets/icons/default/IconArrow.svg?component'

defineProps<{
  text: string
}>()

defineEmits<{
  (e: 'click:next'): void
  (e: 'click:previous'): void
}>()

</script>
