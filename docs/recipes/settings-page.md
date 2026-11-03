---
group: Recipes
order: 4
description: A settings page split into WSection groups that read apart in every layout style — separate surfaces in card and glass, lines between them in flat — with steps, parts inside a group, hints, an inner card and a Save under the group.
---

# Settings page

**Problem:** a settings or setup page has several groups — the steps of a setup, the areas of a configuration. In card and glass each group is its own surface, but in flat they run together into one column, and nothing shows where one group ends and the next begins.

**Pattern:** the page title and the page's buttons sit on the page, outside any section. Each group is a `WSection`. On the page (`w-page`) the kit sets them apart on its own; off it, as in the demo below, the groups go in `surface-stack-divided`:

| Piece | What it is |
| --- | --- |
| `surface-stack-divided` | Sections one after another: the theme's gap between them in card and glass, and a line with space around it in flat. Content in it that is not a section, such as a page list, gets the same space in flat, without the line. |
| `eyebrow` | A short line above a section's heading, such as a step number. |
| A `WSection` inside a section | A part of the group: it paints nothing, its heading is smaller and one level down, and a line sits above it when content comes before it. |
| `WInfoCard`, `WCard` inside a section | A hint or a block of its own, one step darker than the section. |
| `footer` slot | Buttons under the group's content, such as the group's Save: past a line, or on the page in flat, past a space, as the line there is between the groups. |

## Try it

Switch the layout style in the header's theme menu to see the same page in each.

<!-- @example recipes/settings-page/GreenhouseSettings page -->

<DocsDemo name="recipes/settings-page/GreenhouseSettings" page />

```vue
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
```

<!-- @example-end -->

## Spacing in flat

The space in flat is `--w-stack-divide` (`2rem`) between groups and `--w-subsection-divide` (`1rem`) above a part, for a page that needs it tighter or looser.
