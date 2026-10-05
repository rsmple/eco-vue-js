<template>
  <div class="grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-2">
    <span class="text-description">Seeds sown</span>
    <WNumberFormatter
      :model-value="12840"
      tag="span"
    />

    <span class="text-description">Compact</span>
    <WNumberFormatter
      :model-value="12840"
      tag="span"
      compact
    />

    <span class="text-description">Sprouted</span>
    <WNumberFormatter
      :model-value="0.4375"
      tag="span"
      percent
    />

    <span class="text-description">Of the region</span>
    <WNumberFormatter
      :model-value="0.000125"
      tag="span"
      percent
      compact
    />
  </div>
</template>

<script lang="ts" setup>
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'
</script>
