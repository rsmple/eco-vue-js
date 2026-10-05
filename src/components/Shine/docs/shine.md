---
group: Utilities
description: WShine and WShineEffect — the light that sweeps across action buttons every few seconds, driven by one effect mounted at the app root.
---

# Shine

`WShine` is the light that sweeps across the kit's action buttons every few seconds. Put it inside a positioned element; it takes its corners. Buttons add it on their own while they are enabled and not loading.

The sweep comes from one `WShineEffect` mounted at the app root, next to the [global containers](/guide/getting-started#global-containers) — without it, there is no shine. It is hidden on phones and in print.

<!-- @example Shine/Basic client -->

<DocsDemo name="Shine/Basic" client-only />

```vue
<template>
  <div class="flex flex-wrap items-center gap-6">
    <WButton :semantic-type="SemanticType.PRIMARY">
      Water the plants
    </WButton>

    <div class="tone-positive surface-fill relative rounded-xl px-6 py-4 font-semibold">
      Harvest ready

      <WShine />
    </div>

    <!-- Mounted once at the app root; this site doesn't, so the demo mounts it for this page. -->
    <WShineEffect />
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WShine from 'eco-vue-js/dist/components/Shine/WShine.vue'
import WShineEffect from 'eco-vue-js/dist/components/Shine/WShineEffect.vue'
</script>
```

<!-- @example-end -->

## API

<!-- @api WShine -->

### WShine

```ts
import WShine from 'eco-vue-js/dist/components/Shine/WShine.vue'
```

#### Props

_No props._

<!-- @api-end -->

<!-- @api WShineEffect -->

### WShineEffect

```ts
import WShineEffect from 'eco-vue-js/dist/components/Shine/WShineEffect.vue'
```

#### Props

_No props._

<!-- @api-end -->
