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
        title="Status"
        link="/components/status-and-loading#chips-counters-and-status-icons"
      >
        <div class="flex flex-wrap items-center gap-2">
          <WChip
            v-for="type in Object.values(SemanticType)"
            :key="type"
            :text="type"
            :semantic-type="type"
          />
        </div>

        <div class="flex items-center gap-6">
          <span class="relative">
            Inbox

            <WCounter
              :count="messages"
              :trigger="1"
              class="absolute -top-2 left-full text-xs"
            />
          </span>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            @click="messages++"
          >
            New message
          </WButton>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-sm [&_svg]:square-5">
          <span class="flex items-center gap-2"><WStatusIcon /> Not set</span>
          <span class="flex items-center gap-2"><WStatusIcon has-value /> Done</span>
          <span class="flex items-center gap-2"><WStatusIcon has-error /> Failed</span>
        </div>
      </DocsHomeTile>

      <DocsHomeTile
        title="Line chart"
        link="/components/charts#lines"
        class="lg:col-span-2"
      >
        <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <button
            v-for="series in TREND_SERIES"
            :key="series.key"
            class="flex items-center gap-2 transition-opacity"
            :class="[series.tone, {'opacity-40': !visibleSeries[series.key]}]"
            @click="visibleSeries[series.key] = !visibleSeries[series.key]"
          >
            <span
              class="border-tone w-4 border-t-2"
              :class="{'border-dashed': series.key === 'fixed'}"
            />
            {{ series.title }}
          </button>
        </div>

        <div class="h-30 -mt-4">
          <ClientOnly>
            <WChartLinear
              :x-domain="[+addDay(TODAY, -29), +TODAY]"
              :height="120"
              :y-format="value => numberCompactFormatter.format(value)"
              y-right
            >
              <template #default="scope">
                <WChartLine
                  v-if="visibleSeries.open"
                  v-bind="scope"
                  :data="OPEN_TREND"
                  x-key="date"
                  y-key="value"
                  y-key-min="min"
                  y-key-max="max"
                  class="tone-primary text-tone"
                >
                  <template #tooltip="{d}">
                    <div class="grid text-sm">
                      <span class="text-description">{{ dateFormat(new Date(d.date)) }}</span>
                      <span class="font-semibold">{{ d.value }} open</span>
                    </div>
                  </template>
                </WChartLine>

                <WChartLine
                  v-if="visibleSeries.fixed"
                  v-bind="scope"
                  :data="FIXED_TREND"
                  x-key="date"
                  y-key="value"
                  stroke-style="dashed-small"
                  has-area
                  class="tone-positive text-tone"
                >
                  <template #tooltip="{d}">
                    <div class="grid text-sm">
                      <span class="text-description">{{ dateFormat(new Date(d.date)) }}</span>
                      <span class="font-semibold">{{ d.value }} fixed</span>
                    </div>
                  </template>
                </WChartLine>
              </template>
            </WChartLinear>
          </ClientOnly>
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

      <DocsHomeTile
        title="Reorder"
        link="/components/utilities#reorder-by-dragging"
        class="lg:row-span-2"
      >
        <WDragContainer
          :list="steps"
          @update:list="steps = $event"
        >
          <template #default="{item, index, container, initDrag}">
            <div
              v-bind="container"
              class="bg-surface border-line-subtle mb-2 flex items-center gap-3 rounded-xl border p-2.5 text-sm"
            >
              <IconDrag
                class="text-description square-5 cursor-grab"
                @mousedown="initDrag"
              />

              <span class="text-description w-3 tabular-nums">{{ index + 1 }}</span>

              <span>{{ item }}</span>
            </div>
          </template>
        </WDragContainer>

        <span class="text-description text-sm">Drag by the handle to change the pipeline order.</span>
      </DocsHomeTile>

      <DocsHomeTile
        title="Sliders"
        link="/components/pickers#sliders"
        class="lg:col-span-2"
      >
        <WSlider
          v-model="threshold"
          :min="1"
          :max="10"
          @update-eager:model-value="thresholdEager = $event"
        >
          <template #right>
            <span class="w-6 text-right text-sm font-semibold tabular-nums">{{ thresholdEager ?? threshold }}</span>
          </template>
        </WSlider>

        <WSliderRange
          v-model="score"
          :min="0"
          :max="100"
          :step="10"
          class="w-slider-from-positive w-slider-to-negative"
          @update-eager:model-value="scoreEager = $event"
        >
          <template #right>
            <span class="w-14 text-right text-sm font-semibold tabular-nums">{{ (scoreEager ?? score).from }}–{{ (scoreEager ?? score).to }}</span>
          </template>
        </WSliderRange>
      </DocsHomeTile>

      <DocsHomeTile
        title="Expansion"
        link="/components/content-blocks#expansion"
        class="lg:row-span-2"
      >
        <div class="border-line-subtle rounded-xl border [--inner-margin:1rem]">
          <WExpansionItem
            v-for="(item, index) in FAQ"
            :key="item.title"
            :title="item.title"
            :is-open="openFaq === index"
            :has-flag="item.flag"
            @toggle="openFaq = openFaq === index ? null : index"
          >
            <p class="text-description px-4 pb-4 text-sm">
              {{ item.text }}
            </p>
          </WExpansionItem>
        </div>
      </DocsHomeTile>

      <DocsHomeTile
        title="Tooltips"
        link="/components/tooltip"
      >
        <div class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <span class="cursor-help underline decoration-dotted">
            SLA
            <WTooltip text="Fix critical issues within 24 hours." />
          </span>

          <span class="cursor-help underline decoration-dotted">
            Last scan
            <WTooltip>
              <div class="grid gap-1">
                <b>2 hours ago</b>
                <span>12 findings · 3 critical</span>
              </div>
            </WTooltip>
          </span>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            tooltip-text="Buttons take the text as a prop."
          >
            Hover me
          </WButton>
        </div>

        <span class="text-description w-40 truncate text-sm">
          A title too long to fit in its column
          <WTooltip
            text="A title too long to fit in its column"
            overflow-only
          />
        </span>
      </DocsHomeTile>

      <DocsHomeTile
        title="Suggestions"
        link="/components/input#suggestions"
      >
        <WInputOptions
          v-model="country"
          title="Country"
          placeholder="Start typing"
          :options="countries"
          :value-getter="option => option.name"
          empty-stub="No such country"
          allow-clear
        >
          <template #option="{option}">
            <div class="w-option flex items-center">
              {{ option.flag }} {{ option.name }}
            </div>
          </template>
        </WInputOptions>
      </DocsHomeTile>

      <DocsHomeTile
        title="Numbers"
        link="/components/content-blocks#wnumberformatter"
      >
        <div class="grid grid-cols-2 gap-4">
          <div class="grid">
            <div>
              <WNumberFormatter
                :model-value="12840"
                tag="span"
                class="text-2xl font-bold tabular-nums"
                compact
              />
            </div>
            <span class="text-description text-sm">findings</span>
          </div>

          <div class="grid">
            <WNumberFormatter
              :model-value="0.4375"
              tag="span"
              class="tone-positive text-tone text-2xl font-bold tabular-nums"
              percent
            />
            <span class="text-description text-sm">fixed</span>
          </div>
        </div>
      </DocsHomeTile>

      <!-- Spans the height of the two tiles on the right, so the multiple select has room to grow into without moving the page. -->
      <DocsHomeTile
        title="Select"
        link="/components/select"
      >
        <WSelectSingle
          v-model="assignee"
          :options="USERS"
          :value-getter="item => item.id"
          :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
          :option-component="DocsHomeOptionUser"
          title="Assignee"
          placeholder="Pick a person"
          allow-clear
          :clear-value="null"
        />

        <WSelectSingle
          v-model="severity"
          :options="SEVERITIES"
          :value-getter="item => item.id"
          :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
          :option-component="DocsHomeOptionSeverity"
          title="Severity"
          placeholder="Pick a severity"
        />

        <WSelect
          :model-value="scanners"
          :options="SCANNERS"
          :value-getter="item => item.id"
          :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
          :option-component="DocsHomeOptionScanner"
          title="Scanners"
          placeholder="Add a scanner"
          @select="scanners = [...scanners, $event]"
          @unselect="scanners = scanners.filter(item => item !== $event)"
        />
      </DocsHomeTile>

      <DocsHomeTile
        title="Info cards"
        link="/components/content-blocks#info-cards"
      >
        <WInfoCard
          v-if="!isScanned"
          :semantic-type="SemanticType.WARNING"
        >
          The scanner hasn't run for 30 days — results may be out of date.

          <template #bottom>
            <WButton
              :semantic-type="SemanticType.SECONDARY"
              :loading="isScanning"
              class="mt-3"
              @click="scan"
            >
              Run now
            </WButton>
          </template>
        </WInfoCard>

        <WInfoCard
          v-else
          :semantic-type="SemanticType.POSITIVE"
          :icon="markRaw(IconCheckCircle)"
        >
          All checks passed.

          <template #bottom>
            <WButton
              :semantic-type="SemanticType.SECONDARY"
              class="mt-3"
              @click="isScanned = false"
            >
              Start over
            </WButton>
          </template>
        </WInfoCard>

        <WInfoCardNegative title="The repository can't be reached">
          Check that the access token is still valid.
        </WInfoCardNegative>

        <WInfoCard
          :semantic-type="SemanticType.INFO"
          no-bg
        >
          Without a background, for a note inside other content.
        </WInfoCard>
      </DocsHomeTile>

      <DocsHomeTile
        title="File picker"
        link="/components/pickers#files"
      >
        <WFilePicker
          v-model="files"
          title="Attachments"
          accept="image/*,.pdf"
          multiple
        />

        <span class="text-description -mt-6 text-sm">
          Images and PDFs — drop several at once or browse for them. Each picked file shows as a card you can remove before saving.
        </span>
      </DocsHomeTile>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed, markRaw, onBeforeUnmount, onMounted, ref, watch} from 'vue'

import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'
import {numberCompactFormatter} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WChartHeatmap from 'eco-vue-js/dist/components/Chart/WChartHeatmap.vue'
import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'
import WDatePickerSingle from 'eco-vue-js/dist/components/DatePicker/WDatePickerSingle.vue'
import WDragContainer from 'eco-vue-js/dist/components/DragContainer/WDragContainer.vue'
import WExpansionItem from 'eco-vue-js/dist/components/Expansion/WExpansionItem.vue'
import WFilePicker from 'eco-vue-js/dist/components/FilePicker/WFilePicker.vue'
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
import WInfoCardNegative from 'eco-vue-js/dist/components/InfoCard/WInfoCardNegative.vue'
import WInputOptions from 'eco-vue-js/dist/components/Input/WInputOptions.vue'
import WNumberFormatter from 'eco-vue-js/dist/components/NumberFormatter/WNumberFormatter.vue'
import WProgressStriped from 'eco-vue-js/dist/components/Progress/WProgressStriped.vue'
import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'
import WSliderRange from 'eco-vue-js/dist/components/Slider/WSliderRange.vue'
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'
import WTooltip from 'eco-vue-js/dist/components/Tooltip/WTooltip.vue'

import IconCheckCircle from 'eco-vue-js/dist/assets/icons/IconCheckCircle'
import IconDrag from 'eco-vue-js/dist/assets/icons/IconDrag'
import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'
import IconSummary from 'eco-vue-js/dist/assets/icons/IconSummary'
import IconTime from 'eco-vue-js/dist/assets/icons/IconTime'

import DocsHomeOptionScanner from './DocsHomeOptionScanner.vue'
import DocsHomeOptionSeverity from './DocsHomeOptionSeverity.vue'
import DocsHomeOptionUser from './DocsHomeOptionUser.vue'
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

// Points go newest first, one a day for the last 30 days.
const OPEN_TREND = Array.from({length: 30}, (_, index) => {
  const value = Math.round(120 + 30 * Math.sin(index / 4) - index)

  return {date: +addDay(TODAY, -index), value, min: value - 12, max: value + 12}
})

const FIXED_TREND = Array.from({length: 30}, (_, index) => ({date: +addDay(TODAY, -index), value: Math.max(0, 60 - 2 * index + (index % 5) * 3)}))

const TREND_SERIES = [
  {key: 'open', title: 'Open findings', tone: 'tone-primary text-tone'},
  {key: 'fixed', title: 'Fixed', tone: 'tone-positive text-tone'},
] as const

const visibleSeries = ref<Record<typeof TREND_SERIES[number]['key'], boolean>>({open: true, fixed: true})

const messages = ref(3)

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

const steps = ref(['Clone', 'Build', 'Scan dependencies', 'Scan code', 'Report'])

const threshold = ref(7)
const thresholdEager = ref<number>()

const score = ref({from: 30, to: 70})
const scoreEager = ref<{from: number, to: number}>()

// The eager value is only for showing the drag; the picked value takes over once it ends.
watch(threshold, () => thresholdEager.value = undefined)
watch(score, () => scoreEager.value = undefined)

const FAQ = [
  {title: 'What is scanned?', text: 'Every repository of the project, on each push to the default branch.'},
  {title: 'How long are results kept?', text: 'For a year after the scan, or until the project is deleted.'},
  {title: 'What changed this month?', text: 'Scans now include the container images built from the repository.', flag: true},
]

const openFaq = ref<number | null>(0)

const isScanned = ref(false)
const isScanning = ref(false)

let scanTimer: ReturnType<typeof setTimeout> | undefined

const scan = () => {
  isScanning.value = true
  scanTimer = setTimeout(() => {
    isScanning.value = false
    isScanned.value = true
  }, 1200)
}

const USERS = [
  {id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner'},
  {id: 2, name: 'Alan Turing', email: 'alan@example.com', role: 'Developer'},
  {id: 3, name: 'Grace Hopper', email: 'grace@example.com', role: 'Developer'},
  {id: 4, name: 'Linus Torvalds', email: 'linus@example.com', role: 'Reviewer'},
]

const assignee = ref<number | null>(2)

const SEVERITIES = [
  {id: 'critical', name: 'Critical', sla: 'Fix within 24 hours', tone: 'tone-negative'},
  {id: 'high', name: 'High', sla: 'Fix within a week', tone: 'tone-warning'},
  {id: 'medium', name: 'Medium', sla: 'Fix within a month', tone: 'tone-info'},
  {id: 'low', name: 'Low', sla: 'Fix when convenient', tone: 'tone-positive'},
]

const severity = ref<string | null>('high')

const SCANNERS = [
  {id: 1, name: 'Semgrep', description: 'Static analysis of the source code'},
  {id: 2, name: 'Gitleaks', description: 'Secrets in the code and its history'},
  {id: 3, name: 'Trivy', description: 'Container images and dependencies'},
  {id: 4, name: 'Checkov', description: 'Infrastructure as code'},
]

const scanners = ref<number[]>([1, 3])

const COUNTRIES = [
  {id: 1, name: 'Austria', flag: '🇦🇹'},
  {id: 2, name: 'Belgium', flag: '🇧🇪'},
  {id: 3, name: 'Denmark', flag: '🇩🇰'},
  {id: 4, name: 'France', flag: '🇫🇷'},
  {id: 5, name: 'Germany', flag: '🇩🇪'},
  {id: 6, name: 'Norway', flag: '🇳🇴'},
]

const country = ref<string | null>()

const countries = computed(() => COUNTRIES.filter(item => item.name.toLowerCase().includes(country.value?.toLowerCase() ?? '')))

const files = ref<File[]>([])

onMounted(() => {
  uploadTimer = setInterval(() => {
    const upload = uploads.value[1]

    upload.progress = upload.progress >= 100 ? 0 : Math.min(100, upload.progress + 7)
  }, 400)
})

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  clearTimeout(scanTimer)
  clearInterval(uploadTimer)
})
</script>
