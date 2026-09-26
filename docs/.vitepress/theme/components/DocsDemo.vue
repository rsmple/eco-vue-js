<template>
  <div
    ref="element"
    class="demo vp-raw"
  >
    <div class="demo-content">
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
  </div>
</template>

<script lang="ts" setup>
import {type Component, onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

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

// The demo box is the scroll container its content measures against — `--w-width-inner` is 100vw in an app.
const elementRef = useTemplateRef('element')

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!elementRef.value) return

  // clientWidth: the scrollport, padding included and scrollbar excluded — what 100vw stands for in an app.
  observer = new ResizeObserver(() => {
    elementRef.value?.style.setProperty('--docs-demo-width', `${ elementRef.value.clientWidth }px`)
  })

  observer.observe(elementRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>
