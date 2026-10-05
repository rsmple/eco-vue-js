<template>
  <div class="grid items-start gap-4 sm:grid-cols-[auto_1fr]">
    <div class="flex flex-wrap gap-2 sm:flex-col">
      <WButton
        :semantic-type="SemanticType.POSITIVE"
        @click="Notify.success({title: 'Repotted', caption: 'The monstera moved to a 30 cm pot.'})"
      >
        Activity
      </WButton>

      <WButton
        :semantic-type="SemanticType.NEGATIVE"
        @click="Notify.error({title: 'Sensor offline', caption: 'The greenhouse probe stopped reporting.', channel: NotifyChannel.ACTION})"
      >
        Needs action
      </WButton>

      <WButton
        :semantic-type="SemanticType.WARNING"
        @click="checkSoil"
      >
        Group
      </WButton>
    </div>

    <WNotifyCenter />
  </div>
</template>

<script lang="ts" setup>
import {NotifyChannel} from 'eco-vue-js/dist/components/Notify/models/NotifyType'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WNotifyCenter from 'eco-vue-js/dist/components/Notify/WNotifyCenter.vue'

const DRY_SOIL_GROUP = {key: 'dry-soil', title: 'Soil is dry', caption: 'These beds need water.'}

const checkSoil = () => {
  ['Bed 1', 'Bed 4', 'Bed 7'].forEach(bed => {
    Notify.warn({title: 'Soil is dry', caption: bed, group: DRY_SOIL_GROUP})
  })
}
</script>
