<template>
  <div class="grid max-w-md gap-2">
    <WToggle
      v-model="notify"
      title="Email notifications"
      description="A digest once a day."
    />

    <WToggle
      v-model="compact"
      title="Compact rows"
      right-label
      small
    />

    <WToggle
      :model-value="true"
      title="Disabled"
      disabled
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const notify = ref(true)
const compact = ref(false)
</script>
