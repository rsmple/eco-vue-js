<template>
  <div class="fixed top-0 right-0 left-0 z-10 h-[3.75rem] print:hidden flex">
    <div
      :key="headerPadding"
      class="fixed top-0 right-0 left-0 bg-default dark:bg-default-dark supports-backdrop:backdrop-blur h-[calc(3.75rem+var(--header-height-padding))] print:hidden"
      :class="{
        'supports-backdrop:bg-opacity-40 supports-backdrop:dark:bg-opacity-60': isTransparent,
      }"
      :style="{'--header-height-padding': headerPadding + 'px'}"
    />

    <div
      v-show="!isSearchVisible && !search"
      class="relative flex flex-1 items-center -pl--inner-margin xl-not:pl-[3.75rem] max-w-full"
      :class="{
        '-pr--inner-margin': !searchEnabled
      }"
    >
      <div class="flex-1 text-xl sm:text-3xl text-accent font-semibold truncate">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <button
        v-if="searchEnabled"
        class="w-hover-circle-trigger flex items-center h-full -px--inner-margin select-none outline-none"
        @click="openSearch"
      >
        <div class="relative w-hover-circle">
          <IconSearch class="square-6 sm-not:square-5 text-accent" />
        </div>
      </button>
    </div>

    <div
      v-if="searchEnabled"
      v-show="isSearchVisible || search"
      class="relative -pl--inner-margin xl-not:pl-[3.75rem] -pr--inner-margin flex flex-1 gap-2 items-center w-full"
    >
      <WInputSuggest
        v-if="$slots.search?.()?.length && isMobile"
        ref="input"
        :model-value="search"
        placeholder="Search.."
        allow-clear
        persist
        teleport
        no-margin
        class="w-full"
        :icon="markRaw(IconSearch)"
        @click:clear="!isMobile && input?.close()"
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
import {ref, onMounted, nextTick, markRaw, watch, toRef, onBeforeUnmount} from 'vue'
import IconSearch from '@/assets/icons/sax/IconSearch.svg?component'
import WInput from '@/components/Input/WInput.vue'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import {getIsMobile} from '@/utils/mobile'

const props = withDefaults(
  defineProps<{
    title?: string
    search?: string
    searchEnabled?: boolean
    headerPadding?: number
  }>(),
  {
    title: undefined,
    search: undefined,
    headerPadding: 0,
  },
)

defineEmits<{
  (e: 'update:search', value: string | undefined):void
}>()

const isMobile = getIsMobile()

const input = ref<ComponentInstance<typeof WInputSuggest> | undefined>()

const isTransparent = ref(false)
const isSearchVisible = ref(false)

const openSearch = (): void => {
  isSearchVisible.value = true

  nextTick().then(() => input.value?.focus())
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
})

onBeforeUnmount(() => {
  if (!timeout) return

  clearTimeout(timeout)
  timeout = undefined
})

</script>
