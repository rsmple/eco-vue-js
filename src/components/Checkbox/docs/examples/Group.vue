<template>
  <div class="grid max-w-md gap-6">
    <WCheckboxGroup
      v-model="plan"
      :list="PLANS"
      :title-map="PLAN_TITLES"
      title="Plan"
      radio
      wrap
    />

    <WCheckboxGroupMultiple
      :model-value="channels"
      :list="CHANNELS"
      :value-getter="item => item.id"
      title="Notify me by"
      @select="channels = [...channels, $event]"
      @unselect="channels = channels.filter(id => id !== $event)"
    >
      <template #option="{option}">
        {{ option?.title }}
      </template>
    </WCheckboxGroupMultiple>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
import WCheckboxGroupMultiple from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroupMultiple.vue'

const PLANS = ['free', 'pro', 'team'] as const

const PLAN_TITLES = {free: 'Free', pro: 'Pro', team: 'Team'}

const CHANNELS = [
  {id: 1, title: 'Email'},
  {id: 2, title: 'Slack'},
  {id: 3, title: 'Push notifications'},
]

const plan = ref<typeof PLANS[number]>('pro')
const channels = ref<number[]>([1])
</script>
