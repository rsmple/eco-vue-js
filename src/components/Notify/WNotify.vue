<template>
  <TransitionGroup
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-1"
    leave-from-class="opacity-1 grid-rows-[1fr]"
    leave-to-class="opacity-0 grid-rows-[0fr]"
    tag="div"
    class="fixed right-0 top-2 isolate z-[10000]"
  >
    <div
      v-for="config in list"
      :key="config.title + config.caption + config.type"
      class="grid justify-end transition-[opacity,transform,grid-template-rows] duration-500"
    >
      <div class="min-h-0">
        <NotifyCard
          :title="config.title"
          :caption="config.caption"
          :type="config.type"
          :count="config.count"
          :to="config.to"
          :user-input="config.userInput"
          @click:close="removeNotify(config)"
        />
      </div>
    </div>
  </TransitionGroup>
</template>

<script lang="ts" setup>
import type {AddNotify, NotifyConfig} from './models/types'

import {onBeforeMount, onBeforeUnmount, ref} from 'vue'

import {initNotify} from '@/utils/Notify'

import NotifyCard from './components/NotifyCard.vue'

type NotifyMeta = {
  count: number
  timeout: NodeJS.Timeout
}

const NOTIFY_DELAY = 5000

const list = ref<Array<NotifyConfig & NotifyMeta>>([])

const addNotify: AddNotify = (config: NotifyConfig): void => {
  const index = list.value.findIndex(item => item.type === config.type
    && item.title === config.title
    && item.caption === config.caption
    && item.userInput === config.userInput
    && (item.to as {name: string})?.name === (config.to as {name: string})?.name,
  )

  const configMeta = {
    ...config,
    count: 1,
    timeout: setTimeout(
      () => {
        removeNotify(configMeta)
      },
      NOTIFY_DELAY,
    ),
  }

  if (index !== -1) {
    configMeta.count += list.value[index]?.count ?? 0

    list.value.splice(index, 1, configMeta).forEach(item => clearTimeout(item.timeout))
  } else {
    list.value.push(configMeta)
  }
}

const removeNotify = (config: NotifyConfig & NotifyMeta): void => {
  const index = list.value.indexOf(config)

  if (index === -1) return

  list.value.splice(index, 1)
}

onBeforeMount(() => {
  initNotify(addNotify)
})

onBeforeUnmount(() => {
  initNotify(undefined)
})
</script>
