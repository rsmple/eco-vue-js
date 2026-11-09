---
group: Utilities
description: Date, duration and number formatting from eco-vue-js — dateFormat, durationFormat and date math in dateTime, the number and percent formatters, and buildCsvContent for CSV exports.
---

# Formatting

The formatters the kit's components use, for matching output elsewhere.

<!-- @example utilities/Formatting client -->

<DocsDemo name="utilities/Formatting" client-only />

```vue
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
```

<!-- @example-end -->

## Dates

```ts
import {addDay, dateFormat, durationFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'
```

All work in local time and format in the `setLocale` locale (`en-GB` by default, used in the examples).

```ts
import {setLocale} from 'eco-vue-js/dist/utils/locale'

setLocale(() => i18n.global.locale.value)
```

Getters are read at render, so text follows locale changes.

| Function | Result |
| --- | --- |
| `dateFormat(date, {year?})` | `05 Oct 2026` — month name, unambiguous in any locale. `year: 'auto'` drops the current year: `05 Oct`. |
| `timeFormat(date, {seconds?})` | `14:30:05`, or `2:30:05 PM` in 12-hour locales. `seconds: false`: `14:30`. |
| `datetimeFormat(date, {year?, seconds?})` | Date and time in the locale's order: `05 Oct 2026, 14:30:05`. Takes both sets of options: `05 Oct, 14:30`. |
| `todayFormat()` | `Today`, as a label. |
| `dateInputFormat(date)` | `05/10/2026` — the locale's numeric date (`10/05/2026` in `en-US`), as [WInputDate](/components/input#date) shows. `parseDateInput(text)` reads it back with any separator, or `undefined`. |
| `parseDateQuery(text)` | Reads `05.10.2026` in any locale (e.g. a query param), or `undefined`. |
| `dateToQueryString(date)` | `2026-10-05`, local ISO date for a query param. |
| `durationFormat(seconds, {style?, round?})` | `1 hr 30 mins`, or `1 hour 30 minutes` with `style: 'long'`. Shows the two largest parts so `10 mths` and `10 mins` can't be confused; `round: true` keeps one, rounded: `2 hrs`. |
| `getDurationRound(seconds)` | Rounds up to a readable step — 10 s, 1 min, 10 min, 1 h, 1 day, … |

Date math returns a new `Date`:

- `getStartOfDay`, `getStartOfNextDay`, `getStartOfWeek` (Monday, or a `WeekDay`), `getStartOfMonth` — default to now.
- `addDay`, `addMonth`, `addYear` — counts may be negative.
- `isSameDate`, `isSameWeek`, `isSameMonth`, `isSameYear`.

`weekdayShortFormatter`, `weekdayNarrowFormatter`, `monthShortFormatter` and `dateFormatter` format in the current locale, as the [date picker](/components/date-picker) and heatmap do. `WeekDay` and `Month` enumerate JavaScript day and month numbers.

## Numbers

```ts
import {numberCompactFormatter, numberFormatter, percentFormatter} from 'eco-vue-js/dist/utils/utils'
```

What [`WNumberFormatter`](/components/number-formatter) shows. Each has `format(value)`:

They use the `setLocale` locale but always group thousands with a space, since commas and dots read as decimals elsewhere.

- `numberFormatter` — up to three decimals: `1 234 567.5` (`1 234 567,5` in `ru`).
- `numberCompactFormatter` — compact notation: `13K`.
- `percentFormatter`, `percentCompactFormatter` — fraction as percentage: `43.75%`.

## CSV

```ts
import {buildCsvContent, escapeCsvValue} from 'eco-vue-js/dist/utils/exportToCsv'
```

`buildCsvContent(rows, header?)` joins string rows into CSV, escaping with `escapeCsvValue`: values with quotes, commas or line breaks are quoted, and formula-like values (`=`, `+`, `-`, `@`) get a leading space so spreadsheets don't execute them. `dateFormatterCsv` and `numberFormatCsv` from `utils` format for most spreadsheet locales.

For list exports with progress, use [`WModalExport`](/components/modal#export-and-import).
