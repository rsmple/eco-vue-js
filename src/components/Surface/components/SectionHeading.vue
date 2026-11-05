<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
    <div class="mr-auto grid gap-1">
      <div
        v-if="eyebrow"
        class="text-description text-xs font-semibold tracking-wider uppercase"
      >
        {{ eyebrow }}
      </div>

      <component
        :is="nested ? 'h3' : 'h2'"
        class="font-semibold"
        :class="[nested ? 'text-base' : 'text-xl', toned ? 'text-tone' : 'text-accent']"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </component>

      <p
        v-if="description || $slots.description"
        class="text-description max-w-prose text-sm text-pretty"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </p>
    </div>

    <slot name="actions" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string
  eyebrow?: string
  description?: string
  nested: boolean
  toned?: boolean
}>()

defineSlots<{
  title?: () => void
  description?: () => void
  actions?: () => void
}>()
</script>
