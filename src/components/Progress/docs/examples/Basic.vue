<template>
  <div class="grid max-w-md gap-6">
    <div class="flex gap-2">
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="running"
        @click="start"
      >
        Start
      </WButton>

      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="running"
        @click="percent = 0"
      >
        Reset
      </WButton>
    </div>

    <WProgress :model-value="percent" />

    <WProgressStriped
      :model-value="percent"
      class="h-1.5"
    />

    <WProgressBar
      :model-value="waiting ? null : percent / 100"
      :semantic-type="SemanticType.PRIMARY"
    />
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WProgress from 'eco-vue-js/dist/components/Progress/WProgress.vue'
import WProgressBar from 'eco-vue-js/dist/components/Progress/WProgressBar.vue'
import WProgressStriped from 'eco-vue-js/dist/components/Progress/WProgressStriped.vue'

const percent = ref(0)
const running = ref(false)
const waiting = ref(false)

let timer: ReturnType<typeof setInterval> | undefined

// Waits a second before the task reports progress, then fills in steps.
const start = () => {
  percent.value = 0
  running.value = true
  waiting.value = true

  setTimeout(() => {
    waiting.value = false

    timer = setInterval(() => {
      percent.value = Math.min(100, percent.value + 10)

      if (percent.value === 100) {
        clearInterval(timer)
        running.value = false
      }
    }, 400)
  }, 1000)
}

onBeforeUnmount(() => clearInterval(timer))
</script>
