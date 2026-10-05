---
group: Display
description: WSpinner — an indeterminate spinner in the current text color, sized with square-*.
---

# Spinner

`WSpinner` is an indeterminate spinner in the current text color. `square-*` sets its size, 20px by default. Buttons show one over their label while `loading`.

For a spinner among regular icons, such as in a menu item, use `IconSpinner` — the same drawing as an icon component.

<!-- @example Spinner/Basic -->

<DocsDemo name="Spinner/Basic" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-6">
    <WSpinner />

    <WSpinner class="tone-primary square-8 text-tone" />

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      :loading="saving"
      @click="save"
    >
      Save
    </WButton>

    <span class="text-description flex items-center gap-2 text-sm">
      <WSpinner class="square-4" />
      Syncing the greenhouse sensors
    </span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WSpinner from 'eco-vue-js/dist/components/Spinner/WSpinner.vue'

const saving = ref(false)

const save = () => {
  saving.value = true
  setTimeout(() => saving.value = false, 1500)
}
</script>
```

<!-- @example-end -->

## API

<!-- @api WSpinner -->

### WSpinner

```ts
import WSpinner from 'eco-vue-js/dist/components/Spinner/WSpinner.vue'
```

#### Props

_No props._

<!-- @api-end -->
