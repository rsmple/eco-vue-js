<template>
  <WButtonMore
    :icon="markRaw(IconPalette)"
    class="p-2 text-xl"
  >
    <WButtonMoreItem
      v-for="preset in PRESETS"
      :key="preset.id"
      :text="preset.name"
      :icon="!hasCustomTokens && activePreset === preset.id ? markRaw(IconCheck) : undefined"
      @click="setPreset(preset.id)"
    />

    <WButtonMoreItem
      v-if="hasCustomTokens"
      text="Custom"
      :icon="markRaw(IconCheck)"
      :href="withBase('/guide/theming')"
    />

    <div class="my-1 border-t border-gray-200 dark:border-gray-800" />

    <WButtonMoreItem
      text="Customize…"
      :href="withBase('/guide/theming')"
    />

    <WButtonMoreItem
      text="Reset"
      :disabled="!Object.keys(themeConfig).length"
      @click="resetTheme"
    />
  </WButtonMore>
</template>

<script lang="ts" setup>
import {withBase} from 'vitepress'
import {computed, markRaw} from 'vue'

import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'
import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconCheck from 'eco-vue-js/dist/assets/icons/IconCheck'

import {PRESETS, hasCustomTokens, resetTheme, setPreset, themeConfig} from '../docsTheme'
import IconPalette from '../icons/IconPalette.svg?component'

const activePreset = computed(() => themeConfig.value.preset ?? 'default')
</script>
