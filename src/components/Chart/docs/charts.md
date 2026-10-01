---
group: Data
description: WChartLinear and WChartLine for values over time, with bands, areas, gradients and tooltips, and WChartHeatmap for a year of daily values.
---

# Charts

Small SVG charts of values over time. They are drawn in the current text color, so a text color class on the chart or the line sets its color.

## Lines

`WChartLinear` is the frame: a time axis over `xDomain`, a value axis on the left or `yRight`, and the plot between them. It fills its parent's height unless `height` is set, and follows its width. Its default slot gets the scales and sizes — bind them to each `WChartLine` with `v-bind="scope"`, or use `scaleX` and `scaleY` to draw your own marks, such as a threshold line.

`WChartLine` draws one line from `data`, newest point first, picking the time and value by `xKey` and `yKey`. The line runs on flat from its first and last points to the edges of the chart. The value axis fits all the lines in the chart, from 0 or with `calcMin` from their lowest value.

- `yKeyMin` and `yKeyMax` draw a faint band around the line, e.g. for a range or a confidence interval. `hasArea` fills the area under the line instead.
- `strokeStyle` and `strokeWidth` set the line; the `gradient` slot colors it by value, with `stop` elements placed with `scaleYPercent`.
- The `tooltip` slot adds a tooltip for the point nearest the pointer, with its data and the points before and after it.

<!-- @example Chart/Line client -->

<DocsDemo name="Chart/Line" client-only />

```vue
<template>
  <div class="grid gap-2">
    <div class="flex gap-4 text-sm">
      <span class="tone-primary text-tone">— Open findings</span>
      <span class="tone-positive text-tone">- - Fixed</span>
    </div>

    <WChartLinear
      :x-domain="[from, today]"
      :height="200"
      :y-format="value => numberCompactFormatter.format(value)"
      y-right
    >
      <template #default="scope">
        <WChartLine
          v-bind="scope"
          :data="open"
          x-key="date"
          y-key="value"
          y-key-min="min"
          y-key-max="max"
          class="tone-primary text-tone"
        >
          <template #tooltip="{d, prev}">
            <div class="grid text-sm">
              <span class="text-description">{{ dateFormat(new Date(d.date)) }}</span>
              <span class="font-semibold">{{ d.value }} open</span>
              <span
                v-if="prev"
                class="text-description"
              >{{ d.value - prev.value >= 0 ? '+' : '' }}{{ d.value - prev.value }} since the day before</span>
            </div>
          </template>
        </WChartLine>

        <WChartLine
          v-bind="scope"
          :data="fixed"
          x-key="date"
          y-key="value"
          stroke-style="dashed-small"
          has-area
          class="tone-positive text-tone"
        />
      </template>
    </WChartLinear>
  </div>
</template>

<script lang="ts" setup>
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'
import {numberCompactFormatter} from 'eco-vue-js/dist/utils/utils'

import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'

const today = +getStartOfDay()
const from = +addDay(getStartOfDay(), -29)

// Points go newest first, one a day for the last 30 days.
const open = Array.from({length: 30}, (_, index) => {
  const value = Math.round(120 + 30 * Math.sin(index / 4) - index)
  return {date: +addDay(getStartOfDay(), -index), value, min: value - 12, max: value + 12}
})

const fixed = Array.from({length: 30}, (_, index) => ({date: +addDay(getStartOfDay(), -index), value: Math.max(0, 60 - 2 * index + (index % 5) * 3)}))
</script>
```

<!-- @example-end -->

## Heatmap

`WChartHeatmap` shows a value per day over the last year as a grid of weeks, in five shades of the current color. The legend's steps are round numbers up to the highest value. The grid scrolls to today; the `tooltip` slot describes a day.

<!-- @example Chart/Heatmap client -->

<DocsDemo name="Chart/Heatmap" client-only />

```vue
<template>
  <WChartHeatmap
    :data="scans"
    x-key="date"
    y-key="count"
    title="Scans in the last year"
    class="tone-primary text-tone"
  >
    <template #tooltip="{d}">
      {{ d.count }} scans on {{ dateFormat(new Date(d.date)) }}
    </template>
  </WChartHeatmap>
</template>

<script lang="ts" setup>
import {addDay, dateFormat, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WChartHeatmap from 'eco-vue-js/dist/components/Chart/WChartHeatmap.vue'

// A made-up count for every weekday of the last year, more on some weeks than others.
const scans = Array.from({length: 365}, (_, index) => {
  const date = addDay(getStartOfDay(), -index)
  const weekday = date.getDay() !== 0 && date.getDay() !== 6

  return {date: +date, count: weekday ? (index * 7) % 23 + (Math.floor(index / 30) % 3) * 5 : 0}
}).filter(item => item.count > 0)
</script>
```

<!-- @example-end -->

## API

<!-- @api WChartLinear -->

### WChartLinear

```ts
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `xDomain` | `[number, number]` | **required** | Time range of the x axis, as `[from, to]` timestamps in ms. The axis labels are dates, and "Today". |
| `yDomainGetter` | `((extent: [number, number]) => [number, number])` | — | Range of the y axis from the range of all the lines' values. By default it is rounded out to tens or hundreds and starts at 0 or below. |
| `height` | `number` | `0` | Height of the chart in px. By default it fills the height of its parent. |
| `xHidden` | `boolean` | — | Hides the x axis. |
| `yHidden` | `boolean` | — | Hides the y axis. |
| `yRight` | `boolean` | — | Puts the y axis on the right. |
| `yFormat` | `((value: number) => string)` | — | Labels of the y axis. |
| `top` | `number` | `16` | Space above the plot in px, for the axis labels. |
| `bottom` | `number` | `16` | Space under the plot in px. |
| `left` | `number` | `3` | Space left of the plot in px. |
| `right` | `number` | `3` | Space right of the plot in px. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the chart. When unset, inherits the skeleton state provided by a parent. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `ChartContext` | SVG content of the chart, such as WChartLine lines — bind the scope to each one. Gets the scales and sizes for drawing your own marks. |

<!-- @api-end -->

<!-- @api WChartLine -->

### WChartLine

```ts
import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Data[]` | **required** | Points of the line, newest first. The line runs on flat to both edges of the chart. |
| `xKey` | `keyof Data` | **required** | Key of the timestamp of a point, in ms. |
| `yKey` | `keyof Data` | **required** | Key of the value of a point. |
| `yKeyMin` | `keyof Data` | — | Key of the lower bound of a point, for a band around the line with `yKeyMax`. |
| `yKeyMax` | `keyof Data` | — | Key of the upper bound of a point, for a band around the line with `yKeyMin`. |
| `strokeStyle` | `"solid" \| "dashed" \| "dashed-small" \| "dotted"` | — | Style of the line. |
| `strokeWidth` | `number` | — | Width of the line in px. Defaults to 2. |
| `hasArea` | `boolean` | — | Fills the area under the line with a fading color. |
| `pointRadius` | `number` | — | Radius in px of the point marked under the tooltip. Defaults to 3. |
| `emptyStub` | `string` | — | Text shown when there are no points in range. The `empty` slot replaces it. |
| `calcMin` | `boolean` | — | Lets the y axis start above 0, at the lowest value. By default it includes 0. |
| `scaleX` | `(value: number) => number` | **required** | Converts a timestamp to an x position in px. |
| `scaleY` | `(value: number) => number` | **required** | Converts a value to a y position in px. |
| `svgWidth` | `number` | **required** | Width of the chart in px. |
| `svgHeight` | `number` | **required** | Height of the chart in px. |
| `top` | `number` | **required** | Space above the plot in px. |
| `bottom` | `number` | **required** | Space under the plot in px. |
| `left` | `number` | **required** | Space left of the plot in px. |
| `right` | `number` | **required** | Space right of the plot in px. |
| `xExtent` | `[number, number]` | **required** | Time range of the x axis, as `[from, to]` timestamps in ms. |
| `onUpdateDomain` | `(lineId: string, yExtent: [number, number]) => void` | **required** | Reports the range of a line's values, for the chart to fit the y axis to all its lines. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `tooltip` | `{ d: Data; x: number; y: number; index: number \| null; prev: Data \| undefined; next: Data \| undefined; }` | Content of the tooltip for the point nearest the pointer, with its data, the older point's data as `prev` and the newer one's as `next`, and its position. The line only has a tooltip with this slot. |
| `gradient` | `{ scaleY: (value: number) => number; scaleYPercent: (value: number) => number; topPercent: number; bottomPercent: number; }` | `stop` elements of a vertical gradient for the line's color, e.g. green below a threshold and red above it. `scaleYPercent` places a value on it. By default the line is the current text color. |
| `empty` | — | Content shown when there are no points in range, replacing `emptyStub`. |

<!-- @api-end -->

<!-- @api WChartHeatmap -->

### WChartHeatmap

```ts
import WChartHeatmap from 'eco-vue-js/dist/components/Chart/WChartHeatmap.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `Data[]` | **required** | Values by day, over the last year. |
| `xKey` | `keyof PickByType<Required<Data>, number, false>` | **required** | Key of the timestamp of a day, in ms. |
| `yKey` | `keyof PickByType<Required<Data>, number, false>` | **required** | Key of the day's value, which sets its shade. |
| `title` | `string` | — | Heading above the grid, next to the legend. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the chart. When unset, inherits the skeleton state provided by a parent. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `tooltip` | `{ d: Data; index: number; }` | Tooltip of a day with data, with the day's data and its index in `data`. |

<!-- @api-end -->
