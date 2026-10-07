---
group: Utilities
description: Date, duration and number formatting from eco-vue-js — dateFormat, durationHumanize and date math in dateTime, the number and percent formatters, and buildCsvContent for CSV exports.
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
```

<!-- @example-end -->

## Dates

```ts
import {addDay, dateFormat, durationHumanize, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'
```

All of them work in local time, and format in the locale set with `setLocale` — `en-GB` by default. The examples are in `en-GB`.

```ts
import {setLocale} from 'eco-vue-js/dist/utils/locale'

setLocale(() => i18n.global.locale.value)
```

A getter is read as the value renders, so the text follows a change of locale.

| Function | Result |
| --- | --- |
| `dateFormat(date)` | `05 Oct 2026` — with the month name, so the date reads the same way in any locale. |
| `dateFormatShort(date)` | `05 Oct`, with the year added when it isn't the current one. |
| `timeFormat(date)`, `timeFormatShort(date)` | `14:30:05` and `14:30` — or `2:30 PM`, in a locale with a 12-hour clock. |
| `datetimeFormat(date, short?)` | The date and the time, in the order and with the separator of the locale: `05 Oct 2026, 14:30:05`. `short` drops the seconds, and the year when it is the current one: `05 Oct, 14:30`. |
| `todayFormat()` | `Today`, as a label. |
| `dateInputFormat(date)` | `05/10/2026` — the numeric date of the locale (`10/05/2026` in `en-US`), as [WInputDate](/components/input#date) shows it. `parseDateInput(text)` reads it back with any separators, or returns `undefined`. |
| `parseDate(text)` | Reads `05.10.2026` in every locale, such as from a query param, or returns `undefined`. |
| `dateToQueryString(date)` | `2026-10-05`, the local date in ISO format, for a query param. |
| `durationHumanize(seconds, full?, round?)` | `1 hr 30 mins`, or `1 hour 30 minutes` with `full`. Shows the largest part and the one right below it, so `10 mths` and `10 mins` can't be mixed up; `round` keeps only the largest part, rounded. |
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
