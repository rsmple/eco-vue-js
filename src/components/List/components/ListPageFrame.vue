<template>
  <template v-if="disabled">
    <slot
      name="head"
      :joined="false"
    />

    <slot :joined="false" />
  </template>

  <div
    v-else
    ref="root"
    :class="{
      'w-list-page': isJoined,
      'w-list-page-table': isJoined && isTable,
      'w-list-page-repaint': isJoined && isRepaint,
    }"
  >
    <ListPageSurface :off="!isJoined">
      <WInfiniteListWrapper
        ref="wrapper"
        :in-place="!isJoined"
      >
        <template #header>
          <slot
            name="head"
            :joined="isJoined"
          />

          <div
            ref="target"
            class="contents"
          />
        </template>

        <template #default="scope">
          <ListPageFrameScope
            v-bind="scope"
            :frame="frame"
          >
            <slot :joined="isJoined" />
          </ListPageFrameScope>
        </template>
      </WInfiniteListWrapper>
    </ListPageSurface>
  </div>
</template>

<script lang="ts" setup>
import {computed, provide, reactive, ref, useTemplateRef} from 'vue'

import WInfiniteListWrapper from '@/components/InfiniteList/WInfiniteListWrapper.vue'

import ListPageFrameScope from './ListPageFrameScope.vue'
import ListPageSurface from './ListPageSurface.vue'

import {wListPageFrame, wListPageFrameHeader} from '../models/injection'
import {usePageTableMark, useStickyPath} from '../use/useStickyPath'

/**
 * A page list's frame around content that may hold one, such as the tabs of WTabs `section`, with a head over it. While
 * a page list in the content joins, the frame is its section: the surface, the stuck header with the head and the
 * list's header in it, the bottom edge. The list renders only its rows, so the box, the head and the stuck state stay
 * when the list changes. Without one the head is in place over the content.
 */
defineProps<{
  /** Renders the head and the content alone, with no frame. */
  disabled?: boolean
}>()

const targetRef = useTemplateRef('target')
const rootRef = useTemplateRef('root')
const wrapperRef = useTemplateRef('wrapper')

const lists = reactive(new Map<symbol, boolean>())

const isJoined = computed(() => lists.size > 0)
const isTable = computed(() => [...lists.values()].some(Boolean))
const isRepaint = ref(false)

// The content beside the table on the page sticks while it scrolls sideways.
useStickyPath(rootRef, () => isJoined.value && isTable.value ? {attribute: 'data-w-page-path', end: '.w-page'} : null)
usePageTableMark(rootRef, () => isJoined.value && isTable.value)

const frame = {
  target: computed(() => targetRef.value),
  join: (owner: symbol, table: boolean) => {
    if (lists.get(owner) !== table) lists.set(owner, table)
  },
  leave: (owner: symbol) => {
    lists.delete(owner)
  },
  repaint: () => {
    isRepaint.value = !isRepaint.value
  },
}

// The frame's own header wrapper is not a list joined to a frame: the content gets the frame from ListPageFrameScope.
provide(wListPageFrame, null)
provide(wListPageFrameHeader, null)

defineExpose({
  /** While a list is joined and its header stuck, scrolls back to the list's top, such as before another list opens in the frame. */
  resetScroll: () => {
    if (isJoined.value) wrapperRef.value?.resetScroll()
  },
})

defineSlots<{
  /** Over the content, in the stuck header while a list is joined, before the list's header. */
  head: (props: {joined: boolean}) => void
  /** The content, which may hold a page list. */
  default: (props: {joined: boolean}) => void
}>()
</script>
