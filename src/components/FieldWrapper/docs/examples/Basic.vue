<template>
  <div class="grid gap-8 md:grid-cols-2">
    <div>
      <WFieldWrapper
        title="Sensor"
        model-value="greenhouse-2/moisture-07"
        mono
        allow-copy
      />

      <WFieldWrapper
        title="Seeds sown"
        :model-value="12840"
        description="Across all beds."
      />

      <WFieldWrapper
        title="Caretaker"
        :model-value="null"
      />
    </div>

    <div>
      <WFieldWrapper
        title="Moisture threshold"
        :has-changes="threshold !== 7"
        description="The sprinklers start below it."
        required
      >
        <template #field>
          <WSlider
            v-model="threshold"
            :min="1"
            :max="10"
          >
            <template #right>
              <span class="w-6 text-right font-semibold">{{ threshold }}</span>
            </template>
          </WSlider>
        </template>
      </WFieldWrapper>

      <WFieldWrapper title="Status">
        <WChip
          text="Thriving"
          :semantic-type="SemanticType.POSITIVE"
        />
      </WFieldWrapper>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WFieldWrapper from 'eco-vue-js/dist/components/FieldWrapper/WFieldWrapper.vue'
import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'

const threshold = ref(7)
</script>
