---
group: Utilities
description: Date, duration and number formatting from eco-vue-js — dateFormat, durationFormat and date math in dateTime, the number and percent formatters, and buildCsvContent for CSV exports.
---

# Formatting

The functions the kit's components format values with, for the same output elsewhere in the app.

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

All of them work in local time, and format in the locale set with `setLocale` — `en-GB` by default. The examples are in `en-GB`.

```ts
import {setLocale} from 'eco-vue-js/dist/utils/locale'

setLocale(() => i18n.global.locale.value)
```

A getter is read as the value renders, so the text follows a change of locale.

| Function | Result |
| --- | --- |
| `dateFormat(date, {year?})` | `05 Oct 2026` — with the month name, so the date reads the same way in any locale. `year: 'auto'` drops the year when it is the current one: `05 Oct`. |
| `timeFormat(date, {seconds?})` | `14:30:05`, or `2:30:05 PM` in a locale with a 12-hour clock. `seconds: false` drops the seconds: `14:30`. |
| `datetimeFormat(date, {year?, seconds?})` | The date and the time, in the order and with the separator of the locale: `05 Oct 2026, 14:30:05`. Takes the options of both: `05 Oct, 14:30` with `{year: 'auto', seconds: false}`. |
| `todayFormat()` | `Today`, as a label. |
| `dateInputFormat(date)` | `05/10/2026` — the numeric date of the locale (`10/05/2026` in `en-US`), as [WInputDate](/components/input#date) shows it. `parseDateInput(text)` reads it back with any separators, or returns `undefined`. |
| `parseDateQuery(text)` | Reads `05.10.2026` in every locale, such as from a query param, or returns `undefined`. |
| `dateToQueryString(date)` | `2026-10-05`, the local date in ISO format, for a query param. |
| `durationFormat(seconds, {style?, round?})` | `1 hr 30 mins`, or `1 hour 30 minutes` with `style: 'long'`. Shows the largest part and the one right below it, so `10 mths` and `10 mins` can't be mixed up; `round: true` keeps only the largest part, rounded: `2 hrs`. |
| `getDurationRound(seconds)` | Rounds a duration up to a step that reads well — 10 seconds, a minute, 10 minutes, an hour, a day and so on. |

Date math returns a new `Date` and leaves the one passed in as it was:

- `getStartOfDay`, `getStartOfNextDay`, `getStartOfWeek` (Monday by default, or a `WeekDay`) and `getStartOfMonth` — each defaults to now.
- `addDay`, `addMonth` and `addYear` — the count can be negative.
- `isSameDate`, `isSameWeek`, `isSameMonth` and `isSameYear` compare two dates.

`weekdayShortFormatter`, `weekdayNarrowFormatter`, `monthShortFormatter` and `dateFormatter` format in the current locale, as the [date picker](/components/date-picker) and the heatmap do, and `WeekDay` and `Month` are enums of the JavaScript day and month numbers.

## Numbers

```ts
import {numberCompactFormatter, numberFormatter, percentFormatter} from 'eco-vue-js/dist/utils/utils'
```

These are what [`WNumberFormatter`](/components/number-formatter) shows. Each has a `format(value)`:

They format in the locale set with `setLocale`, and group thousands with a space in every locale, since a comma or a dot there reads as a decimal separator in other locales.

- `numberFormatter` — up to three decimals: `1 234 567.5`, or `1 234 567,5` in `ru`.
- `numberCompactFormatter` — compact notation: `13K`.
- `percentFormatter` and `percentCompactFormatter` — a fraction as a percentage: `43.75%`.

## CSV

```ts
import {buildCsvContent, escapeCsvValue} from 'eco-vue-js/dist/utils/exportToCsv'
```

`buildCsvContent(rows, header?)` joins rows of strings into CSV text, escaping each value with `escapeCsvValue`: values with a quote, comma or line break are quoted, and values that start like a formula (`=`, `+`, `-`, `@`) get a leading space, so that a spreadsheet doesn't run them. `dateFormatterCsv` and `numberFormatCsv` from `utils` format dates and decimal numbers the way spreadsheets in most locales read them.

For a list export with a progress bar, use [`WModalExport`](/components/modal#export-and-import).
