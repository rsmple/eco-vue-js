<template>
  <!--
    As an app's main column: a `1fr` track grows to the list's width and the item in it with the track, so the content
    above the list has room to stick (a sticky box stays inside its parent's box, not the grid area).
  -->
  <div class="grid grid-cols-[1fr]">
    <main class="w-page-pb">
      <div class="grid grid-cols-[minmax(0,1fr)] gap-6 pb-6">
        <div class="w-page-sticky flex flex-wrap items-center gap-2">
          <span class="text-description text-sm">Layout style</span>

          <button
            v-for="item in LAYOUTS"
            :key="item.id"
            class="rounded-lg border border-solid px-3 py-1 text-sm"
            :class="layout === item.id ? 'tone-primary border-tone-line text-tone bg-tone-soft' : 'border-line-subtle text-description'"
            @click="setToken('layout', item.id)"
          >
            {{ item.name }}
          </button>
        </div>

        <div class="sm:w-page-bleed grid grid-cols-2 gap-(--w-chrome-gap,1rem) lg:grid-cols-4">
          <div
            v-for="stat in STATS"
            :key="stat.title"
            class="surface-card grid gap-1"
          >
            <span class="text-description text-sm">{{ stat.title }}</span>

            <span class="text-accent text-2xl font-semibold">{{ stat.value }}</span>

            <span
              class="bg-tone-soft text-tone w-fit rounded-md px-1.5 text-xs font-medium"
              :class="stat.tone"
            >{{ stat.change }}</span>
          </div>
        </div>

        <section class="surface-section grid gap-4">
          <h2 class="text-accent text-xl font-semibold">
            Watering schedule
          </h2>

          <div class="grid grid-cols-[auto_1fr_auto] gap-x-6 gap-y-3 text-sm">
            <template
              v-for="item in SCHEDULE"
              :key="item.day"
            >
              <span class="text-accent font-medium">{{ item.day }}</span>

              <span class="text-description">{{ item.beds }}</span>

              <span class="text-description">{{ item.plants }} plants</span>
            </template>
          </div>
        </section>

        <section class="surface-section grid gap-4">
          <h2 class="text-accent text-xl font-semibold">
            Settings
          </h2>

          <WInfoCard :semantic-type="SemanticType.WARNING">
            The moisture sensors haven't reported for 3 days — readings may be out of date.
          </WInfoCard>

          <WTabs
            :init-tab="tab"
            divider
            @update:current="tab = $event"
          >
            <WTabsItem
              name="profile"
              title="Profile"
            >
              <div class="grid max-w-md gap-2">
                <WInput
                  v-model="name"
                  title="Name"
                  placeholder="Monstera"
                  allow-clear
                />

                <WInput
                  v-model="notes"
                  title="Notes"
                  textarea
                />
              </div>
            </WTabsItem>

            <WTabsItem
              name="beds"
              title="Beds"
            >
              <div class="grid grid-cols-2 gap-3">
                <div class="surface-card">
                  <p class="text-accent font-medium">
                    North bed
                  </p>

                  <p class="text-description text-sm">
                    A card inside a section: filled, one step off.
                  </p>

                  <div class="surface-card mt-3">
                    <p class="text-description text-sm">
                      A card inside that card.
                    </p>
                  </div>
                </div>

                <div class="surface-card">
                  <p class="text-accent font-medium">
                    South bed
                  </p>

                  <p class="text-description text-sm">
                    12 plants
                  </p>
                </div>
              </div>
            </WTabsItem>
          </WTabs>

          <div class="flex gap-2">
            <WButton :semantic-type="SemanticType.PRIMARY">
              Save
            </WButton>

            <WButton :semantic-type="SemanticType.SECONDARY">
              Cancel
            </WButton>
          </div>
        </section>
      </div>

      <PlantList scroll-page />
    </main>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

import {LAYOUTS, setToken, themeTokens} from '../../.vitepress/theme/docsTheme'
import PlantList from '../recipes/plant-list/PlantList.vue'

const STATS = [
  {title: 'Plants', value: '128', change: '+4 this week', tone: 'tone-positive'},
  {title: 'Due for water', value: '17', change: '3 overdue', tone: 'tone-warning'},
  {title: 'Dry', value: '2', change: '−1 since Monday', tone: 'tone-negative'},
  {title: 'Caretakers', value: '6', change: 'no change', tone: 'tone-info'},
]

const SCHEDULE = [
  {day: 'Monday', beds: 'North bed, greenhouse', plants: 34},
  {day: 'Wednesday', beds: 'South bed', plants: 21},
  {day: 'Thursday', beds: 'Greenhouse', plants: 18},
  {day: 'Saturday', beds: 'North bed, south bed', plants: 45},
  {day: 'Sunday', beds: 'Hanging baskets', plants: 10},
]

// The theme's layout token, as the playground sets it.
const layout = computed(() => themeTokens.value.layout ?? 'flat')
const tab = ref('profile')
const name = ref<string | undefined>()
const notes = ref<string | undefined>()

onMounted(() => {
  // The page scrolls sideways under a wide list, as an app page does: the docs shell clips that elsewhere.
  document.documentElement.classList.add('docs-scroll-x')
})

onUnmounted(() => {
  document.documentElement.classList.remove('docs-scroll-x')
})
</script>
