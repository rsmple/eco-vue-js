<template>
  <component
    :is="tag"
    class="surface-section grid gap-4"
  >
    <div
      v-if="title || $slots.title || $slots.actions"
      class="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <h2 class="text-accent mr-auto text-xl font-semibold">
        <slot name="title">
          {{ title }}
        </slot>
      </h2>

      <slot name="actions" />
    </div>

    <slot />
  </component>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    /** Heading of the section. The `title` slot replaces it. */
    title?: string
    /** Element to render. */
    tag?: string
  }>(),
  {
    title: undefined,
    tag: 'section',
  },
)

defineSlots<{
  /** Content of the section. */
  default?: () => void
  /** Heading of the section, in place of `title`. */
  title?: () => void
  /** Buttons beside the heading. */
  actions?: () => void
}>()
</script>
