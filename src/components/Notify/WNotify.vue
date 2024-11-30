<template>
  <TransitionGroup
    enter-active-class="transition-[margin,opacity,transform] duration-500"
    leave-active-class="transition-[margin,opacity,transform] duration-500"
    enter-from-class="opacity-0 translate-y-5"
    leave-to-class="opacity-0 -mb-[var(--list-item-height,5.5rem)]"
    tag="div"
    class="fixed right-0 top-2 z-[10000]"
  >
    <NotifyCard
      v-for="config in list"
      :key="config.title + config.caption + config.type"
      :title="config.title"
      :caption="config.caption"
      :type="config.type"
      :count="config.count"
      :to="config.to"
      :user-input="config.userInput"
      @click:close="removeNotify(config)"
    />
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
