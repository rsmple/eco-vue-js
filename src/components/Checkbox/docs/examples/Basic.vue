<template>
  <div class="grid max-w-md gap-2">
    <WCheckbox
      v-model="agree"
      title="I agree to the terms"
    />

    <WCheckbox
      :model-value="null"
      title="Partly selected"
      intermediate
    />

    <WCheckbox
      v-model="compact"
      title="Radio look"
      radio
    />

    <WCheckbox
      :model-value="true"
      title="Disabled"
      tooltip-text="Managed by your organization"
      disabled
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'

const agree = ref(false)
const compact = ref(true)
</script>
