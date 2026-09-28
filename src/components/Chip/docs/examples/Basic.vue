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

    <div class="flex flex-wrap items-center gap-6">
      <span class="relative">
        Inbox

        <WCounter
          :count="count"
          :trigger="1"
          class="absolute -top-2 left-full text-xs"
        />
      </span>

      <WCounter
        :count="1234"
        :semantic-type="SemanticType.INFO"
        class="text-sm"
      />

      <WButton
        :semantic-type="SemanticType.SECONDARY"
        @click="count++"
      >
        New message
      </WButton>
    </div>

    <div class="flex flex-wrap items-center gap-4 [&_svg]:square-5">
      <span class="flex items-center gap-2"><WStatusIcon /> Not set</span>
      <span class="flex items-center gap-2"><WStatusIcon has-value /> Done</span>
      <span class="flex items-center gap-2"><WStatusIcon has-error /> Failed</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'

const semanticTypes = Object.values(SemanticType)

const count = ref(3)
</script>
