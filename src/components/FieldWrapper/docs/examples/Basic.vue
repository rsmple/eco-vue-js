<template>
  <div class="grid gap-8 md:grid-cols-2">
    <div>
      <WFieldWrapper
        title="Repository"
        model-value="acme/payments-gateway"
        mono
        allow-copy
      />

      <WFieldWrapper
        title="Open findings"
        :model-value="12840"
        description="Across all branches."
      />

      <WFieldWrapper
        title="Owner"
        :model-value="null"
      />
    </div>

    <div>
      <WFieldWrapper
        title="Severity threshold"
        :has-changes="threshold !== 7"
        description="Findings at or above it fail the build."
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
          text="Active"
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
