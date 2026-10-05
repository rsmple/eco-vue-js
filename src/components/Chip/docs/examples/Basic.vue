<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-center gap-2">
      <WChip
        v-for="type in semanticTypes"
        :key="type"
        :text="type"
        :semantic-type="type"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <WChip :semantic-type="SemanticType.POSITIVE">
        <IconCheck class="square-3.5" />
        Watered
      </WChip>

      <WChip
        text="Gardener"
        :skeleton="loading"
      />

      <WToggle
        v-model="loading"
        title="Loading"
        class="ml-4"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconCheck from 'eco-vue-js/dist/assets/icons/IconCheck'

const semanticTypes = Object.values(SemanticType)

const loading = ref(false)
</script>
