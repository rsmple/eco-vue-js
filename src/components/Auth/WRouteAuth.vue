<template>
  <RouterView />
</template>

<script lang="ts" setup>
import {onBeforeUnmount, watch} from 'vue'
import {RouterView} from 'vue-router'

import {useOptionalRoute, useOptionalRouter} from '@/composables/useOptionalRouter'
import {type ApiClientInstance} from '@/utils/ApiClient'

const props = defineProps<{
  apiClientInstance: ApiClientInstance
}>()

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
