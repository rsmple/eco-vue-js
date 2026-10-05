<template>
  <TransitionGroup
    enter-from-class="opacity-0 translate-y-2 grid-rows-[0fr]"
    enter-to-class="opacity-1 grid-rows-[1fr]"
    leave-from-class="opacity-1 grid-rows-[1fr]"
    leave-to-class="opacity-0 grid-rows-[0fr]"
    tag="div"
    class="fixed isolate z-10000"
    :class="{
      'top-[calc(var(--header-height,0px)+0.5rem)]': isTop,
      'bottom-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]': !isTop,
      'right-0': !isCenter,
      'left-1/2 -translate-x-1/2': isCenter,
    }"
  >
    <div
      v-for="item in notifyCenterToastEntries"
      :key="getNotifyItemKey(item)"
      class="grid transition-[translate,opacity,grid-template-rows] duration-500"
      :class="isCenter ? 'justify-center' : 'justify-end'"
    >
      <div class="min-h-0">
        <NotifyCard
          :item="item"
          :class="{'mr-4': !isCenter}"
          @click:close="entry => (entry.items ?? [entry]).forEach(value => hideToast(value.id))"
        />
      </div>
    </div>
  </TransitionGroup>
</template>

<script lang="ts" setup>
import type {NotifyProps} from './types'

import {computed, onBeforeMount, onBeforeUnmount} from 'vue'

import {initNotify} from '@/utils/Notify'

import NotifyCard from './components/NotifyCard.vue'
import {addNotify, getNotifyItemKey, hideToast, notifyCenterToastEntries} from './models/notifyCenter'

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
