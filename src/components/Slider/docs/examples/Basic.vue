<template>
  <div class="grid max-w-md gap-6">
    <WSlider
      v-model="rating"
      :min="1"
      :max="10"
      @update-eager:model-value="ratingEager = $event"
    >
      <template #right>
        <span class="w-8 text-right font-semibold">{{ ratingEager ?? rating }}</span>
      </template>
    </WSlider>

    <WSliderRange
      v-model="score"
      :min="0"
      :max="100"
      :step="10"
      class="w-slider-from-positive w-slider-to-negative"
      @update-eager:model-value="scoreEager = $event"
    >
      <template #right>
        <span class="w-16 text-right font-semibold">{{ (scoreEager ?? score).from }}–{{ (scoreEager ?? score).to }}</span>
      </template>
    </WSliderRange>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'

import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'
import WSliderRange from 'eco-vue-js/dist/components/Slider/WSliderRange.vue'

const rating = ref(7)
const ratingEager = ref<number>()

const score = ref({from: 30, to: 70})
const scoreEager = ref<{from: number, to: number}>()

// The eager value is only for showing the drag; the picked value takes over once it ends.
watch(rating, () => ratingEager.value = undefined)
watch(score, () => scoreEager.value = undefined)
</script>
