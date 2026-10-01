<template>
  <span
    class="inline-block size-3 shrink-0 rounded-full border border-solid border-current/40"
    :style="{background: getThemeSwatch(config)}"
  />
</template>

<script lang="ts" setup>
import {type ThemeConfig, getThemeSwatch} from '../docsTheme'

defineProps<{
  config: ThemeConfig
}>()
</script>
