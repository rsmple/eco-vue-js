<template>
  <div class="text-accent flex flex-wrap gap-x-2 font-light leading-loose tracking-wide">
    <template
      v-for="(item, index) in list"
      :key="item"
    >
      <div
        v-if="index !== 0"
        class="text-description"
      >
        /
      </div>

      <button
        :class="{
          'font-semibold': active !== null && breadcrumbs[item]! <= active && (index + 1 === list.length || breadcrumbs[list[index + 1]!]! > active)
        }"
        class="grid justify-items-center hover:underline"
        @click="scrollTo(item)"
      >
        <div class="h-0 font-semibold opacity-0">
          {{ item }}
        </div>

        <div>
          {{ item }}
        </div>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, onUnmounted} from 'vue'

import {usePageBreadcrumbs} from './use/usePageBreadcrumbs'

const {breadcrumbs, active, resetBreadcrumbs, scrollTo} = usePageBreadcrumbs()

const list = computed(() => Object
  .entries(breadcrumbs.value)
  .sort((a, b) => a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0)
  .map(item => item[0]),
)

onUnmounted(() => {
  resetBreadcrumbs()
})
</script>