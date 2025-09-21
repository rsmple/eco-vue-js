<template>
  <component
    :is="RouterViewComponent"
    v-if="RouterViewComponent"
  />

  <slot v-else />
</template>

<script lang="ts" setup>
import type {RouterView} from 'vue-router'

import {onBeforeUnmount, resolveComponent, watch} from 'vue'

import {useOptionalRoute, useOptionalRouter} from '@/composables/useOptionalRouter'
import {type ApiClientInstance} from '@/utils/ApiClient'

const props = defineProps<{
  apiClientInstance: ApiClientInstance
}>()

let RouterViewComponent: typeof RouterView | null = null
try {
  RouterViewComponent = resolveComponent('RouterView') as unknown as typeof RouterView
} catch {
  RouterViewComponent = null
}

const router = useOptionalRouter()
const route = useOptionalRoute()

const redirect = () => {
  router.push({name: props.apiClientInstance.routeNameAuthNo, query: route.fullPath !== '/' ? {hash: route.fullPath} : undefined})
}

let refreshPromise: Promise<void> | undefined

const checkAuth = () => {
  if (props.apiClientInstance.checkAuth()) return

  if (!refreshPromise) {
    if (props.apiClientInstance.refreshPromise) {
      redirect()
    }
  }
}

watch(() => props.apiClientInstance.isAuthFailed.value, value => {
  if (value) redirect()
})

window.addEventListener('storage', checkAuth)

onBeforeUnmount(() => {
  window.removeEventListener('storage', checkAuth)
})
</script>
