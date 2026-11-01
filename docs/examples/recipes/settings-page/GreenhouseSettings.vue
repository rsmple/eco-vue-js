<template>
  <div class="grid gap-6">
    <div class="grid gap-2">
      <a
        href="#"
        class="text-description hover:text-accent flex w-fit items-center gap-1 text-sm"
        @click.prevent
      >
        <IconBack class="square-4" /> Greenhouses
      </a>

      <div class="flex flex-wrap items-center gap-4">
        <h1 class="text-accent mr-auto text-2xl font-semibold">
          North greenhouse
        </h1>

        <WButton :semantic-type="SemanticType.SECONDARY">
          Discard
        </WButton>

        <WButton :semantic-type="SemanticType.PRIMARY">
          Save all
        </WButton>
      </div>
    </div>

    <div class="surface-stack-divided">
      <WSection
        eyebrow="Step 1"
        title="Climate"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <WInput
            v-model="temperature"
            type="number"
            title="Day temperature, °C"
            no-margin
          />

          <WInput
            v-model="humidity"
            type="number"
            title="Humidity, %"
            no-margin
          />
        </div>

        <WSection title="Night">
          <WToggle
            v-model="night"
            title="Lower the temperature at night"
            description="By 4 °C, from sunset to sunrise."
          />
        </WSection>

        <WSection title="Ventilation">
          <WToggle
            v-model="vents"
            title="Open the vents above the day temperature"
          />
        </WSection>
      </WSection>

      <WSection
        eyebrow="Step 2"
        title="Watering"
      >
        <WInfoCard>
          The schedule waters every bed at once. Beds with their own sensor skip a run while their soil is wet.
        </WInfoCard>

        <div class="grid gap-4 sm:grid-cols-2">
          <WInput
            v-model="time"
            title="Start at"
            no-margin
          />

          <WInput
            v-model="minutes"
            type="number"
            title="Minutes per bed"
            no-margin
          />
        </div>

        <WCard title="Beds with a sensor">
          <div
            v-for="bed in BEDS"
            :key="bed.name"
            class="flex justify-between gap-2 text-sm"
          >
            <span class="text-accent">{{ bed.name }}</span>
            <span class="text-description">{{ bed.moisture }}% moisture</span>
          </div>
        </WCard>
      </WSection>

      <WSection title="Notifications">
        <template #actions>
          <WButton :semantic-type="SemanticType.SECONDARY">
            Send a test
          </WButton>
        </template>

        <WToggle
          v-model="notifyDry"
          title="A bed is dry"
        />

        <WToggle
          v-model="notifyHeat"
          title="The temperature is out of range"
        />

        <template #footer>
          <WButton :semantic-type="SemanticType.PRIMARY">
            Save
          </WButton>
        </template>
      </WSection>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WCard from 'eco-vue-js/dist/components/Surface/WCard.vue'
import WSection from 'eco-vue-js/dist/components/Surface/WSection.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconBack from 'eco-vue-js/dist/assets/icons/IconBack'

const BEDS = [
  {name: 'North bed', moisture: 42},
  {name: 'Herb bed', moisture: 31},
]

const temperature = ref<number | undefined>(24)
const humidity = ref<number | undefined>(60)
const night = ref(true)
const vents = ref(true)
const time = ref<string | undefined>('06:30')
const minutes = ref<number | undefined>(5)
const notifyDry = ref(true)
const notifyHeat = ref(false)
</script>
