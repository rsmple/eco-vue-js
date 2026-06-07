<template>
  <div
    v-bind="$attrs"
    ref="element"
    class="
      not-print:shadow-md bg-default text-black-default light relative isolate grid
      h-[29.62cm] w-[21.01cm] break-before-page grid-cols-1 grid-rows-[auto,1fr] overflow-hidden px-[1.3cm] py-[1.5cm]
    "
    :class="{
      '[counter-increment:page]': !empty,
    }"
  >
    <div
      v-if="(title && !topTitle) || ($slots.intro && !topTitle)"
      class="row-start-1 min-w-0"
    >
      <div
        v-if="title && !topTitle"
        class="mb-8 flex items-end justify-between gap-6 border-b border-gray-100 pb-4"
      >
        <div class="min-w-0">
          <div
            class="
              text-primary text-2xs mb-1.5 font-semibold uppercase tracking-[0.16em]
              [counter-increment:section] before:mr-1 before:[--tw-content:counters(section,'.',decimal-leading-zero)]
            "
          >
            <span
              v-if="eyebrow"
              class="text-gray-400"
            >— {{ eyebrow }}</span>
          </div>

          <h2 class="text-black-default text-4xl font-bold leading-none tracking-tight">
            {{ title }}
          </h2>
        </div>

        <div
          v-if="$slots.meta"
          class="shrink-0 text-right text-xs leading-relaxed text-gray-400"
        >
          <slot name="meta" />
        </div>
      </div>

      <div v-if="$slots.intro && !topTitle">
        <slot name="intro" />
      </div>
    </div>

    <div
      ref="container"
      class="row-start-2 overflow-hidden"
    >
      <slot name="header" />

      <slot v-bind="{updateOverflow, INNER_CLASS}" />
    </div>

    <div class="text-2xs absolute inset-x-[1.3cm] bottom-[0.85cm] grid grid-cols-[1fr,auto,1fr] items-center gap-4 text-gray-400">
      <div
        v-if="logoComponent || $slots.logo"
        class="grid grid-cols-[auto,1fr] items-center gap-3"
        :class="{
          'col-start-2 justify-self-center': centerLogo,
          'col-start-1': !centerLogo,
        }"
      >
        <slot name="logo">
          <component :is="logoComponent" />
        </slot>
      </div>

      <div
        v-if="!centerLogo && date"
        class="col-start-2 text-center"
      >
        {{ dateFormat(date) }}
      </div>

      <div
        v-if="!empty"
        class="col-start-3 justify-self-end font-semibold uppercase tracking-[0.12em]"
      >
        Page <span class="before:[--tw-content:counter(page)]" />
      </div>
    </div>

    <div
      v-if="title && topTitle"
      class="
        text-2xs before:text-primary absolute inset-x-[1.3cm] top-[0.9cm] font-semibold uppercase tracking-[0.16em]
        text-gray-400 [counter-increment:section] before:mr-1 before:[--tw-content:counters(section,'.',decimal-leading-zero)]
      "
    >{{ title }}</div>

    <div
      v-if="watermark"
      class="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center overflow-hidden"
    >
      <div class="rotate-[-60deg] text-center text-[10rem] font-semibold leading-none text-gray-400/10">
        {{ watermark }}
      </div>
    </div>
  </div>

  <WPage
    v-if="overflow.length !== 0"
    v-bind="$attrs"
    :prerendered="overflow"
    :title="title"
    top-title
    :eyebrow="eyebrow"
    :center-logo="centerLogo"
    :logo-component="logoComponent"
    :date="date"
    :empty="empty"
    :watermark="watermark"
  >
    <template
      v-if="$slots.header"
      #header
    >
      <slot name="header" />
    </template>

    <template
      v-if="$slots.logo"
      #logo
    >
      <slot name="logo" />
    </template>
  </WPage>
</template>

<script lang="ts" setup>
import {type Component, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {dateFormat} from '@/utils/dateTime'

import {usePageBreadcrumb} from './use/usePageBreadcrumbs'

const INNER_CLASS = 'w-page-inner'

const props = defineProps<{
  title?: string
  eyebrow?: string
  empty?: boolean
  centerLogo?: boolean
  logoComponent?: Component
  topTitle?: boolean
  date?: Date
  prerendered?: HTMLElement[]
  skeleton?: boolean
  watermark: string | undefined
}>()

const elementRef = useTemplateRef('element')
const containerRef = useTemplateRef('container')

const overflow = ref<HTMLElement[]>([])

const {setBreadcrumb, resetBreadcrumb, updateBreadcrumbs, setActive} = usePageBreadcrumb()
const {headerPadding, headerHeight} = useHeader()

const getElements = (item: HTMLElement, inner = false): HTMLElement[] => {
  return Array.from(item.children)
    .filter(item => item instanceof HTMLElement)
    .flatMap(item => inner && item.childElementCount > 1
      ? getElements(item)
      : item.className.includes(INNER_CLASS)
        ? getElements(item, true)
        : item,
    )
}

const updateOverflow = (): void => {
  if (!containerRef.value) return
  if (containerRef.value.scrollHeight <= containerRef.value.offsetHeight) {
    if (overflow.value.length) overflow.value = []

    return
  }

  const top = containerRef.value.offsetHeight + containerRef.value.offsetTop

  const result = getElements(containerRef.value)
    .filter((item, index) => index > 2 && item.offsetTop + item.offsetHeight > top && !overflow.value.includes(item))

  overflow.value.push(...result)
}

const isSimilar = (current: HTMLElement | null, element: HTMLElement | null): boolean => {
  return current?.tagName === element?.tagName && current?.className === current?.className
}

const moveElements = (value: HTMLElement[]) => {
  let wrapper: HTMLElement | null = null

  value.forEach(item => {
    if (item.parentElement?.className.includes(INNER_CLASS) && !isSimilar(wrapper, item.parentElement)) {
      wrapper = document.createElement(item.parentElement.tagName)

      wrapper.className = item.parentElement.className

      containerRef.value?.appendChild(wrapper)
    }

    if (item.parentElement?.parentElement?.className.includes(INNER_CLASS) && !isSimilar(wrapper, item.parentElement)) {
      wrapper = document.createElement(item.parentElement.tagName)

      wrapper.className = item.parentElement.className

      const parent = document.createElement(item.parentElement.parentElement.tagName)

      parent.className = item.parentElement.parentElement.className

      parent.appendChild(wrapper)

      containerRef.value?.appendChild(parent)
    }

    if (wrapper) wrapper.appendChild(item)
    else containerRef.value?.appendChild(item)
  })

  nextTick().then(updateOverflow)
}

const scrollTo = () => {
  if (!elementRef.value?.parentElement || !document.scrollingElement) return

  document.scrollingElement.scrollTo({top: elementRef.value.offsetTop - headerPadding.value - headerHeight.value})
}

const updateBreadcrumb = async () => {
  if (props.topTitle || !props.title) return

  await nextTick()

  if (!elementRef.value?.parentElement) return

  setBreadcrumb(
    props.title,
    Array.from(elementRef.value.parentElement.children).indexOf(elementRef.value),
    updateBreadcrumb,
    scrollTo,
  )
}

const observerCb = (entries: IntersectionObserverEntry[]) => {
  if (!elementRef.value?.parentElement) return

  const isIntersecting = entries.some(entry => {
    if (entry.target === elementRef.value) {
      return entry.isIntersecting
    }
  })

  if (isIntersecting) setActive(Array.from(elementRef.value.parentElement.children).indexOf(elementRef.value))
}

watch(() => props.prerendered, async value => {
  if (!value) return

  await nextTick()

  if (containerRef.value?.children.length) {
    Array.from(containerRef.value.children).forEach(item => containerRef.value?.removeChild(item))
  }

  await nextTick()

  moveElements(value)
})

watch(() => props.prerendered?.length, async () => {
  if (!props.prerendered) return

  await nextTick()

  moveElements(props.prerendered)
}, {immediate: true})

watch(() => props.skeleton, async value => {
  if (value) return

  await nextTick()

  updateOverflow()
}, {immediate: true})

let observer: IntersectionObserver | null = null

onMounted(() => {
  updateBreadcrumb()

  if (elementRef.value) {
    observer = new IntersectionObserver(observerCb, {
      root: null,
      rootMargin: `${ headerHeight.value * 2 }px 100% 0px 0px`,
      threshold: 0.5,
    })

    observer.observe(elementRef.value)
  }

  updateBreadcrumbs()
})

onBeforeUnmount(() => {
  if (!props.topTitle && props.title) resetBreadcrumb(props.title)

  observer?.disconnect()

  updateBreadcrumbs()
})
</script>
