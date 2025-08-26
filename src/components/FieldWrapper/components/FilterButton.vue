<template>
  <div
    v-if="skeleton || !encodedQueryParam"
    class="square-[1.5em]"
  />

  <button
    v-else
    class="w-ripple w-ripple-hover rounded p-[0.125em]"
    :class="{
      'text-description': $route.query[filterField] !== encodedQueryParam,
      'bg-primary dark:bg-primary-dark text-default': $route.query[filterField] === encodedQueryParam,
    }"
    @click="$router.replace({query: {...$route.query, [filterField]: $route.query[filterField] === encodedQueryParam ? undefined : encodedQueryParam}})"
  >
    <IconFilter class="square-[1.25em]" />
  </button>
</template>

<script lang="ts" setup>
import IconFilter from '@/assets/icons/IconFilter.svg?component'

defineProps<{
  filterField: string
  encodedQueryParam: EncodeQueryParam<unknown> | undefined
  skeleton?: boolean
}>()
</script>