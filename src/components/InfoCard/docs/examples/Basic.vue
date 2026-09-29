<template>
  <div class="grid gap-4">
    <WInfoCard>
      Findings are grouped by the rule that found them. Open a group to see its findings.
    </WInfoCard>

    <WInfoCard :semantic-type="SemanticType.WARNING">
      The scanner hasn't run for 30 days — results may be out of date.

      <template #bottom>
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          class="mt-4"
        >
          Run now
        </WButton>
      </template>
    </WInfoCard>

    <WInfoCard
      :semantic-type="SemanticType.POSITIVE"
      :icon="markRaw(IconCheckCircle)"
    >
      All checks passed.
    </WInfoCard>

    <WInfoCard
      :semantic-type="SemanticType.INFO"
      no-bg
    >
      Without a background, for a note inside other content.
    </WInfoCard>

    <WInfoCardNegative title="The repository can't be reached">
      Check that the access token is still valid and has read access to the repository.
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
