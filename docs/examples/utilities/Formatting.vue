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
import {addDay, dateFormat, dateToQueryString, datetimeFormat, durationFormat} from 'eco-vue-js/dist/utils/dateTime'
import {buildCsvContent} from 'eco-vue-js/dist/utils/exportToCsv'
import {numberCompactFormatter, numberFormatter, percentFormatter} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const now = new Date()

const rows = [
  {code: 'dateFormat(now)', value: dateFormat(now)},
  {code: 'dateFormat(addDay(now, -3), {year: \'auto\'})', value: dateFormat(addDay(now, -3), {year: 'auto'})},
  {code: 'datetimeFormat(now, {year: \'auto\', seconds: false})', value: datetimeFormat(now, {year: 'auto', seconds: false})},
  {code: 'dateToQueryString(now)', value: dateToQueryString(now)},
  {code: 'durationFormat(5400)', value: durationFormat(5400)},
  {code: 'durationFormat(5400, {style: \'long\'})', value: durationFormat(5400, {style: 'long'})},
  {code: 'durationFormat(200000, {style: \'long\', round: true})', value: durationFormat(200000, {style: 'long', round: true})},
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
