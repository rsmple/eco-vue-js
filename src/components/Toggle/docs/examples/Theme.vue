<template>
  <div class="grid max-w-md gap-2">
    <WToggleTheme
      v-model="theme"
      title="Theme"
    />

    <span class="text-description text-sm">
      Picked: {{ theme }} — this demo only keeps the value; the header's toggle applies it to the site.
    </span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {Theme} from 'eco-vue-js/dist/utils/utils'

import WToggleTheme from 'eco-vue-js/dist/components/Toggle/WToggleTheme.vue'

const theme = ref(Theme.LIGHT)
</script>
