<template>
  <TransitionGroup
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-1"
    leave-from-class="opacity-1 grid-rows-[1fr]"
    leave-to-class="opacity-0 grid-rows-[0fr]"
    tag="div"
    class="fixed right-0 top-[calc(var(--header-height,0px)+0.5rem)] isolate z-10000"
  >
    <div
      v-for="item in notifyCenterToastEntries"
      :key="getNotifyItemKey(item)"
      class="grid justify-end transition-[translate,opacity,grid-template-rows] duration-500"
    >
      <div class="min-h-0">
        <NotifyCard
          :item="item"
          @click:close="entry => (entry.items ?? [entry]).forEach(value => hideToast(value.id))"
        />
      </div>
    </div>
  </TransitionGroup>
</template>

<script lang="ts" setup>
import {onBeforeMount, onBeforeUnmount} from 'vue'

import {initNotify} from '@/utils/Notify'

import NotifyCard from './components/NotifyCard.vue'
import {addNotify, getNotifyItemKey, hideToast, notifyCenterToastEntries} from './models/notifyCenter'

onBeforeMount(() => {
  initNotify(addNotify)
})

onBeforeUnmount(() => {
  initNotify(undefined)
})
</script>
