---
group: Data
description: Small display components — WChip labels, WCounter badges and WStatusIcon, WSkeleton placeholders and WSpinner while loading, and the WProgress bars.
---

# Status and loading

Small components for showing the state of something next to other content. None of them take input.

## Chips, counters and status icons

- `WChip` is a short label in a colored box, such as a tag or a flag on a card.
- `WCounter` is a round badge with a number, usually pinned to the corner of a button or nav item. It shakes when the count changes and is at least `trigger` — 2 by default, so a single item doesn't draw attention.
- `WStatusIcon` shows whether something is filled in: a check with `hasValue`, an exclamation mark with `hasError`, and a dimmed slash with neither. The tabs use it with `statusIcon` to mark the tabs that are done or have errors.

Chips and counters take a `semanticType` for their color. The classes behind each type are set once per app with `setSemanticTypeChipMap` from `eco-vue-js/dist/utils/SemanticType`, which both of them read. The counter is sized in `em`, so a text size class sets its size.

<!-- @example Chip/Basic -->

<DocsDemo name="Chip/Basic" />

```vue
<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-center gap-2">
      <WChip
        v-for="type in semanticTypes"
        :key="type"
        :text="type"
        :semantic-type="type"
      />
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <span class="relative">
        Inbox

        <WCounter
          :count="count"
          :trigger="1"
          class="absolute -top-2 left-full text-xs"
        />
      </span>

      <WCounter
        :count="1234"
        :semantic-type="SemanticType.INFO"
        class="text-sm"
      />

      <WButton
        :semantic-type="SemanticType.SECONDARY"
        @click="count++"
      >
        New message
      </WButton>
    </div>

    <div class="flex flex-wrap items-center gap-4 [&_svg]:square-5">
      <span class="flex items-center gap-2"><WStatusIcon /> Not set</span>
      <span class="flex items-center gap-2"><WStatusIcon has-value /> Done</span>
      <span class="flex items-center gap-2"><WStatusIcon has-error /> Failed</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'

const semanticTypes = Object.values(SemanticType)

const count = ref(3)
</script>
```

<!-- @example-end -->

## Skeletons and spinners

`WSkeleton` is a shimmering placeholder for content that is still loading. It is one line of text tall and a random width between 40% and 80%, so a column of them doesn't look like a grid. Utilities from the kit's Tailwind base set its shape:

- `w-skeleton-w-*` and `w-skeleton-h-*` — width and height, e.g. `w-skeleton-h-12` for an avatar.
- `w-skeleton-rounded-*` — corner radius.
- `w-skeleton-static` — stops the shimmer, on the skeleton or any parent.

Controls, chips and list fields have a `skeleton` prop that renders their own skeleton. A form or an area can set it for everything inside at once — see [Conventions](/guide/conventions).

`WSpinner` is an indeterminate spinner in the current text color. `square-*` sets its size, 20px by default.

<!-- @example Skeleton/Basic -->

<DocsDemo name="Skeleton/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-4">
    <WToggle
      v-model="loading"
      title="Loading"
    />

    <div class="flex items-center gap-4 rounded-xl border border-solid border-gray-200 p-4 dark:border-gray-800">
      <WSkeleton
        v-if="loading"
        class="w-skeleton-w-12 w-skeleton-h-12 w-skeleton-rounded-full shrink-0"
      />

      <div
        v-else
        class="bg-primary dark:bg-primary-dark text-default flex square-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
      >
        JA
      </div>

      <div class="grid flex-1">
        <WSkeleton v-if="loading" />

        <span
          v-else
          class="font-semibold"
        >
          Jane Austen
        </span>

        <WSkeleton v-if="loading" />

        <span
          v-else
          class="text-description"
        >
          Pride and Prejudice, Emma, Persuasion
        </span>
      </div>

      <WChip
        text="Author"
        :skeleton="loading"
      />
    </div>

    <div class="flex items-center gap-4">
      <WSpinner />
      <WSpinner class="square-5 text-primary dark:text-primary-dark" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WSpinner from 'eco-vue-js/dist/components/Spinner/WSpinner.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const loading = ref(true)
</script>
```

<!-- @example-end -->

## Progress

Three bars for the progress of a task:

- `WProgress` — a thin line, from 0 to 100, e.g. under a modal's title for the steps of a stepper.
- `WProgressStriped` — a slim rounded bar, from 0 to 100, with a light sweeping the fill while in progress. A band sweeps the empty track at 0, and the full bar pulses at 100. It has no height of its own, so give it one, e.g. `h-1.5`.
- `WProgressBar` — a large bar with the percentage in it, from 0 to 1; the label changes color where the fill passes under it. `null` sweeps the empty bar and shows a spinner, for a task that hasn't reported its progress yet.

<!-- @example Progress/Basic -->

<DocsDemo name="Progress/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-6">
    <div class="flex gap-2">
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="running"
        @click="start"
      >
        Start
      </WButton>

      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="running"
        @click="percent = 0"
      >
        Reset
      </WButton>
    </div>

    <WProgress :model-value="percent" />

    <WProgressStriped
      :model-value="percent"
      class="h-1.5"
    />

    <WProgressBar
      :model-value="waiting ? null : percent / 100"
      :semantic-type="SemanticType.POSITIVE"
    />
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WProgress from 'eco-vue-js/dist/components/Progress/WProgress.vue'
import WProgressBar from 'eco-vue-js/dist/components/Progress/WProgressBar.vue'
import WProgressStriped from 'eco-vue-js/dist/components/Progress/WProgressStriped.vue'

const percent = ref(0)
const running = ref(false)
const waiting = ref(false)

let timer: ReturnType<typeof setInterval> | undefined

// Waits a second before the task reports progress, then fills in steps.
const start = () => {
  percent.value = 0
  running.value = true
  waiting.value = true

  setTimeout(() => {
    waiting.value = false

    timer = setInterval(() => {
      percent.value = Math.min(100, percent.value + 10)

      if (percent.value === 100) {
        clearInterval(timer)
        running.value = false
      }
    }, 400)
  }, 1000)
}

onBeforeUnmount(() => clearInterval(timer))
</script>
```

<!-- @example-end -->

## API

<!-- @api WChip -->

### WChip

```ts
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Label of the chip. The default slot replaces it. |
| `semanticType` | `SemanticType` | `SemanticType.SECONDARY` | Color scheme of the chip. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the chip. When unset, inherits the skeleton state provided by a parent. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the chip, replacing `text`. |

<!-- @api-end -->

<!-- @api WCounter -->

### WCounter

```ts
import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | **required** | Number shown, in compact notation — 1.2K for 1200. |
| `trigger` | `number` | `2` | Lowest count that makes the counter shake when it changes. |
| `semanticType` | `SemanticType` | `SemanticType.NEGATIVE` | Color scheme of the badge. |

<!-- @api-end -->

<!-- @api WStatusIcon -->

### WStatusIcon

```ts
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `hasValue` | `boolean` | — | Shows a green check. |
| `hasError` | `boolean` | — | Shows a red exclamation mark, over `hasValue`. |

<!-- @api-end -->

<!-- @api WSkeleton -->

### WSkeleton

```ts
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content inside the placeholder. With `w-skeleton-w-max` and hidden with `opacity-0`, it sizes the skeleton to the content it stands for. |

<!-- @api-end -->

<!-- @api WSpinner -->

### WSpinner

```ts
import WSpinner from 'eco-vue-js/dist/components/Spinner/WSpinner.vue'
```

#### Props

_No props._

<!-- @api-end -->

<!-- @api WProgress -->

### WProgress

```ts
import WProgress from 'eco-vue-js/dist/components/Progress/WProgress.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `number` | **required** | Filled part, from 0 to 100. |

<!-- @api-end -->

<!-- @api WProgressStriped -->

### WProgressStriped

```ts
import WProgressStriped from 'eco-vue-js/dist/components/Progress/WProgressStriped.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `number` | **required** | Filled part, from 0 to 100. At 0 a band sweeps the empty track, while waiting to start; at 100 the full bar pulses. |

<!-- @api-end -->

<!-- @api WProgressBar -->

### WProgressBar

```ts
import WProgressBar from 'eco-vue-js/dist/components/Progress/WProgressBar.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `number \| null` | **required** | Filled part, from 0 to 1, shown as a percentage. `null` sweeps the empty bar and shows a spinner, for progress not known yet. |
| `semanticType` | `SemanticType` | `SemanticType.INFO` | Color scheme of the fill. |

<!-- @api-end -->
