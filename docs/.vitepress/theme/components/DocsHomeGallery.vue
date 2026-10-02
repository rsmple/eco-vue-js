<template>
  <section class="px-(--inner-margin) pb-20 sm:pb-28">
    <p class="text-accent text-sm font-semibold tracking-[0.2em] uppercase">
      Try them
    </p>

    <h2 class="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
      Every tile is the real component
    </h2>

    <div class="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DocsHomeTile
        title="Tabs"
        link="/components/tabs"
        class="lg:col-span-2 overflow-clip"
      >
        <WTabs>
          <WTabsItem
            name="overview"
            title="Overview"
            :icon="markRaw(IconSummary)"
          >
            <p class="text-description py-2 text-sm">
              Tabs keep the height of the tallest one opened so far, so the page below doesn't jump.
            </p>
          </WTabsItem>

          <WTabsItem
            name="activity"
            title="Activity"
            :icon="markRaw(IconTime)"
            :count="3"
          >
            <p class="text-description py-2 text-sm">
              Three new events since your last visit.
            </p>
          </WTabsItem>

          <WTabsItem
            name="settings"
            title="Settings"
            :icon="markRaw(IconSettings)"
          >
            <p class="text-description py-2 text-sm">
              Counts, icons and disabled tabs come built in.
            </p>
          </WTabsItem>
        </WTabs>
      </DocsHomeTile>

      <DocsHomeTile
        title="Date picker"
        link="/components/pickers"
        class="lg:row-span-2"
      >
        <WDatePickerSingle
          v-model="day"
          :min-date="TODAY"
        />

        <span class="text-description text-sm">
          {{ day ? `Due ${ dateFormat(day) }` : 'Pick a due date' }}
        </span>
      </DocsHomeTile>

      <DocsHomeTile
        title="Notifications"
        link="/components/notify"
      >
        <div class="flex flex-wrap gap-2">
          <WButton
            :semantic-type="SemanticType.POSITIVE"
            @click="Notify.success({title: 'Changes saved'})"
          >
            Success
          </WButton>

          <WButton
            :semantic-type="SemanticType.WARNING"
            @click="Notify.warn({title: 'Check the form', caption: 'Name is required.'})"
          >
            Warning
          </WButton>

          <WButton
            :semantic-type="SemanticType.NEGATIVE"
            @click="Notify.error({title: 'Upload failed', caption: 'The file is larger than 10 MB.'})"
          >
            Error
          </WButton>
        </div>
      </DocsHomeTile>

      <DocsHomeTile
        title="Checkboxes"
        link="/components/checkbox"
      >
        <WCheckboxGroup
          v-model="plan"
          :list="PLANS"
          :title-map="PLAN_TITLES"
          radio
          wrap
          no-margin
        />

        <WCheckbox
          v-model="isYearly"
          title="Bill yearly — two months free"
        />
      </DocsHomeTile>

      <DocsHomeTile
        title="Heatmap"
        link="/components/charts"
        class="lg:col-span-2"
      >
        <ClientOnly>
          <WChartHeatmap
            :data="SCANS"
            x-key="date"
            y-key="count"
            title="Scans in the last year"
            class="tone-primary text-tone-fill"
          >
            <template #tooltip="{d}">
              {{ d.count }} scans on {{ dateFormat(new Date(d.date)) }}
            </template>
          </WChartHeatmap>

          <template #fallback>
            <div class="h-40" />
          </template>
        </ClientOnly>
      </DocsHomeTile>

      <DocsHomeTile
        title="Progress"
        link="/components/status-and-loading#progress"
      >
        <div
          v-for="upload in uploads"
          :key="upload.name"
          class="grid gap-1.5"
        >
          <div class="flex justify-between text-sm">
            <span class="truncate">{{ upload.name }}</span>

            <span class="text-description tabular-nums">
              {{ upload.progress <= 0 ? 'Waiting' : upload.progress >= 100 ? 'Done' : `${ Math.round(upload.progress) }%` }}
            </span>
          </div>

          <WProgressStriped
            :model-value="upload.progress"
            class="h-1.5"
          />
        </div>
      </DocsHomeTile>

      <DocsHomeTile
        title="Buttons"
        link="/components/button"
        class="lg:col-span-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <WButton
            v-for="type in Object.values(SemanticType)"
            :key="type"
            :semantic-type="type"
            :tooltip-text="`semantic-type=&quot;${ type }&quot;`"
          >
            {{ type }}
          </WButton>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <WButton
            :semantic-type="SemanticType.PRIMARY"
            outline
          >
            Outline
          </WButton>

          <WButton
            :semantic-type="SemanticType.PRIMARY"
            :loading="isSaving"
            @click="save"
          >
            Click to load
          </WButton>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            disabled
          >
            Disabled
          </WButton>
        </div>
      </DocsHomeTile>

      <DocsHomeTile
        title="Skeletons"
        link="/components/status-and-loading"
      >
        <WToggle
          v-model="isLoading"
          title="Loading"
          no-margin
        />

        <div class="flex items-center gap-3">
          <WSkeleton
            v-if="isLoading"
            class="w-skeleton-w-10 w-skeleton-h-10 w-skeleton-rounded-full shrink-0"
          />

          <div
            v-else
            class="tone-primary surface-fill flex size-10 shrink-0 items-center justify-center rounded-full font-semibold"
          >
            JA
          </div>

          <div class="grid min-w-0 flex-1 text-sm">
            <WSkeleton v-if="isLoading" />

            <span
              v-else
              class="font-semibold"
            >Jane Austen</span>

            <WSkeleton v-if="isLoading" />

            <span
              v-else
              class="text-description truncate"
            >Pride and Prejudice, Emma</span>
          </div>
        </div>
      </DocsHomeTile>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {markRaw, onBeforeUnmount, onMounted, ref} from 'vue'

import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WChartHeatmap from 'eco-vue-js/dist/components/Chart/WChartHeatmap.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
import WDatePickerSingle from 'eco-vue-js/dist/components/DatePicker/WDatePickerSingle.vue'
import WProgressStriped from 'eco-vue-js/dist/components/Progress/WProgressStriped.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'
import IconSummary from 'eco-vue-js/dist/assets/icons/IconSummary'
import IconTime from 'eco-vue-js/dist/assets/icons/IconTime'

import DocsHomeTile from './DocsHomeTile.vue'

const TODAY = getStartOfDay()

const PLANS = ['free', 'team', 'business'] as const

const PLAN_TITLES: Record<typeof PLANS[number], string> = {free: 'Free', team: 'Team', business: 'Business'}

// A made-up count for every weekday of the last year, more on some weeks than others.
const SCANS = Array.from({length: 365}, (_, index) => {
  const date = addDay(TODAY, -index)
  const isWeekday = date.getDay() !== 0 && date.getDay() !== 6

  return {date: +date, count: isWeekday ? (index * 7) % 23 + (Math.floor(index / 30) % 3) * 5 : 0}
}).filter(item => item.count > 0)

const day = ref<Date>()
const plan = ref<typeof PLANS[number]>('team')
const isYearly = ref(true)
const isLoading = ref(true)
const isSaving = ref(false)

let saveTimer: ReturnType<typeof setTimeout> | undefined

const save = () => {
  isSaving.value = true
  saveTimer = setTimeout(() => isSaving.value = false, 1200)
}

// Three uploads, one queued, one running and one finished; the running one starts over when it is done.
const uploads = ref([
  {name: 'annual-report.pdf', progress: 100},
  {name: 'screenshots.zip', progress: 35},
  {name: 'raw-export.csv', progress: 0},
])

let uploadTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  uploadTimer = setInterval(() => {
    const upload = uploads.value[1]

    upload.progress = upload.progress >= 100 ? 0 : Math.min(100, upload.progress + 7)
  }, 400)
})

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  clearInterval(uploadTimer)
})
</script>
