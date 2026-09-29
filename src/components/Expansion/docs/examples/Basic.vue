<template>
  <div class="grid gap-8">
    <div class="rounded-xl border border-solid border-gray-200 dark:border-gray-800 [--inner-margin:1rem]">
      <WExpansionItem
        v-for="(item, index) in sections"
        :key="item.title"
        :title="item.title"
        :is-open="open === index"
        :has-flag="item.flag"
        @toggle="open = open === index ? null : index"
      >
        <p class="text-description px-4 pb-4">
          {{ item.text }}
        </p>
      </WExpansionItem>
    </div>

    <div class="grid gap-2">
      <WToggle
        v-model="details"
        title="Show details"
      />

      <WExpansion :is-open="details">
        <div class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
          <span class="text-description">Findings</span>
          <WNumberFormatter
            :model-value="12840"
            tag="span"
            compact
          />

          <span class="text-description">Fixed</span>
          <WNumberFormatter
            :model-value="0.4375"
            tag="span"
            percent
          />
        </div>
      </WExpansion>
    </div>

    <div class="grid max-w-60 gap-1">
      <span class="text-description text-sm">Hover the name:</span>

      <WTextOverflow>
        <span class="whitespace-nowrap font-semibold">platform/services/payments-gateway/src/main.ts</span>
      </WTextOverflow>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WExpansion from 'eco-vue-js/dist/components/Expansion/WExpansion.vue'
import WExpansionItem from 'eco-vue-js/dist/components/Expansion/WExpansionItem.vue'
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'
import WTextOverflow from 'eco-vue-js/dist/components/TextOverflow/WTextOverflow.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const sections = [
  {title: 'What is scanned?', text: 'Every repository of the project, on each push to the default branch.'},
  {title: 'How long are results kept?', text: 'For a year after the scan, or until the project is deleted.'},
  {title: 'What changed this month?', text: 'Scans now include the container images built from the repository.', flag: true},
]

const open = ref<number | null>(0)
const details = ref(false)
</script>
