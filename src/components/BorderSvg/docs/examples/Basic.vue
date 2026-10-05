<template>
  <div class="flex flex-wrap gap-6">
    <div class="text-description relative flex h-28 w-48 items-center justify-center text-sm">
      Dashed

      <WBorderSvg
        stroke="currentColor"
        stroke-dasharray="6px 6px"
        class="w-border-svg-rounded-xl"
      />
    </div>

    <div class="tone-primary text-tone relative flex h-28 w-48 items-center justify-center text-sm">
      Moving

      <WBorderSvg
        stroke="currentColor"
        stroke-dasharray="8px 6px"
        stroke-linecap="round"
        class="w-border-svg-rounded-xl w-border-svg-stroke-3"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-28"
          dur="1s"
          repeatCount="indefinite"
        />
      </WBorderSvg>
    </div>

    <div class="tone-positive surface-fill relative flex h-28 w-48 items-center justify-center rounded-xl text-sm">
      Dotted

      <WBorderSvg
        stroke="currentColor"
        stroke-dasharray="2px 4px"
        stroke-linecap="round"
        class="text-tone w-border-svg-rounded-2xl"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import WBorderSvg from 'eco-vue-js/dist/components/BorderSvg/WBorderSvg.vue'
</script>
