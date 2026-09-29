<template>
  <Transition
    enter-active-class="transition-[grid-template-rows] overflow-y-hidden grid"
    enter-from-class="grid-rows-[0fr]"
    enter-to-class="grid-rows-[1fr]"
    leave-active-class="transition-[grid-template-rows] overflow-y-hidden grid"
    leave-from-class="grid-rows-[1fr]"
    leave-to-class="grid-rows-[0fr]"
    @before-enter="$emit('update:visible', true)"
    @after-leave="$emit('update:visible', false)"
  >
    <KeepAlive>
      <div
        v-if="isOpen"
        v-show="isShown"
        class="duration-(--expansion-duration,200ms)"
      >
        <div class="grid grid-cols-1 [overflow:inherit]">
          <slot />
        </div>
      </div>
    </KeepAlive>
  </Transition>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    /** Expands the content, animating its height. Collapsed content stays alive, keeping its state. */
    isOpen?: boolean
    /** Shows the content. `false` hides it at once, without the animation. */
    isShown?: boolean
  }>(),
  {
    isOpen: true,
    isShown: true,
  },
)

defineEmits<{
  /** `true` as the content starts to expand, `false` once it has collapsed. */
  (e: 'update:visible', value: boolean): void
}>()

defineSlots<{
  /** Content that expands and collapses. */
  default?: () => void
}>()
</script>