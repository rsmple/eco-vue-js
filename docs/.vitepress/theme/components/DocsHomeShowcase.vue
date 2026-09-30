<template>
  <div class="grid grid-cols-1 items-start h-full gap-4 text-left sm:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
    <div class="docs-home-card grid content-start gap-3">
      <div class="flex items-center justify-between">
        <span class="font-semibold">New project</span>

        <WChip
          text="draft"
          :semantic-type="SemanticType.WARNING"
        />
      </div>

      <WInput
        v-model="name"
        title="Name"
        placeholder="Payments API"
        allow-clear
      />

      <WSelect
        :model-value="tags"
        :options="TAG_OPTIONS"
        :value-getter="item => item.id"
        :search-fn="(item, search) => item.name.includes(search.toLowerCase())"
        title="Tags"
        placeholder="Add a tag"
        @select="tags = [...tags, $event]"
        @unselect="tags = tags.filter(item => item !== $event)"
      >
        <template #option="{option}">
          <div class="w-option">
            {{ option?.name }}
          </div>
        </template>
      </WSelect>

      <WToggle
        v-model="notify"
        title="Notify the team"
        description="A digest once a day."
      />

      <div class="mt-1 flex justify-end gap-2">
        <WButton :semantic-type="SemanticType.SECONDARY">
          Cancel
        </WButton>

        <WButton :semantic-type="SemanticType.PRIMARY">
          Create
        </WButton>
      </div>
    </div>

    <div class="grid gap-4 sm:translate-y-6">
      <div class="docs-home-card grid gap-2 grid-cols-1">
        <div class="flex items-baseline justify-between">
          <span class="text-description text-sm">Open findings</span>
          <span class="text-positive dark:text-positive-dark text-sm font-medium">−12%</span>
        </div>

        <span class="text-3xl font-bold">{{ OPEN.at(0)?.value }}</span>

        <ClientOnly>
          <WChartLinear
            :x-domain="[FROM, TODAY]"
            :height="90"
            :y-domain-getter="([min, max]) => [min - 10, max + 5]"
            :top="4"
            :bottom="0"
            :left="0"
            :right="0"
            x-hidden
            y-hidden
          >
            <template #default="scope">
              <WChartLine
                v-bind="scope"
                :data="OPEN"
                x-key="date"
                y-key="value"
                has-area
                class="text-primary dark:text-primary-dark"
              />
            </template>
          </WChartLinear>

          <template #fallback>
            <div class="h-22.5" />
          </template>
        </ClientOnly>
      </div>

      <div class="docs-home-card grid gap-4">
        <div class="flex flex-wrap gap-2">
          <WChip
            text="positive"
            :semantic-type="SemanticType.POSITIVE"
          />

          <WChip
            text="info"
            :semantic-type="SemanticType.INFO"
          />

          <WChip
            text="negative"
            :semantic-type="SemanticType.NEGATIVE"
          />
        </div>

        <WSlider
          v-model="rating"
          :min="0"
          :max="100"
          :step="10"
        />

        <WProgressBar
          :model-value="rating / 100"
          :semantic-type="SemanticType.PRIMARY"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WProgressBar from 'eco-vue-js/dist/components/Progress/WProgressBar.vue'
import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const TAG_OPTIONS = [
  {id: 1, name: 'api'},
  {id: 2, name: 'backend'},
  {id: 3, name: 'payments'},
  {id: 4, name: 'urgent'},
]

const TODAY = +getStartOfDay()
const FROM = +addDay(getStartOfDay(), -29)

// One point a day for the last 30 days, newest first, trending down.
const OPEN = Array.from({length: 30}, (_, index) => ({
  date: +addDay(getStartOfDay(), -index),
  value: Math.round(96 + 14 * Math.sin(index / 3) + index * 0.8),
}))

const name = ref<string | undefined>('Payments API')
const tags = ref([1, 3])
const notify = ref(true)
const rating = ref(60)
</script>

<style scoped>
.docs-home-card {
  padding: 1.25rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 1rem;
  background: color-mix(in oklab, var(--color-default) 85%, transparent);
  box-shadow: 0 1.5rem 3rem -1.5rem color-mix(in oklab, var(--color-primary-dark) 35%, transparent);
  backdrop-filter: blur(12px);
}

.dark .docs-home-card {
  border-color: var(--color-gray-800);
  background: color-mix(in oklab, var(--color-gray-850) 80%, transparent);
  box-shadow: 0 1.5rem 3rem -1.5rem black;
}
</style>
