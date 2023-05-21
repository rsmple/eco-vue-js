<template>
  <RouterLink
    class="block text-description text-base font-normal no-underline hover:underline sm-not:first:-mx--inner-margin"
    :to="{query: queryParams, hash: $route.hash}"
    replace
    @click="copyRoute"
  >
    Page: {{ queryParams.page }}
  </RouterLink>
</template>

<script lang="ts" setup>
import {useRoute, useRouter} from 'vue-router'
import {Notify} from '@/utils/Notify'
import type {QueryParams} from '../models/types'

const props = defineProps<{
  queryParams: QueryParams
}>()

defineEmits<{
  (e: 'update:selected', value: boolean): void
}>()

const route = useRoute()
const router = useRouter()

const copyRoute = (): void => {
  navigator.clipboard
    .writeText(location.origin + router.resolve({query: props.queryParams, hash: route.hash}).href)
    .then(() => Notify.success({title: 'Page url copied'}))
}

</script>

