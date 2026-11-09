---
group: Display
description: WCounter — a round badge with a number in compact notation, which shakes when the count changes.
---

# Counter

`WCounter` is a round number badge, usually pinned to a button or nav item corner. Large numbers shorten (1234 → 1.2K). It shakes when the count changes and is at least `trigger` (default 2, so a single item stays quiet).

`semanticType` colors it, from the same map as [WChip](/components/chip). It's sized in `em`, so a text size class scales it. [WButtonAction](/components/actions-bar#action-buttons) and [WNavItem](/components/nav-bar) have their own `counter` or `count`.

<!-- @example Counter/Basic -->

<DocsDemo name="Counter/Basic" />

```vue
<template>
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

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      @click="count = 0"
    >
      Read all
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WCounter from 'eco-vue-js/dist/components/Counter/WCounter.vue'

const count = ref(3)
</script>
```

<!-- @example-end -->

## API

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
