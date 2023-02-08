<template>
  <TransitionGroup
    enter-active-class="list-enter-active"
    leave-active-class="list-leave-active"
    enter-from-class="list-enter-from"
    leave-to-class="list-leave-to"
    tag="div"
    class="fixed top-2 right-0 z-[10000]"
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
import {initNotify} from '@/utils/Notify'
import {onBeforeMount, onBeforeUnmount, ref} from 'vue'
import NotifyCard from './components/NotifyCard.vue'
import type {AddNotify, NotifyConfig} from './models/types'

type NotifyMeta = {
  count: number
  timeout: NodeJS.Timeout
}

const NOTIFY_DELAY = 5000

const list = ref<Array<NotifyConfig & NotifyMeta>>([])

const addNotify: AddNotify = (config: NotifyConfig): void => {
  const index = list.value.findIndex(item => item.type === config.type && item.title === config.title && item.caption === config.caption)

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
