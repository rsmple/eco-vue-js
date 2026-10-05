<template>
  <div class="flex flex-wrap items-center gap-6">
    <WButton :semantic-type="SemanticType.PRIMARY">
      Water the plants
    </WButton>

    <div class="tone-positive surface-fill relative rounded-xl px-6 py-4 font-semibold">
      Harvest ready

      <WShine />
    </div>

    <!-- Mounted once at the app root; this site doesn't, so the demo mounts it for this page. -->
    <WShineEffect />
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WShine from 'eco-vue-js/dist/components/Shine/WShine.vue'
import WShineEffect from 'eco-vue-js/dist/components/Shine/WShineEffect.vue'
</script>
