<template>
  <section class="sm:px-(--inner-margin) pb-20 sm:pb-28">
    <div class="sm-not:px-(--inner-margin)">
      <p class="text-accent text-sm font-semibold tracking-[0.2em] uppercase">
        Try them
      </p>

      <h2 class="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Every tile is the real component
      </h2>
    </div>

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
            :icon="markRaw(IconPlant)"
          >
            <div class="grid gap-4 py-3">
              <div class="flex items-center gap-3">
                <span class="tone-positive bg-tone/15 text-tone-fill flex size-12 shrink-0 items-center justify-center rounded-xl"><IconPlant class="square-8" /></span>

                <div class="grid min-w-0 flex-1">
                  <span class="truncate font-semibold">Monstera deliciosa</span>
                  <span class="text-description truncate text-sm">Swiss cheese plant · Araceae</span>
                </div>

                <div class="hidden flex-wrap justify-end gap-1.5 sm:flex">
                  <WChip
                    text="tropical"
                    :semantic-type="SemanticType.POSITIVE"
                  />

                  <WChip
                    text="pet-toxic"
                    :semantic-type="SemanticType.NEGATIVE"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div
                  v-for="stat in PLANT_STATS"
                  :key="stat.title"
                  class="bg-tone/10 grid gap-1 rounded-xl p-4"
                  :class="stat.tone"
                >
                  <component
                    :is="stat.icon"
                    class="square-[1.25em] text-tone-fill"
                  />
                  <span class="text-tone text-sm font-semibold">{{ stat.value }}</span>
                  <span class="text-description text-xs">{{ stat.title }}</span>
                </div>
              </div>
            </div>
          </WTabsItem>

          <WTabsItem
            name="care"
            title="Care"
            :icon="markRaw(IconSun)"
          >
            <div class="grid gap-5 py-3 sm:grid-cols-2">
              <div class="grid content-start gap-3">
                <div
                  v-for="level in PLANT_LEVELS"
                  :key="level.title"
                  class="grid gap-1.5"
                  :class="level.tone"
                >
                  <div class="flex justify-between text-sm">
                    <span>{{ level.title }}</span>
                    <span class="text-tone font-semibold tabular-nums">{{ level.value }}%</span>
                  </div>

                  <div class="bg-surface-muted h-2 overflow-hidden rounded-full">
                    <div
                      class="bg-tone-fill h-full rounded-full"
                      :style="{width: `${ level.value }%`}"
                    />
                  </div>
                </div>
              </div>

              <div class="grid content-start gap-2">
                <span class="text-description text-sm">This week</span>

                <div class="grid grid-cols-7 gap-1.5">
                  <div
                    v-for="item in CARE_WEEK"
                    :key="item.day"
                    class="grid justify-items-center gap-1"
                  >
                    <span class="text-description text-xs">{{ item.day }}</span>

                    <span
                      class="flex aspect-square w-full items-center justify-center rounded-lg text-sm"
                      :class="item.task ? `${ CARE_TASKS[item.task].tone } bg-tone/15` : 'bg-surface-muted'"
                    ><component
                      :is="CARE_TASKS[item.task].icon"
                      v-if="item.task"
                      class="square-[1.25em]"
                    /></span>
                  </div>
                </div>

                <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <span
                    v-for="task in Object.values(CARE_TASKS)"
                    :key="task.title"
                    class="flex items-center gap-1.5"
                    :class="task.tone"
                  >
                    <span class="bg-tone-fill size-2 rounded-full" />
                    {{ task.title }}
                  </span>
                </div>
              </div>
            </div>
          </WTabsItem>

          <WTabsItem
            name="journal"
            title="Journal"
            :icon="markRaw(IconNote)"
            :count="JOURNAL.length"
          >
            <div class="grid py-3">
              <div
                v-for="(entry, index) in JOURNAL"
                :key="entry.title"
                class="grid grid-cols-[auto_1fr] gap-x-3"
                :class="entry.tone"
              >
                <div class="flex flex-col items-center">
                  <span class="bg-tone-fill ring-tone/20 mt-1.5 size-2.5 rounded-full ring-4" />

                  <span
                    v-if="index < JOURNAL.length - 1"
                    class="bg-line-subtle w-px flex-1"
                  />
                </div>

                <div class="grid pb-3 text-sm">
                  <div class="flex justify-between gap-2">
                    <span class="text-tone font-semibold">{{ entry.title }}</span>
                    <span class="text-description shrink-0 text-xs">{{ entry.when }}</span>
                  </div>

                  <span class="text-description">{{ entry.text }}</span>
                </div>
              </div>
            </div>
          </WTabsItem>
        </WTabs>
      </DocsHomeTile>

      <DocsHomeTile
        title="Date picker"
        link="/components/pickers"
        class="lg:row-span-2"
      >
        <WDatePicker
          v-model="vacation"
          :min-date="TODAY"
        />

        <span class="text-description text-sm">
          {{ vacation ? `Plant-sitter needed ${ dateFormatShort(vacation.from) } – ${ dateFormatShort(vacation.to) }` : 'Pick your vacation dates' }}
        </span>
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
            Buds

            <WCounter
              :count="buds"
              :trigger="1"
              class="absolute -top-2 left-full text-xs"
            />
          </span>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            @click="buds++"
          >
            New bud
          </WButton>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-sm [&_svg]:square-5">
          <span class="flex items-center gap-2"><WStatusIcon /> Not checked</span>
          <span class="flex items-center gap-2"><WStatusIcon has-value /> Watered</span>
          <span class="flex items-center gap-2"><WStatusIcon has-error /> Wilted</span>
        </div>
      </DocsHomeTile>

      <DocsHomeTile
        title="Checkboxes"
        link="/components/checkbox"
      >
        <WCheckboxGroup
          v-model="light"
          :list="LIGHTS"
          :title-map="LIGHT_TITLES"
          radio
          wrap
          no-margin
        />

        <WCheckboxGroupMultiple
          :model-value="reminders"
          :list="REMINDERS"
          :title-map="REMINDER_TITLES"
          title="Remind me to"
          wrap
          no-margin
          @select="reminders = [...reminders, $event]"
          @unselect="reminders = reminders.filter(item => item !== $event)"
        />

        <WCheckbox
          v-model="isPetSafe"
          title="Pet-safe plants only"
          no-margin
        />
      </DocsHomeTile>

      <DocsHomeTile
        title="Heatmap"
        link="/components/charts"
        class="lg:col-span-2"
      >
        <ClientOnly>
          <WChartHeatmap
            :data="WATERINGS"
            x-key="date"
            y-key="count"
            title="Waterings in the last year"
            class="tone-primary text-tone-fill"
          >
            <template #tooltip="{d}">
              {{ d.count }} waterings on {{ dateFormatShort(new Date(d.date)) }}
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
          v-for="tray in trays"
          :key="tray.name"
          class="grid gap-1.5"
        >
          <div class="flex justify-between text-sm">
            <span class="truncate">{{ tray.name }}</span>

            <span class="text-description tabular-nums">
              {{ tray.progress <= 0 ? 'Just sown' : tray.progress >= 100 ? 'Sprouted' : `${ Math.round(tray.progress) }%` }}
            </span>
          </div>

          <WProgressStriped
            :model-value="tray.progress"
            class="h-1.5"
          />
        </div>
      </DocsHomeTile>

      <DocsHomeTile
        title="Notifications"
        link="/components/notify"
      >
        <div class="flex flex-wrap gap-2">
          <WButton
            :semantic-type="SemanticType.POSITIVE"
            @click="Notify.success({title: 'Watered', caption: 'Next watering in 7 days.'})"
          >
            Success
          </WButton>

          <WButton
            :semantic-type="SemanticType.WARNING"
            @click="Notify.warn({title: 'Check the leaves', caption: 'Yellow tips can mean too much water.'})"
          >
            Warning
          </WButton>

          <WButton
            :semantic-type="SemanticType.NEGATIVE"
            @click="Notify.error({title: 'Sensor offline', caption: 'The greenhouse probe stopped reporting.'})"
          >
            Error
          </WButton>
        </div>

        <div class="flex flex-wrap gap-2">
          <WButton
            :semantic-type="SemanticType.PRIMARY"
            @click="repot"
          >
            In progress
          </WButton>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            @click="Notify.error({title: 'Sensor offline', caption: 'The greenhouse probe stopped reporting.', channel: NotifyChannel.ACTION})"
          >
            Needs action
          </WButton>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            @click="checkSoil"
          >
            Group
          </WButton>
        </div>

        <span class="text-description text-sm">
          Ones that need action stay until closed and count on the bell in the header, where the history is kept.
        </span>

        <div class="flex items-center gap-3">
          <div class="border-line-subtle bg-surface grid aspect-16/10 w-24 shrink-0 grid-cols-3 grid-rows-[1fr_auto] gap-1.5 rounded-md border p-1.5">
            <button
              v-for="option in NOTIFY_POSITIONS"
              :key="option.value"
              class="tone-primary h-2.5 cursor-pointer rounded-sm border transition-colors"
              :class="[
                option.class,
                notifyPosition === option.value ? 'bg-tone-fill border-tone-fill' : 'border-line-subtle bg-surface-raised hover:border-tone-line',
              ]"
              :aria-label="option.label"
              :aria-pressed="notifyPosition === option.value"
              @click="moveToasts(option)"
            />
          </div>

          <span class="text-description text-sm">Click a spot to move the toasts.</span>
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
              :class="{'border-dashed': series.key === 'humidity'}"
            />
            {{ series.title }}
          </button>
        </div>

        <div class="h-50 -mt-4">
          <ClientOnly>
            <WChartLinear
              :x-domain="[+addDay(TODAY, -29), +TODAY]"
              :height="200"
              :y-format="value => `${ numberCompactFormatter.format(value) }%`"
              y-right
            >
              <template #default="scope">
                <WChartLine
                  v-if="visibleSeries.humidity"
                  v-bind="scope"
                  :data="HUMIDITY_TREND"
                  x-key="date"
                  y-key="value"
                  stroke-style="dashed-small"
                  has-area
                  class="tone-positive text-tone"
                />

                <WChartLine
                  v-if="visibleSeries.moisture"
                  v-bind="scope"
                  :data="MOISTURE_TREND"
                  x-key="date"
                  y-key="value"
                  y-key-min="min"
                  y-key-max="max"
                  class="tone-info text-tone"
                >
                  <template #tooltip="{d, index}">
                    <div class="grid text-sm text-start">
                      <span class="text-description text-xs">{{ dateFormatShort(new Date(d.date)) }}</span>
                      <span class="font-semibold">{{ d.value }}% soil moisture <span class="text-description">±{{ d.max - d.value }}%</span></span>
                      <span class="font-semibold">{{ HUMIDITY_TREND[index!].value }}% air humidity</span>
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
            class="tone-positive bg-tone/15 flex size-10 shrink-0 items-center justify-center rounded-full text-xl"
          >
            🌵
          </div>

          <div class="grid min-w-0 flex-1 text-sm">
            <WSkeleton v-if="isLoading" />

            <span
              v-else
              class="font-semibold"
            >Golden barrel cactus</span>

            <WSkeleton v-if="isLoading" />

            <span
              v-else
              class="text-description truncate"
            >Echinocactus grusonii · water monthly</span>
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

        <span class="text-description text-sm">Drag by the handle to change the planting order.</span>
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
            Zone 10
            <WTooltip text="Survives frost down to −1 °C." />
          </span>

          <span class="cursor-help underline decoration-dotted">
            Last watered
            <WTooltip>
              <div class="grid gap-1">
                <b>2 days ago</b>
                <span>250 ml · the soil was dry</span>
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
          Monstera deliciosa 'Thai Constellation'
          <WTooltip
            text="Monstera deliciosa 'Thai Constellation'"
            overflow-only
          />
        </span>
      </DocsHomeTile>

      <DocsHomeTile
        title="Suggestions"
        link="/components/input#suggestions"
      >
        <WInputOptions
          v-model="plantName"
          title="Plant"
          placeholder="Start typing"
          :options="plantNames"
          :value-getter="option => option.name"
          empty-stub="No such plant"
          allow-clear
        >
          <template #option="{option}">
            <div
              class="w-option flex items-center gap-2"
              :class="option.tone"
            >
              <IconPlant class="text-tone square-[1.25em] shrink-0" />
              <span class="truncate">{{ option.name }} <span class="text-description italic">{{ option.species }}</span></span>
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
            <span class="text-description text-sm">seeds sown</span>
          </div>

          <div class="grid">
            <WNumberFormatter
              :model-value="0.4375"
              tag="span"
              class="tone-positive text-tone text-2xl font-bold tabular-nums"
              percent
            />
            <span class="text-description text-sm">sprouted</span>
          </div>
        </div>
      </DocsHomeTile>

      <!-- Spans the height of the two tiles on the right, so the multiple select has room to grow into without moving the page. -->
      <DocsHomeTile
        title="Select"
        link="/components/select"
      >
        <WSelectSingle
          v-model="caretaker"
          :options="gardeners"
          :value-getter="item => item.id"
          :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
          :option-component="OptionGardener"
          title="Caretaker"
          placeholder="Pick a person"
          allow-clear
          :clear-value="null"
        />

        <WSelectSingle
          v-model="health"
          :options="HEALTH"
          :value-getter="item => item.id"
          :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
          :option-component="DocsHomeOptionHealth"
          title="Health"
          placeholder="Pick a state"
        />

        <WSelect
          :model-value="companions"
          :options="COMPANIONS"
          :value-getter="item => item.id"
          :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
          :option-component="DocsHomeOptionCompanion"
          title="Companion plants"
          placeholder="Add a companion"
          @select="companions = [...companions, $event]"
          @unselect="companions = companions.filter(item => item !== $event)"
        />
      </DocsHomeTile>

      <DocsHomeTile
        title="Info cards"
        link="/components/content-blocks#info-cards"
      >
        <WInfoCard
          :icon="markRaw(IconDanger)"
          :semantic-type="SemanticType.NEGATIVE"
        >
          The greenhouse sensor is offline

          <template #bottom>
            Check its battery and the Wi-Fi signal.
          </template>
        </WInfoCard>

        <WInfoCard
          :semantic-type="SemanticType.INFO"
          no-bg
        >
          Without a background, for a note inside other content.
        </WInfoCard>

        <WInfoCard
          v-if="!isWatered"
          :semantic-type="SemanticType.WARNING"
        >
          The fern hasn't been watered for 9 days — the soil is getting dry.

          <template #bottom>
            <WButton
              :semantic-type="SemanticType.SECONDARY"
              :loading="isWatering"
              class="mt-3"
              @click="water"
            >
              Water now
            </WButton>
          </template>
        </WInfoCard>

        <WInfoCard
          v-else
          :semantic-type="SemanticType.POSITIVE"
          :icon="markRaw(IconCheckCircle)"
        >
          Watered — the soil is moist again.

          <template #bottom>
            <WButton
              :semantic-type="SemanticType.SECONDARY"
              class="mt-3"
              @click="isWatered = false"
            >
              Start over
            </WButton>
          </template>
        </WInfoCard>
      </DocsHomeTile>

      <DocsHomeTile
        title="File picker"
        link="/components/pickers#files"
      >
        <WFilePicker
          v-model="files"
          title="Plant photos"
          accept="image/*"
          multiple
        />

        <span class="text-description -mt-6 text-sm">
          Photos of the leaves and roots — drop several at once or browse for them. Each picked file shows as a card you can remove before saving.
        </span>
      </DocsHomeTile>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed, markRaw, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'

import type {DateRange} from 'eco-vue-js/dist/components/DatePicker/models/types'
import {NotifyChannel} from 'eco-vue-js/dist/components/Notify/models/NotifyType'
import type {NotifyPosition} from 'eco-vue-js/dist/components/Notify/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, dateFormatShort, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'
import {numberCompactFormatter} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WChartHeatmap from 'eco-vue-js/dist/components/Chart/WChartHeatmap.vue'
import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
import WCheckboxGroupMultiple from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroupMultiple.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'
import WDatePicker from 'eco-vue-js/dist/components/DatePicker/WDatePicker.vue'
import WDragContainer from 'eco-vue-js/dist/components/DragContainer/WDragContainer.vue'
import WExpansionItem from 'eco-vue-js/dist/components/Expansion/WExpansionItem.vue'
import WFilePicker from 'eco-vue-js/dist/components/FilePicker/WFilePicker.vue'
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
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
import IconDanger from 'eco-vue-js/dist/assets/icons/IconDanger'
import IconDrag from 'eco-vue-js/dist/assets/icons/IconDrag'
import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'
import IconFilter from 'eco-vue-js/dist/assets/icons/IconFilter'
import IconNegativeInfo from 'eco-vue-js/dist/assets/icons/IconNegativeInfo'
import IconNote from 'eco-vue-js/dist/assets/icons/IconNote'
import IconPlant from 'eco-vue-js/dist/assets/icons/IconPlant'
import IconRuler from 'eco-vue-js/dist/assets/icons/IconRuler'
import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'
import IconWind from 'eco-vue-js/dist/assets/icons/IconWind'

import NotifyRepotProgress from '@/components/Notify/docs/examples/parts/NotifyRepotProgress.vue'

import DocsHomeOptionCompanion, {type Companion} from './DocsHomeOptionCompanion.vue'
import DocsHomeOptionHealth, {type Health} from './DocsHomeOptionHealth.vue'
import DocsHomeTile from './DocsHomeTile.vue'

import {gardeners} from '../../../examples/shared/Gardener'
import OptionGardener from '../../../examples/shared/OptionGardener.vue'
import {notifyPosition} from '../notifyPosition'

const TODAY = getStartOfDay()

const PLANT_STATS = [
  {title: 'Water every', value: '7 days', icon: markRaw(IconDrop), tone: 'tone-info'},
  {title: 'Light', value: 'Bright, indirect', icon: markRaw(IconSun), tone: 'tone-warning'},
  {title: 'Humidity', value: '60–80%', icon: markRaw(IconWind), tone: 'tone-primary'},
  {title: 'Height', value: '1.2 m', icon: markRaw(IconRuler), tone: 'tone-positive'},
]

const PLANT_LEVELS = [
  {title: 'Soil moisture', value: 62, tone: 'tone-info'},
  {title: 'Light today', value: 81, tone: 'tone-warning'},
  {title: 'Nutrients', value: 34, tone: 'tone-positive'},
]

const CARE_TASKS = {
  water: {title: 'Water', icon: markRaw(IconDrop), tone: 'tone-info'},
  feed: {title: 'Feed', icon: markRaw(IconPlant), tone: 'tone-positive'},
  mist: {title: 'Mist', icon: markRaw(IconWind), tone: 'tone-primary'},
} as const

const CARE_WEEK: {day: string, task?: keyof typeof CARE_TASKS}[] = [
  {day: 'Mo', task: 'water'},
  {day: 'Tu'},
  {day: 'We', task: 'mist'},
  {day: 'Th', task: 'feed'},
  {day: 'Fr', task: 'water'},
  {day: 'Sa', task: 'mist'},
  {day: 'Su'},
]

const JOURNAL = [
  {title: 'New leaf unfurled', when: 'Today', text: 'The fifth one this year, with its first split.', tone: 'tone-positive'},
  {title: 'Repotted', when: '2 weeks ago', text: 'Moved into a 25 cm pot with an orchid bark mix.', tone: 'tone-primary'},
  {title: 'Spider mites', when: 'Last month', text: 'Wiped the leaves and treated them with neem oil.', tone: 'tone-negative'},
]

const LIGHTS = ['shade', 'partial', 'sun'] as const

const LIGHT_TITLES: Record<typeof LIGHTS[number], string> = {shade: 'Shade', partial: 'Partial sun', sun: 'Full sun'}

const REMINDERS = ['water', 'mist', 'feed', 'repot'] as const

const REMINDER_TITLES: Record<typeof REMINDERS[number], string> = {water: 'Water', mist: 'Mist', feed: 'Feed', repot: 'Repot'}

// A made-up count for every day of the last year, more often in the summer months.
const WATERINGS = Array.from({length: 365}, (_, index) => {
  const date = addDay(TODAY, -index)
  const summer = Math.max(0, Math.cos((date.getMonth() - 6) / 6 * Math.PI))

  return {date: +date, count: (index * 7) % 5 < 2 + Math.round(summer * 2) ? 1 + Math.round(summer * 3) + (index % 3) : 0}
}).filter(item => item.count > 0)

// Points go newest first, one a day for the last 30 days; the soil dries out between waterings every 7 days.
const MOISTURE_TREND = Array.from({length: 30}, (_, index) => {
  const value = Math.round(75 - (index % 7) * 3 + 4 * Math.sin(index / 5))

  return {date: +addDay(TODAY, -index), value, min: value - 10, max: value + 10}
})

const HUMIDITY_TREND = Array.from({length: 30}, (_, index) => ({date: +addDay(TODAY, -index), value: Math.round(30 + 10 * Math.sin(index / 3) + (index % 4) * 2)}))

const TREND_SERIES = [
  {key: 'moisture', title: 'Soil moisture', tone: 'tone-info text-tone'},
  {key: 'humidity', title: 'Air humidity', tone: 'tone-positive text-tone'},
] as const

const visibleSeries = ref<Record<typeof TREND_SERIES[number]['key'], boolean>>({moisture: true, humidity: true})

const repotTimers = new Set<ReturnType<typeof setInterval>>()

// The progress lives in a reactive object outside the content, since the toast and the notify center each render a copy of it.
const repot = () => {
  const task = reactive({done: 0, total: 8})

  Notify.process({title: 'Repotting seedlings', component: markRaw(NotifyRepotProgress), componentProps: {task}})

  const timer = setInterval(() => {
    task.done++

    if (task.done !== task.total) return

    clearInterval(timer)
    repotTimers.delete(timer)
  }, 500)

  repotTimers.add(timer)
}

const DRY_SOIL_GROUP = {key: 'dry-soil', title: 'Soil is dry', caption: 'These beds need water.'}

const checkSoil = () => {
  ['Bed 1', 'Bed 4', 'Bed 7'].forEach(bed => Notify.warn({title: 'Soil is dry', caption: bed, group: DRY_SOIL_GROUP}))
}

type NotifyPositionOption = {value: NotifyPosition, label: string, class: string}

const NOTIFY_POSITIONS: NotifyPositionOption[] = [
  {value: 'top-center', label: 'Top center', class: 'col-start-2 row-start-1'},
  {value: 'top-right', label: 'Top right', class: 'col-start-3 row-start-1'},
  {value: 'bottom-center', label: 'Bottom center', class: 'col-start-2 row-start-2'},
  {value: 'bottom-right', label: 'Bottom right', class: 'col-start-3 row-start-2'},
]

// The site's position, put back when leaving the home page.
const initialNotifyPosition = notifyPosition.value

const moveToasts = (option: NotifyPositionOption) => {
  notifyPosition.value = option.value

  Notify.success({title: `Toasts at ${ option.label.toLowerCase() }`, caption: `position="${ option.value }"`})
}

const buds = ref(3)

const vacation = ref<DateRange | undefined>({from: addDay(TODAY, 9), to: addDay(TODAY, 16)})
const reminders = ref<typeof REMINDERS[number][]>(['water', 'mist'])
const light = ref<typeof LIGHTS[number]>('partial')
const isPetSafe = ref(true)
const isLoading = ref(true)
const isSaving = ref(false)

let saveTimer: ReturnType<typeof setTimeout> | undefined

const save = () => {
  isSaving.value = true
  saveTimer = setTimeout(() => isSaving.value = false, 1200)
}

// Four seed trays, one just sown, two sprouting and one done; the first sprouting one starts over when it is done.
const trays = ref([
  {name: 'Basil', progress: 100},
  {name: 'Cherry tomatoes', progress: 35},
  {name: 'Mint', progress: 82},
  {name: 'Lavender', progress: 0},
])

let trayTimer: ReturnType<typeof setInterval> | undefined

const steps = ref(['Add drainage', 'Fill with soil', 'Plant the seedling', 'Water', 'Mulch'])

const threshold = ref(7)
const thresholdEager = ref<number>()

const score = ref({from: 30, to: 70})
const scoreEager = ref<{from: number, to: number}>()

// The eager value is only for showing the drag; the picked value takes over once it ends.
watch(threshold, () => thresholdEager.value = undefined)
watch(score, () => scoreEager.value = undefined)

const FAQ = [
  {title: 'How often should I water?', text: 'When the top 2 cm of soil is dry — about once a week for most houseplants.'},
  {title: 'Does it need direct sun?', text: 'Bright indirect light is best; direct afternoon sun scorches the leaves.'},
  {title: 'What changes in autumn?', text: 'Growth slows down, so feed once a month instead of every two weeks.', flag: true},
]

const openFaq = ref<number | null>(0)

const isWatered = ref(false)
const isWatering = ref(false)

let waterTimer: ReturnType<typeof setTimeout> | undefined

const water = () => {
  isWatering.value = true
  waterTimer = setTimeout(() => {
    isWatering.value = false
    isWatered.value = true
  }, 1200)
}
const caretaker = ref<number | null>(2)

const HEALTH: Health[] = [
  {id: 'thriving', name: 'Thriving', description: 'New growth every week', tone: 'tone-positive', icon: markRaw(IconPlant)},
  {id: 'thirsty', name: 'Thirsty', description: 'Drooping leaves, dry soil', tone: 'tone-info', icon: markRaw(IconDrop)},
  {id: 'stressed', name: 'Stressed', description: 'Yellow or brown leaf tips', tone: 'tone-warning', icon: markRaw(IconSun)},
  {id: 'pests', name: 'Pests', description: 'Webs or spots under the leaves', tone: 'tone-negative', icon: markRaw(IconNegativeInfo)},
]

const health = ref<string | null>('thirsty')

const COMPANIONS: Companion[] = [
  {id: 1, name: 'Basil', role: 'Repels', description: 'Keeps aphids and whiteflies off', tone: 'tone-data-teal', icon: markRaw(IconWind)},
  {id: 2, name: 'Marigold', role: 'Roots', description: 'Keeps nematodes away from the roots', tone: 'tone-data-amber', icon: markRaw(IconPlant)},
  {id: 3, name: 'Nasturtium', role: 'Trap crop', description: 'Draws pests away to itself', tone: 'tone-data-orange', icon: markRaw(IconFilter)},
  {id: 4, name: 'Borage', role: 'Bees', description: 'Brings in bees and other pollinators', tone: 'tone-data-violet', icon: markRaw(IconSun)},
]

const companions = ref<number[]>([1, 3])

const PLANTS = [
  {id: 1, name: 'Cactus', species: 'Cactaceae', tone: 'tone-data-green'},
  {id: 2, name: 'Cherry blossom', species: 'Prunus serrulata', tone: 'tone-data-pink'},
  {id: 3, name: 'Rose', species: 'Rosa', tone: 'tone-data-red'},
  {id: 4, name: 'Sunflower', species: 'Helianthus annuus', tone: 'tone-data-amber'},
  {id: 5, name: 'Tulip', species: 'Tulipa', tone: 'tone-data-fuchsia'},
  {id: 6, name: 'Hibiscus', species: 'Hibiscus rosa-sinensis', tone: 'tone-data-orange'},
]

const plantName = ref<string | null>()

const plantNames = computed(() => PLANTS.filter(item => item.name.toLowerCase().includes(plantName.value?.toLowerCase() ?? '')))

const files = ref<File[]>([])

onMounted(() => {
  trayTimer = setInterval(() => {
    const tray = trays.value[1]

    tray.progress = tray.progress >= 100 ? 0 : Math.min(100, tray.progress + 7)
  }, 400)
})

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  clearTimeout(waterTimer)
  clearInterval(trayTimer)
  repotTimers.forEach(timer => clearInterval(timer))
  notifyPosition.value = initialNotifyPosition
})
</script>
