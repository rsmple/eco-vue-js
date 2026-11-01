<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="message"
      class="pointer-events-none fixed inset-x-0 top-[calc(var(--header-height)+0.75rem)] z-1000 flex justify-center pr-[calc(var(--actions-bar-width)+0.75rem)] pl-[calc(var(--nav-bar-width)+0.75rem)]"
    >
      <div
        class="bg-surface pointer-events-auto flex max-w-full items-center gap-3 rounded-xl py-1.5 pr-1.5 pl-3 text-xs shadow-md"
        role="alert"
      >
        <span class="text-accent min-w-0">{{ message }}</span>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :loading="retrying"
          class="w-button-h-7 shrink-0 text-xs"
          @click="retry"
        >
          {{ getText('retry') }}
        </WButton>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'
import {ApiErrorUnavailable} from '@/utils/api'
import {findFailedQueries, getQueryClient, refetchFailedQueries} from '@/utils/queryClient'
import {getText} from '@/utils/texts'

import {queryStatusMountedCount} from './models/mounted'

const OUTAGE_CLASS_LIST = ['w-skeleton-static', '[&_.w-skeleton]:opacity-40']

const queryClient = getQueryClient()

const cacheVersion = ref(0)

const unsubscribe = queryClient.getQueryCache().subscribe(() => cacheVersion.value++)

const failedQueryList = computed(() => {
  void cacheVersion.value

  return findFailedQueries(queryClient)
})

const isOutage = computed(() => failedQueryList.value.some(query => query.state.error instanceof ApiErrorUnavailable))

const message = computed(() => {
  if (isOutage.value) return getText('serverUnavailable')

  return failedQueryList.value.length ? getText('partialLoadError') : undefined
})

watch(isOutage, value => {
  OUTAGE_CLASS_LIST.forEach(name => document.documentElement.classList.toggle(name, value))
})

const retrying = ref(false)

const retry = async () => {
  if (retrying.value) return

  retrying.value = true

  try {
    await refetchFailedQueries(queryClient)
  } finally {
    retrying.value = false
  }
}

onMounted(() => {
  queryStatusMountedCount.value++
})

onBeforeUnmount(() => {
  queryStatusMountedCount.value--
  unsubscribe()
  document.documentElement.classList.remove(...OUTAGE_CLASS_LIST)
})
</script>
