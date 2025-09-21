<template>
  <RouterView />
</template>

<script lang="ts" setup>
import type {ApiClientInstance} from '@/utils/ApiClient'

import {useQueryClient} from '@tanstack/vue-query'
import {onBeforeMount, onBeforeUnmount, ref, watch} from 'vue'

import {useOptionalRoute, useOptionalRouter} from '@/composables/useOptionalRouter'

const props = defineProps<{
  apiClientInstance: ApiClientInstance
}>()

const router = useOptionalRouter()
const route = useOptionalRoute()
const queryClient = useQueryClient()

const queryEnabled = ref(false)

const redirect = async () => {
  if (typeof route.query.hash === 'string' && route.query.hash && route.query.hash !== '/') {
    const resolved = router.resolve(route.query.hash)

    if (!resolved.matched.length) {
      await router.replace({name: props.apiClientInstance.routeNameAuth})
    } else {
      await router.replace(resolved)
    }
  } else {
    await router.replace({name: props.apiClientInstance.routeNameAuth})
  }
}

const checkLogin = () => {
  if (!props.apiClientInstance.checkAuth()) return

  redirect()
}

watch(() => props.apiClientInstance.isAuthFailed.value, value => {
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
