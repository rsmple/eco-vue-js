<template>
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

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      @click="count = 0"
    >
      Read all
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'

const count = ref(3)
</script>
