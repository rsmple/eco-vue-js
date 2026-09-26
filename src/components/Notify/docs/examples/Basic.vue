<template>
  <div class="flex flex-wrap gap-4">
    <WButton
      :semantic-type="SemanticType.POSITIVE"
      @click="Notify.success({title: 'Project saved'})"
    >
      Success
    </WButton>

    <WButton
      :semantic-type="SemanticType.WARNING"
      @click="Notify.warn({title: 'Form contains invalid values', caption: 'Name is required.'})"
    >
      Warning
    </WButton>

    <WButton
      :semantic-type="SemanticType.NEGATIVE"
      @click="Notify.error({title: 'Upload failed', caption: 'The file is larger than 10 MB.', userInput: 'annual-report-final-v2.pdf'})"
    >
      Error
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
</script>
