<template>
  <div class="grid grid-cols-1 items-start h-full gap-4 text-left sm:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
    <form
      class="docs-home-card grid content-start gap-3"
      @submit.prevent="create"
    >
      <div class="flex items-center justify-between">
        <span class="font-semibold">New project</span>

        <WChip
          :text="isCreated ? 'active' : 'draft'"
          :semantic-type="isCreated ? SemanticType.POSITIVE : SemanticType.WARNING"
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
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :disabled="isCreating"
          @click="reset"
        >
          Reset
        </WButton>

        <WButton
          :semantic-type="SemanticType.PRIMARY"
          :loading="isCreating"
          :disabled="!name"
          type="submit"
        >
          Create
        </WButton>
      </div>
    </form>

    <div class="grid gap-4 sm:translate-y-6">
      <div class="docs-home-card grid gap-2 grid-cols-1">
        <div class="flex items-center justify-between gap-2">
          <span class="text-description text-sm">Open findings</span>

          <WButtonGroup
            v-model="range"
            :list="RANGES"
            class="w-button-h-7 w-button-rounded-lg text-xs"
            no-margin
          >
            <template #option="{option}">
              {{ option }}d
            </template>
          </WButtonGroup>
        </div>

        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold tabular-nums">{{ points[0].value }}</span>

          <span
            class="text-sm font-medium tabular-nums"
            :class="change <= 0 ? 'text-positive dark:text-positive-dark' : 'text-negative dark:text-negative-dark'"
          >{{ change > 0 ? '+' : '−' }}{{ Math.abs(change) }}%</span>
        </div>

        <ClientOnly>
          <WChartLinear
            :x-domain="[+addDay(TODAY, 1 - range), +TODAY]"
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
                :data="points"
                x-key="date"
                y-key="value"
                has-area
                class="text-primary dark:text-primary-dark"
              >
                <template #tooltip="{d}">
                  <div class="grid text-sm">
                    <span class="text-description">{{ dateFormat(new Date(d.date)) }}</span>
                    <span class="font-semibold">{{ d.value }} open</span>
                  </div>
                </template>
              </WChartLine>
            </template>
          </WChartLinear>

          <template #fallback>
            <div class="h-22.5" />
          </template>
        </ClientOnly>
      </div>

      <div class="docs-home-card grid gap-3">
        <div class="flex items-center justify-between">
          <span class="font-semibold">Export report</span>

          <WChip
            :text="exportStatus"
            :semantic-type="EXPORT_STATUS_TYPE[exportStatus]"
          />
        </div>

        <WProgressBar
          :model-value="exportProgress"
          :semantic-type="SemanticType.PRIMARY"
        />

        <div class="flex items-center justify-between">
          <span class="text-description text-xs tabular-nums">
            {{ Math.round((exportProgress ?? 0) * EXPORT_PAGES) }} / {{ EXPORT_PAGES }} pages
          </span>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            :disabled="exportStatus !== 'done'"
            class="w-button-h-7 w-button-rounded-lg text-xs"
            @click="runExport"
          >
            Run again
          </WButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'

import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WProgressBar from 'eco-vue-js/dist/components/Progress/WProgressBar.vue'
import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const TAG_OPTIONS = [
  {id: 1, name: 'api'},
  {id: 2, name: 'backend'},
  {id: 3, name: 'payments'},
  {id: 4, name: 'urgent'},
]

const RANGES = [7, 30, 90] as const

const TODAY = getStartOfDay()

// One point a day for the last 90 days, newest first, trending down.
const HISTORY = Array.from({length: 90}, (_, index) => ({
  date: +addDay(TODAY, -index),
  value: Math.round(92 + 12 * Math.sin(index / 3) + index * 0.7),
}))

const EXPORT_PAGES = 12

const EXPORT_STATUS_TYPE = {
  queued: SemanticType.SECONDARY,
  running: SemanticType.INFO,
  done: SemanticType.POSITIVE,
} as const satisfies Record<string, SemanticType>

const name = ref<string | undefined>('Payments API')
const tags = ref([1, 3])
const notify = ref(true)
const isCreating = ref(false)
const isCreated = ref(false)

let createTimer: ReturnType<typeof setTimeout> | undefined

const create = () => {
  if (!name.value || isCreating.value) return

  isCreating.value = true

  createTimer = setTimeout(() => {
    isCreating.value = false
    isCreated.value = true
    Notify.success({title: 'Project created', caption: `${ name.value } is ready${ notify.value ? ' and the team is notified' : '' }.`})
  }, 900)
}

const reset = () => {
  name.value = 'Payments API'
  tags.value = [1, 3]
  notify.value = true
  isCreated.value = false
}

const range = ref<typeof RANGES[number]>(30)

const points = computed(() => HISTORY.slice(0, range.value))

const change = computed(() => {
  const first = points.value[points.value.length - 1].value

  return Math.round((points.value[0].value - first) / first * 100)
})

// The export waits for the server, then reports pages as they are written.
const exportProgress = ref<number | null>(null)
const exportStatus = ref<keyof typeof EXPORT_STATUS_TYPE>('queued')

let exportTimer: ReturnType<typeof setTimeout> | undefined

const runExport = () => {
  clearTimeout(exportTimer)
  exportProgress.value = null
  exportStatus.value = 'queued'

  const step = (page: number) => {
    exportProgress.value = page / EXPORT_PAGES
    exportStatus.value = page < EXPORT_PAGES ? 'running' : 'done'

    if (page < EXPORT_PAGES) exportTimer = setTimeout(() => step(page + 1), 250 + (page % 3) * 150)
  }

  exportTimer = setTimeout(() => step(0), 1200)
}

onMounted(runExport)

onBeforeUnmount(() => {
  clearTimeout(createTimer)
  clearTimeout(exportTimer)
})
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
