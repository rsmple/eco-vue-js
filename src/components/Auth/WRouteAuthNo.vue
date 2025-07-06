<template>
  <RouterView />
</template>

<script lang="ts" setup>
import type {ApiClient} from '@/utils/ApiClient'

import {useQueryClient} from '@tanstack/vue-query'
import {onBeforeMount, onBeforeUnmount, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'

const props = defineProps<{
  apiClient: ApiClient
}>()

const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()

const queryEnabled = ref(false)

const redirect = async () => {
  if (typeof route.query.hash === 'string' && route.query.hash && route.query.hash !== '/') {
    const resolved = router.resolve(route.query.hash)

    if (!resolved.matched.length) {
      await router.replace({name: props.apiClient.routeNameAuth})
    } else {
      await router.replace(resolved)
    }
  } else {
    await router.replace({name: props.apiClient.routeNameAuth})
  }
}

const checkLogin = () => {
  if (!props.apiClient.checkAuth()) return

  redirect()
}

watch(() => props.apiClient.isAuthFailed.value, value => {
  if (value) return
  
  redirect()
})

onBeforeMount(() => {
  window.addEventListener('storage', checkLogin)

  queryClient.clear()

  queryEnabled.value = true
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', checkLogin)
})
</script>
