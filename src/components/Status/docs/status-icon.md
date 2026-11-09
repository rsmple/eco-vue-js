---
group: Display
description: WStatusIcon — a check, an exclamation mark or a dimmed slash for whether something is filled in or has errors.
---

# Status icon

`WStatusIcon` shows fill state: a check with `hasValue`, an exclamation mark with `hasError`, a dimmed slash with neither. [WTabs](/components/tabs) use it via `statusIcon`. Size with `square-*`.

<!-- @example Status/Basic -->

<DocsDemo name="Status/Basic" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-4 [&_svg]:square-5">
    <span class="flex items-center gap-2"><WStatusIcon /> Not set</span>
    <span class="flex items-center gap-2"><WStatusIcon has-value /> Done</span>
    <span class="flex items-center gap-2"><WStatusIcon has-error /> Failed</span>
  </div>
</template>

<script lang="ts" setup>
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'
</script>
```

<!-- @example-end -->

## API

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
