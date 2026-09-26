<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton
      v-for="type in Object.values(SemanticType)"
      :key="type"
      :semantic-type="type"
    >
      {{ type }}
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
</script>
