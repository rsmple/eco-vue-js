<template>
  <div
    ref="element"
    class="-h--header-height fixed inset-x-0 top-0 grid grid-cols-1 print:hidden"
    :style="{zIndex: BASE_ZINDEX_HEADER_BAR}"
  >
    <div
      :key="headerPadding"
      class="bg-default dark:bg-default-dark supports-backdrop:backdrop-blur fixed inset-x-0 top-0 h-[calc(var(--header-height)+var(--header-height-padding))] print:hidden"
      :class="{
        'supports-backdrop:bg-opacity-40 supports-backdrop:dark:bg-opacity-60': isTransparent,
      }"
      :style="{'--header-height-padding': headerPadding + 'px'}"
    />

    <div
      v-show="!visible"
      class="-pl--inner-margin xl-not:-pl--header-height relative flex items-center"
      :class="{
        '-pr--inner-margin': !search
      }"
    >
      <div class="text-accent sm:text-2.5xl flex-1 truncate text-xl font-semibold">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <button
        v-if="search"
        class="w-ripple-trigger sm:-pr--inner-margin h-full select-none"
        @click="updateVisible(true)"
      >
        <div class="w-ripple w-ripple-hover sm-not:-px--inner-margin relative flex h-full items-center px-[--w-list-padding,1rem]">
          <IconSearch class="square-[1.25em] text-accent" />
        </div>
      </button>
    </div>

    <div
      v-if="search"
      v-show="visible"
      class="xl-not:-pl--header-height -px--inner-margin grid items-center"
    >
      <component
        :is="slot"
        v-for="(slot, index) in search"
        :key="index"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, provide, ref, useTemplateRef} from 'vue'

import IconSearch from '@/assets/icons/IconSearch.svg?component'

import {BASE_ZINDEX_HEADER_BAR, wBaseZIndex} from '@/utils/utils'

import {useHeader} from './use/useHeader'
import {useHeaderSearch} from './use/useHeaderSearch'
import {useHeaderSearchVisible} from './use/useHeaderSearchVisible'

defineProps<{
  title?: string
}>()

defineEmits<{
  (e: 'update:search', value: string | undefined): void
}>()

provide(wBaseZIndex, BASE_ZINDEX_HEADER_BAR)

const {headerPadding, updateHeaderHeight} = useHeader()
const {search} = useHeaderSearch()
const {visible, updateVisible} = useHeaderSearchVisible()
const elementRef = useTemplateRef('element')

const isTransparent = ref(false)

let timeout: NodeJS.Timeout | undefined

onMounted(() => {
  timeout = setTimeout(() => {
    isTransparent.value = true
    timeout = undefined
  }, 1500)

  updateHeaderHeight(elementRef.value?.offsetHeight ?? 0)
})

onBeforeUnmount(() => {
  if (!timeout) return

  clearTimeout(timeout)
  timeout = undefined
})
</script>
