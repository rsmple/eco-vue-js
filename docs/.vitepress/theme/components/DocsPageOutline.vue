<template>
  <nav
    v-if="headings.length"
    aria-labelledby="docs-page-outline-title"
    class="docs-page-outline"
  >
    <div class="docs-page-outline-content">
      <div
        id="docs-page-outline-title"
        aria-level="2"
        class="docs-page-outline-title"
        role="heading"
      >
        On this page
      </div>

      <a
        v-for="heading in headings"
        :key="heading.id"
        :href="`#${heading.id}`"
        class="docs-page-outline-link"
        :class="{'docs-page-outline-link-active': heading.id === activeId}"
      >
        {{ heading.title }}
      </a>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'

/**
 * The outline of a page outside VitePress's doc layout, which collects headings for its own outline only: the `##`
 * headings in `selector`, the one last scrolled past marked.
 */
const props = defineProps<{
  selector: string
}>()

const headings = ref<{id: string, title: string, el: HTMLElement}[]>([])
const activeId = ref<string | null>(null)

// The heading's text without VitePress's anchor link.
const getTitle = (el: HTMLElement) => [...el.childNodes]
  .filter(node => !(node instanceof HTMLElement && node.classList.contains('header-anchor')))
  .map(node => node.textContent)
  .join('')
  .trim()

const update = () => {
  // Past the header, with the gap a heading scrolled to by its link keeps above it.
  const offset = parseFloat(getComputedStyle(document.body).getPropertyValue('--header-height')) * 16 + 48

  activeId.value = headings.value.findLast(heading => heading.el.getBoundingClientRect().top <= offset)?.id ?? null
}

onMounted(() => {
  headings.value = [...document.querySelectorAll<HTMLElement>(`${ props.selector } h2[id]`)]
    .map(el => ({id: el.id, title: getTitle(el), el}))

  update()
  window.addEventListener('scroll', update, {passive: true})
})

onBeforeUnmount(() => window.removeEventListener('scroll', update))
</script>
