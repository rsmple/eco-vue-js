<template>
  <div class="grid max-w-60 gap-4">
    <div class="grid gap-1">
      <span class="text-description text-sm">Hover the name:</span>

      <WTextOverflow>
        <span class="whitespace-nowrap font-semibold">Monstera deliciosa 'Thai Constellation', half-moon variegation</span>
      </WTextOverflow>
    </div>

    <div class="group/overflow grid gap-1 rounded-xl border border-solid border-line-subtle p-3 hover:bg-surface-muted">
      <span class="text-description text-sm">Hover the card:</span>

      <WTextOverflow>
        <span class="whitespace-nowrap">North greenhouse, bench 4, row 2 — next to the fig cuttings</span>
      </WTextOverflow>
    </div>
  </div>
</template>

<script lang="ts" setup>
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
</script>
