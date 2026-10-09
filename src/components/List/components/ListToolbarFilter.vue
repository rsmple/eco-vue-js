<template>
  <slot />
</template>

<script lang="ts" setup>
import {provide} from 'vue'

import {wListToolbar} from '../models/toolbar'

provide(wListToolbar, true)
</script>
