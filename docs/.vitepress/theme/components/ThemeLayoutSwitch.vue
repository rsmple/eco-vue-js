<template>
  <WButtonGroup
    :model-value="layout"
    :list="LAYOUTS.map(item => item.id)"
    :semantic-type="SemanticType.SECONDARY"
    no-margin
    stretch
    @update:model-value="setToken('layout', $event)"
  >
    <template #option="{option}">
      {{ LAYOUTS.find(item => item.id === option)?.name }}
    </template>
  </WButtonGroup>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'

import {LAYOUTS, setToken, themeTokens} from '../docsTheme'

/** The layout style of the theme in use, its preset's included; setting it overrides only that token. */
const layout = computed(() => themeTokens.value.layout ?? 'flat')
</script>
