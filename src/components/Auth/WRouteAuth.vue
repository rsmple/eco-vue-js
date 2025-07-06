<template>
  <RouterView />
</template>

<script lang="ts" setup>
import {onBeforeUnmount, watch} from 'vue'
import {RouterView, useRoute, useRouter} from 'vue-router'

import {type ApiClient} from '@/utils/ApiClient'

const props = defineProps<{
  apiClient: ApiClient
}>()

const router = useRouter()
const route = useRoute()

const redirect = () => {
  router.push({name: props.apiClient.routeNameAuthNo, query: route.fullPath !== '/' ? {hash: route.fullPath} : undefined})
}

let refreshPromise: Promise<void> | undefined

const checkAuth = () => {
  if (props.apiClient.checkAuth()) return

  if (!refreshPromise) {
    if (props.apiClient.refreshPromise) {
      redirect()
    }
  }
}

watch(() => props.apiClient.isAuthFailed.value, value => {
  if (value) redirect()
})

window.addEventListener('storage', checkAuth)

onBeforeUnmount(() => {
  window.removeEventListener('storage', checkAuth)
})
</script>
