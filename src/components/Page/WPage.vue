<template>
  <div
    ref="element"
    class="
      not-print:shadow-md bg-default text-black-default light relative isolate grid
      h-[29.62cm] w-[21.01cm] break-before-page grid-cols-1 grid-rows-[auto,1fr] overflow-hidden px-[1cm] py-[2cm]
    "
    :class="{
      '[counter-increment:page] after:absolute after:bottom-[1cm] after:right-[1cm] after:text-xs after:[--tw-content:counter(page)]': !empty,
    }"
  >
    <div
      v-if="title && !topTitle"
      class="mb-8"
    >
      <WPageTitle
        :title="title"
        big
      />
    </div>

    <div
      ref="container"
      class="row-start-2 overflow-hidden"
    >
      <slot name="header" />

      <slot v-bind="{updateOverflow, INNER_CLASS}" />
    </div>

    <div
      v-if="logoComponent || $slots.logo"
      class="absolute bottom-[1cm] left-[1cm] flex items-center justify-center gap-3"
      :class="{
        'right-[1cm]': centerLogo,
      }"
    >
      <slot name="logo">
        <component :is="logoComponent" />
      </slot>
    </div>

    <div
      v-if="!centerLogo && date"
      class="absolute inset-x-[1cm] bottom-[1cm] text-center text-xs"
    >
      {{ dateFormat(date) }}
    </div>

    <span
      v-if="title && topTitle"
      class="absolute inset-x-[1cm] top-[1cm] text-xs font-semibold before:text-gray-400 before:[content:counters(section,'.',decimal-leading-zero)]"
    >&nbsp;{{ title }}</span>

    <div
      v-if="watermark"
      class="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center"
    >
      <div class="rotate-[-60deg] text-center text-[10rem] font-semibold leading-none text-gray-400/10">
        {{ watermark }}
      </div>
    </div>
  </div>

  <WPage
    v-if="overflow.length !== 0"
    :prerendered="overflow"
    :title="title"
    top-title
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
  </WPage>
</template>

<script lang="ts" setup>
import {type Component, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {dateFormat} from '@/utils/dateTime'

import WPageTitle from './WPageTitle.vue'
import {usePageBreadcrumb} from './use/usePageBreadcrumbs'

const INNER_CLASS = 'w-page-inner'

const props = defineProps<{
  title?: string
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

  // nextTick(() => {
  //   if (!elementRef.value?.parentElement) return

  //   setActive(Array.from(elementRef.value.parentElement.children).indexOf(elementRef.value))
  // })
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