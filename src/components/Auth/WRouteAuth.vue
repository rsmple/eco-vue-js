<template>
  <RouterView />
</template>

<script lang="ts" setup>
import {onBeforeUnmount, watch} from 'vue'
import {RouterView, useRoute, useRouter} from 'vue-router'

import {type ApiClientInstance} from '@/utils/ApiClient'

const props = defineProps<{
  apiClientInstance: ApiClientInstance
}>()

const router = useRouter()
const route = useRoute()

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
