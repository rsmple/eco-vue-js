<template>
  <div
    v-if="skeleton || !encodedQueryParam"
    class="square-5"
  />

  <button
    v-else
    class="w-ripple w-ripple-hover rounded p-0.5"
    :class="{
      'text-description': $route.query[filterField] !== encodedQueryParam,
      'bg-primary dark:bg-primary-dark text-default dark:text-default-dark': $route.query[filterField] === encodedQueryParam,
    }"
    @click="$router.replace({query: {...$route.query, [filterField]: $route.query[filterField] === encodedQueryParam ? undefined : encodedQueryParam}})"
  >
    <IconFilter class="square-4" />
  </button>
</template>

<script lang="ts" setup>
import IconFilter from '@/assets/icons/sax/IconFilter.svg?component'

defineProps<{
  filterField: string
  encodedQueryParam: EncodeQueryParam<unknown> | undefined
  skeleton?: boolean
}>()
</script>