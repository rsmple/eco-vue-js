<template>
  <div
    ref="element"
    class="demo vp-raw"
    :style="initialWidth ? {'--docs-demo-width': `${ initialWidth }px`} : undefined"
    :class="overflow ? 'overflow-auto overscroll-contain max-h-(--docs-demo-max-height)' : overflowHidden ? 'overflow-hidden' : undefined"
  >
    <div
      class="demo-content"
      :class="overflow ? 'sm:px-(--inner-margin) py-(--inner-margin)' : 'p-(--inner-margin)'"
    >
      <ClientOnly v-if="component && clientOnly">
        <component :is="component" />
      </ClientOnly>
      <component
        :is="component"
        v-else-if="component"
      />
      <p
        v-else
        class="tone-negative text-tone"
      >
        Example not found: {{ name }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {type Component, onBeforeUnmount, onMounted, provide, useTemplateRef} from 'vue'

import {wScrollingElement} from '@/components/InfiniteList/models/injection'

const props = defineProps<{
  name: string
  /** For examples whose components touch browser-only APIs during setup. */
  clientOnly?: boolean
  overflow?: boolean
  overflowHidden?: boolean
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

// Lists inside page and stick against the demo box, as they do inside a modal.
provide(wScrollingElement, elementRef)

// Demos share the page column, so after a navigation a demo starts at the width the last one measured. The
// measurement then changes nothing, instead of landing a frame later and restyling everything inside the demo.
const initialWidth = lastWidth

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!elementRef.value) return

  // clientWidth: the scrollport, padding included and scrollbar excluded — what 100vw stands for in an app.
  observer = new ResizeObserver(() => {
    if (!elementRef.value) return

    lastWidth = elementRef.value.clientWidth
    elementRef.value.style.setProperty('--docs-demo-width', `${ lastWidth }px`)
  })

  observer.observe(elementRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<script lang="ts">
let lastWidth: number | null = null
</script>
