<template>
  <div class="grid gap-4">
    <WInfoCard>
      Plants are grouped by the bed they grow in. Open a bed to see its plants.
    </WInfoCard>

    <WInfoCard :semantic-type="SemanticType.WARNING">
      The moisture sensors haven't reported for 3 days — readings may be out of date.

      <template #bottom>
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          class="mt-4"
        >
          Check now
        </WButton>
      </template>
    </WInfoCard>

    <WInfoCard
      :semantic-type="SemanticType.POSITIVE"
      :icon="markRaw(IconCheckCircle)"
    >
      All plants are watered.
    </WInfoCard>

    <WInfoCard
      :semantic-type="SemanticType.INFO"
      no-bg
    >
      Without a background, for a note inside other content.
    </WInfoCard>

    <WInfoCardNegative title="The greenhouse sensor can't be reached">
      Check its battery and that it is still in range of the Wi-Fi.
    </WInfoCardNegative>
  </div>
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
import WInfoCardNegative from 'eco-vue-js/dist/components/InfoCard/WInfoCardNegative.vue'

import IconCheckCircle from 'eco-vue-js/dist/assets/icons/IconCheckCircle'
</script>
