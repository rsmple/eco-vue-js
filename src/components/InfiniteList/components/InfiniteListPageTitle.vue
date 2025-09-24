<template>
  <RouterLink
    class="text-description sm-not:first:-mx--inner-margin block font-normal no-underline hover:underline"
    :to="{query: queryParams as LocationQueryRaw, hash: $route.hash}"
    replace
    @click="copyRoute"
  >
    Page: {{ (queryParams as Record<'page', number>).page ?? 1 }}
  </RouterLink>
</template>

<script lang="ts" setup generic="QueryParams">
import {type LocationQueryRaw} from 'vue-router'

import {useOptionalRoute, useOptionalRouter} from '@/composables/useOptionalRouter'
import {Notify} from '@/utils/Notify'

const props = defineProps<{
  queryParams: QueryParams
}>()

defineEmits<{
  (e: 'update:selected', value: boolean): void
}>()

const route = useOptionalRoute()
const router = useOptionalRouter()

const copyRoute = (): void => {
  navigator.clipboard
    .writeText(location.origin + router.resolve({query: props.queryParams as LocationQueryRaw, hash: route.hash}).href)
    .then(() => Notify.success({title: 'Page url copied'}))
}
</script>
