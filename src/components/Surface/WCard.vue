<template>
  <component
    :is="tag"
    class="surface-card grid gap-2"
  >
    <div
      v-if="title || $slots.title || $slots.actions"
      class="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <h3 class="text-accent mr-auto font-semibold">
        <slot name="title">
          {{ title }}
        </slot>
      </h3>

      <slot name="actions" />
    </div>

    <slot />
  </component>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    /** Heading of the card. The `title` slot replaces it. */
    title?: string
    /** Element to render. */
    tag?: string
  }>(),
  {
    title: undefined,
    tag: 'div',
  },
)

defineSlots<{
  /** Content of the card. */
  default?: () => void
  /** Heading of the card, in place of `title`. */
  title?: () => void
  /** Buttons beside the heading. */
  actions?: () => void
}>()
</script>
