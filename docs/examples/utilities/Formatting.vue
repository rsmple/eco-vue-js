<template>
  <div class="grid gap-6">
    <div class="grid max-w-xl grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      <template
        v-for="row in rows"
        :key="row.code"
      >
        <code class="text-description">{{ row.code }}</code>
        <span class="font-semibold">{{ row.value }}</span>
      </template>
    </div>

    <div>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        @click="download"
      >
        Download plants.csv
      </WButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, dateFormat, dateFormatShort, dateToQueryString, datetimeFormat, durationHumanize} from 'eco-vue-js/dist/utils/dateTime'
import {buildCsvContent} from 'eco-vue-js/dist/utils/exportToCsv'
import {numberCompactFormatter, numberFormatter, percentFormatter} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const now = new Date()

const rows = [
  {code: 'dateFormat(now)', value: dateFormat(now)},
  {code: 'dateFormatShort(addDay(now, -3))', value: dateFormatShort(addDay(now, -3))},
  {code: 'datetimeFormat(now, true)', value: datetimeFormat(now, true)},
  {code: 'dateToQueryString(now)', value: dateToQueryString(now)},
  {code: 'durationHumanize(5400)', value: durationHumanize(5400)},
  {code: 'durationHumanize(5400, true)', value: durationHumanize(5400, true)},
  {code: 'durationHumanize(200000, true, true)', value: durationHumanize(200000, true, true)},
  {code: 'numberFormatter.format(1234567.5)', value: numberFormatter.format(1234567.5)},
  {code: 'numberCompactFormatter.format(12840)', value: numberCompactFormatter.format(12840)},
  {code: 'percentFormatter.format(0.4375)', value: percentFormatter.format(0.4375)},
]

const plants = [
  {name: 'Monstera', watered: addDay(now, -2), note: 'Likes "bright, indirect" light'},
  {name: 'Fern', watered: addDay(now, -5), note: '=keep moist'},
]

// Values that start a formula are escaped, so the file is safe to open in a spreadsheet.
const download = () => {
  const content = buildCsvContent(
    plants.map(plant => [plant.name, dateToQueryString(plant.watered), plant.note]),
    ['Name', 'Watered', 'Note'],
  )

  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], {type: 'text/csv'}))
  link.download = 'plants.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>
