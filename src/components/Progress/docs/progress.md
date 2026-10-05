---
group: Display
description: WProgress, WProgressStriped and WProgressBar — a thin line, a slim striped bar and a large bar with the percentage, for the progress of a task.
---

# Progress

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
      :semantic-type="SemanticType.PRIMARY"
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
