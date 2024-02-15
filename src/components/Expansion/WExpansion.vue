<template>
  <Transition
    enter-active-class="transition-[grid-template-rows] overflow-hidden grid"
    enter-from-class="grid-rows-[0fr]"
    enter-to-class="grid-rows-[1fr]"
    leave-active-class="transition-[grid-template-rows] overflow-hidden grid"
    leave-from-class="grid-rows-[1fr]"
    leave-to-class="grid-rows-[0fr]"
  >
    <KeepAlive>
      <div
        v-if="isOpen"
        v-show="isShown"
        class="duration-[var(--expansion-duration,200ms)]"
      >
        <div class="[overflow:inherit]">
          <slot />
        </div>
      </div>
    </KeepAlive>
  </Transition>
</template>

<script lang="ts" setup>

withDefaults(
  defineProps<{
    isOpen?: boolean
    isShown?: boolean
  }>(),
  {
    isOpen: true,
    isShown: true,
  },
)


</script>