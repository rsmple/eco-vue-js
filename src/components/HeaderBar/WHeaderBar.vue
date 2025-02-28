<template>
  <div
    ref="element"
    class="-h--header-height fixed inset-x-0 top-0 z-10 flex print:hidden"
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
      v-show="!isSearchVisible && !search"
      class="-pl--inner-margin xl-not:pl-[3.75rem] relative flex max-w-full flex-1 items-center"
      :class="{
        '-pr--inner-margin': !searchEnabled
      }"
    >
      <div class="text-accent sm:text-2.5xl flex-1 truncate text-xl font-semibold">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <button
        v-if="searchEnabled"
        class="w-hover-circle-trigger -px--inner-margin flex h-full select-none items-center outline-none"
        @click="openSearch"
      >
        <div class="w-hover-circle relative">
          <IconSearch class="square-6 sm-not:square-5 text-accent" />
        </div>
      </button>
    </div>

    <div
      v-if="searchEnabled"
      v-show="isSearchVisible || search"
      class="-pl--inner-margin xl-not:pl-[3.75rem] -pr--inner-margin relative flex w-full flex-1 items-center gap-2"
    >
      <WInputSuggest
        v-if="$slots.search && isMobile"
        ref="input"
        :model-value="search"
        placeholder="Search.."
        allow-clear
        persist
        teleport
        no-margin
        class="w-full"
        :icon="markRaw(IconSearch)"
        @click:clear="!isMobile && inputRef?.close()"
        @close="closeSearch"
        @update:model-value="$emit('update:search', $event)"
      >
        <template
          v-if="isMobile"
          #content
        >
          <slot name="search" />
        </template>
      </WInputSuggest>

      <template v-else>
        <WInput
          ref="input"
          :model-value="search"
          placeholder="Search.."
          autofocus
          allow-clear
          no-margin
          class="w-full"
          :icon="markRaw(IconSearch)"
          @click:clear="closeSearch"
          @close="$route.meta.headerSearchComponent && closeSearch()"
          @update:model-value="$emit('update:search', $event)"
        />

        <slot name="search" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, nextTick, onBeforeUnmount, onMounted, ref, toRef, useTemplateRef, watch} from 'vue'

import WInput from '@/components/Input/WInput.vue'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import IconSearch from '@/assets/icons/sax/IconSearch.svg?component'

import {useIsMobile} from '@/utils/mobile'

import {useHeader} from './use/useHeader'

const props = withDefaults(
  defineProps<{
    title?: string
    search?: string
    searchEnabled?: boolean
  }>(),
  {
    title: undefined,
    search: undefined,
  },
)

defineEmits<{
  (e: 'update:search', value: string | undefined): void
}>()

const {isMobile} = useIsMobile()

const {headerPadding, updateHeaderHeight} = useHeader()
const elementRef = useTemplateRef('element')
const inputRef = useTemplateRef<ComponentInstance<typeof WInputSuggest>>('input')

const isTransparent = ref(false)
const isSearchVisible = ref(false)

const openSearch = (): void => {
  isSearchVisible.value = true

  nextTick().then(() => inputRef.value?.focus())
}

const closeSearch = (): void => {
  isSearchVisible.value = false
}

watch(toRef(props, 'searchEnabled'), value => {
  if (value) return

  isSearchVisible.value = false
})

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
