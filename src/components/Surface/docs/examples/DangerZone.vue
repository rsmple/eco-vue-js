<template>
  <WSection
    title="Danger zone"
    description="The garden, its beds and their watering plans are deleted for good. Photos you exported stay on your device."
    :semantic-type="SemanticType.NEGATIVE"
  >
    <template #footer>
      <WButton :semantic-type="SemanticType.NEGATIVE">
        <IconTrash /> Delete garden
      </WButton>
    </template>
  </WSection>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WSection from 'eco-vue-js/dist/components/Surface/WSection.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'
</script>
