<template>
  <div class="grid grid-cols-1 items-start h-full gap-3 text-left sm:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
    <div class="grid gap-3 sm:translate-y-10">
      <WUniform
        :model-value="project"
        :init-data="initData"
        :api-method="create"
        tag="div"
        class="grid content-start gap-2.5"
        :class="CARD_CLASS"
        full-payload
        @success="isCreated = true"
      >
        <template #default="scope">
          <div class="flex items-center justify-between">
            <span class="font-semibold">New plant</span>

            <WChip
              :text="isCreated ? 'planted' : 'draft'"
              :semantic-type="isCreated ? SemanticType.POSITIVE : SemanticType.WARNING"
            />
          </div>

          <WUniform
            v-bind="scope"
            field="name"
            title="Name"
            required
          >
            <template #field="scopeField">
              <WInput
                v-bind="scopeField"
                placeholder="Monstera"
                allow-clear
              />
            </template>
          </WUniform>

          <WUniform
            v-bind="scope"
            field="tags"
            title="Tags"
          >
            <template #field="scopeField">
              <WSelect
                v-bind="scopeField"
                :options="TAG_OPTIONS"
                :value-getter="item => item.id"
                :search-fn="(item, search) => item.name.includes(search.toLowerCase())"
                :option-component="DocsHomeOptionTag"
                placeholder="Add a tag"
              />
            </template>
          </WUniform>

          <WUniform
            v-bind="scope"
            field="notify"
            title="Watering reminders"
          >
            <template #field="scopeField">
              <WToggle
                v-bind="scopeField"
                description="A note on the days it needs water."
              />
            </template>
          </WUniform>

          <div class="flex justify-end gap-2">
            <WButton
              :semantic-type="SemanticType.SECONDARY"
              :disabled="scope.submitting"
              @click="reset"
            >
              Reset
            </WButton>

            <WButton
              :semantic-type="SemanticType.PRIMARY"
              :loading="scope.submitting"
              @click="scope.submit?.()"
            >
              Add
            </WButton>
          </div>
        </template>
      </WUniform>
    </div>

    <div class="grid gap-3">
      <div
        class="grid grid-cols-1 gap-1.5"
        :class="CARD_CLASS"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-description text-sm">Height</span>

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
          <span class="text-3xl font-bold tabular-nums">{{ points[0].value }} cm</span>

          <span
            class="text-sm font-medium tabular-nums"
            :class="change >= 0 ? 'tone-positive text-tone' : 'tone-negative text-tone'"
          >{{ change > 0 ? '+' : '−' }}{{ Math.abs(change) }}%</span>
        </div>

        <div class="min-h-18">
          <ClientOnly>
            <WChartLinear
              :x-domain="[+addDay(TODAY, 1 - range), +TODAY]"
              :height="72"
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
                  class="tone-positive text-tone"
                >
                  <template #tooltip="{d}">
                    <div class="grid text-sm">
                      <span class="text-description">{{ dateFormat(new Date(d.date)) }}</span>
                      <span class="font-semibold">{{ d.value }} cm</span>
                    </div>
                  </template>
                </WChartLine>
              </template>
            </WChartLinear>
          </ClientOnly>
        </div>
      </div>

      <div
        class="grid gap-2.5"
        :class="CARD_CLASS"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold">Gardeners</span>

          <span class="text-description text-xs tabular-nums">{{ members.length }} of {{ SEATS }} spots</span>
        </div>

        <!-- Keeps the height of all three rows, so removing members doesn't resize the hero. -->
        <div class="grid min-h-26 content-start gap-2.5">
          <div
            v-for="member in members"
            :key="member.email"
            class="flex items-center gap-2.5"
          >
            <span class="tone-primary surface-fill flex size-7 shrink-0 cursor-default items-center justify-center rounded-full text-xs font-semibold">
              {{ member.name.split(' ').map(part => part[0]).join('') }}

              <WTooltip :text="member.email" />
            </span>

            <span class="min-w-0 flex-1 truncate text-sm">{{ member.name }}</span>

            <WChip
              :text="member.role"
              :semantic-type="member.role === 'owner' ? SemanticType.PRIMARY : SemanticType.SECONDARY"
            />

            <WButtonMore>
              <WButtonMoreItem
                :text="member.role === 'owner' ? 'Make member' : 'Make owner'"
                :icon="markRaw(IconEdit)"
                @click="member.role = member.role === 'owner' ? 'member' : 'owner'"
              />

              <WButtonMoreItem
                text="Remove"
                :icon="markRaw(IconTrash)"
                :semantic-type="SemanticType.NEGATIVE"
                @click="confirmRemove(member)"
              />
            </WButtonMore>
          </div>

          <WButton
            v-if="!members.length"
            :semantic-type="SemanticType.SECONDARY"
            class="w-button-h-7 w-button-rounded-lg justify-self-start text-xs"
            @click="members = getDefaultMembers()"
          >
            Invite them back
          </WButton>
        </div>
      </div>

      <div
        class="grid gap-2.5"
        :class="CARD_CLASS"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold">Export care journal</span>

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
import {computed, markRaw, onBeforeUnmount, onMounted, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'
import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'
import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WProgressBar from 'eco-vue-js/dist/components/Progress/WProgressBar.vue'
import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'
import WTooltip from 'eco-vue-js/dist/components/Tooltip/WTooltip.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconCloudSunPartial from 'eco-vue-js/dist/assets/icons/IconCloudSunPartial'
import IconEdit from 'eco-vue-js/dist/assets/icons/IconEdit'
import IconNegativeInfo from 'eco-vue-js/dist/assets/icons/IconNegativeInfo'
import IconPlant from 'eco-vue-js/dist/assets/icons/IconPlant'
import IconRuler from 'eco-vue-js/dist/assets/icons/IconRuler'
import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

import DocsHomeOptionTag, {type Tag} from './DocsHomeOptionTag.vue'

const CARD_CLASS = 'border-line-subtle bg-surface-subtle/80 shadow-primary-dark/35 rounded-xl border p-4 shadow-[0_1.5rem_3rem_-1.5rem] backdrop-blur-md'

const TAG_OPTIONS: Tag[] = [
  {id: 1, name: 'tropical', tone: 'tone-data-green', icon: markRaw(IconPlant)},
  {id: 2, name: 'indoor', tone: 'tone-data-amber', icon: markRaw(IconCloudSunPartial)},
  {id: 3, name: 'climber', tone: 'tone-data-teal', icon: markRaw(IconRuler)},
  {id: 4, name: 'pet-toxic', tone: 'tone-data-red', icon: markRaw(IconNegativeInfo)},
]

type Project = {name: string | undefined, tags: number[], notify: boolean}

const RANGES = [7, 30, 90] as const

const TODAY = getStartOfDay()

// One point a day for the last 90 days, newest first, growing in spurts.
const HISTORY = Array.from({length: 90}, (_, index) => ({
  date: +addDay(TODAY, -index),
  value: Math.round(64 - index * 0.4 + 2 * Math.sin(index / 3)),
}))

const EXPORT_PAGES = 12

const EXPORT_STATUS_TYPE = {
  queued: SemanticType.SECONDARY,
  running: SemanticType.INFO,
  done: SemanticType.POSITIVE,
} as const satisfies Record<string, SemanticType>

const SEATS = 5

type Member = {name: string, email: string, role: 'owner' | 'member'}

const getDefaultProject = (): Project => ({name: 'Monstera', tags: [1, 3], notify: true})

const getDefaultMembers = (): Member[] => [
  {name: 'Carl Linnaeus', email: 'carl@example.com', role: 'owner'},
  {name: 'Gregor Mendel', email: 'gregor@example.com', role: 'member'},
  {name: 'Ernest Wilson', email: 'barbara@example.com', role: 'member'},
]

const project = ref(getDefaultProject())
const isCreated = ref(false)

const initData = (value: Project): Project => ({...value, tags: [...value.tags]})

let createTimer: ReturnType<typeof setTimeout> | undefined

// Stands in for an API call: returns the saved plant, which becomes the form's new initial model.
const create = (payload: Partial<Project>) => new Promise<Project>(resolve => {
  createTimer = setTimeout(() => {
    Notify.success({title: 'Plant added', caption: `${ payload.name } is in the collection${ payload.notify ? ' and reminders are on' : '' }.`})
    resolve(payload as Project)
  }, 900)
})

// A new model object makes the form drop its edits and start over from it.
const reset = () => {
  project.value = getDefaultProject()
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

const members = ref(getDefaultMembers())

const confirmRemove = (member: Member) => {
  Modal.addConfirm({
    title: `Remove ${ member.name }?`,
    description: 'They stop getting care reminders for this garden.',
    acceptText: 'Remove',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: () => {
      members.value = members.value.filter(item => item.email !== member.email)
      Notify.success({title: `${ member.name } removed`})
    },
  })
}

onMounted(runExport)

onBeforeUnmount(() => {
  clearTimeout(createTimer)
  clearTimeout(exportTimer)
})
</script>
