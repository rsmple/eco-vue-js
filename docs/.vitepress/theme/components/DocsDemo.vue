<template>
  <div class="demo vp-raw">
    <ClientOnly v-if="component && clientOnly">
      <component :is="component" />
    </ClientOnly>
    <component
      :is="component"
      v-else-if="component"
    />
    <p
      v-else
      class="text-negative"
    >
      Example not found: {{ name }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type {Component} from 'vue'

const props = defineProps<{
  name: string
  /** For examples whose components touch browser-only APIs during setup. */
  clientOnly?: boolean
}>()

// Eager so demos render during SSR and their markup lands in the static HTML.
const examples = import.meta.glob<{default: Component}>(['../../../../src/components/*/docs/examples/*.vue', '../../../examples/**/*.vue'], {eager: true})

const resolve = (name: string): Component | undefined => {
  const [folder, file] = name.split('/', 2)

  return (examples[`../../../../src/components/${ folder }/docs/examples/${ file }.vue`] ?? examples[`../../../examples/${ name }.vue`])?.default
}

const component = resolve(props.name)
</script>
