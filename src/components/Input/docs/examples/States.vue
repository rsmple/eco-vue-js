<template>
  <div class="grid max-w-md gap-2">
    <WInput
      model-value="Moby-Dick"
      title="Required"
      description="Shown under the title."
      mandatory
    />

    <WInput
      model-value="1851"
      title="With an error"
      error-message="Must be after 1900"
    />

    <WInput
      model-value="Read only"
      title="Readonly"
      readonly
    />

    <WInput
      model-value="Disabled"
      title="Disabled"
      disabled
    />

    <WInput
      title="Skeleton"
      skeleton
    />
  </div>
</template>

<script lang="ts" setup>
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
</script>
