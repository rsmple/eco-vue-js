<template>
  <!--
    On phones the bottom of the screen holds the buttons of a modal, a sheet or a page, and right under the header is the first field of a full-screen modal,
    so the toasts show at the top edge, over the header or the modal's title.
  -->
  <div
    class="sm-not:top-[max(env(safe-area-inset-top),0.5rem)] fixed isolate z-10000"
    :class="{
      'sm:top-(--w-top-inner,0.5rem)': isTop,
      'sm:bottom-[calc(var(--w-bottom-inner,0.5rem)+0.5rem)]': !isTop,
      'right-(--w-right-inner,0.5rem)': !isCenter,
      'left-1/2 -translate-x-1/2': isCenter,
    }"
    @pointerenter="setToastsPaused(true)"
    @pointerleave="setToastsPaused(false)"
  >
    <TransitionGroup
      enter-from-class="opacity-0 translate-y-2 grid-rows-[0fr]"
      enter-to-class="opacity-1 grid-rows-[1fr]"
      leave-from-class="opacity-1 grid-rows-[1fr]"
      leave-to-class="opacity-0 grid-rows-[0fr]"
      tag="div"
    >
      <div
        v-for="item in notifyCenterToastEntries"
        :key="getNotifyItemKey(item)"
        class="grid transition-[translate,opacity,grid-template-rows] duration-300"
        :class="isCenter ? 'justify-center' : 'justify-end'"
      >
        <div class="min-h-0">
          <NotifyCard
            :item="item"
            @click:close="entry => (entry.items ?? [entry]).forEach(value => hideToast(value.id))"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import type {NotifyProps} from './types'

import {computed, onBeforeMount, onBeforeUnmount} from 'vue'

import {initNotify} from '@/utils/Notify'

import NotifyCard from './components/NotifyCard.vue'
import {addNotify, getNotifyItemKey, hideToast, notifyCenterToastEntries, setToastsPaused} from './models/notifyCenter'

const props = withDefaults(defineProps<NotifyProps>(), {position: 'top-right'})

const isTop = computed(() => props.position.startsWith('top'))
const isCenter = computed(() => props.position.endsWith('center'))

onBeforeMount(() => {
  initNotify(addNotify)
})

onBeforeUnmount(() => {
  initNotify(undefined)
})
</script>
