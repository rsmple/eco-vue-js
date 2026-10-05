---
group: Layout
description: WHeaderBar and WHeaderBarSearch — the app's fixed header with the page title and buttons, and a search that a page puts into it.
---

# Header bar

`WHeaderBar` is the fixed header of the [app shell](/guide/app-shell) — the one at the top of this page. It spans the whole width, `--header-height` tall; pad it by the bars beside it, e.g. `pl---nav-bar-width pr---actions-bar-width`, to keep its title and buttons between them. Below `xl` it leaves its top-left corner free for the nav's menu button.

The title is the `title` prop or the `title` slot, and the `right` slot goes after it, before the search button. Its background is translucent with a blur where the browser supports `backdrop-filter`, so the page shows through as it scrolls under.

## Search

`WHeaderBarSearch` puts a search into the header from any page, without touching the layout. Its default slot is shown in place of the header's title row, and the header gets a search button that opens it. The slot receives `visible`, `show` and `hide`; the `shown` prop opens it right away, and again whenever it turns `true`. It renders nothing where it is placed, and takes its content out of the header when the page unmounts.

<!-- @example HeaderBar/Basic client -->

<DocsDemo name="HeaderBar/Basic" client-only />

```vue
<template>
  <div class="grid max-w-md gap-4">
    <span class="text-description text-sm">
      This page's header is a WHeaderBar: the search below is placed there, behind a search button on its right.
    </span>

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      @click="shown = !shown"
    >
      {{ shown ? 'Unmount the search' : 'Mount the search' }}
    </WButton>

    <WHeaderBarSearch
      v-if="shown"
      shown
    >
      <template #default="{hide}">
        <div class="flex w-full items-center gap-2">
          <WInput
            v-model="search"
            placeholder="Search plants"
            no-margin
            class="flex-1"
          />

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            @click="hide?.()"
          >
            Close
          </WButton>
        </div>
      </template>
    </WHeaderBarSearch>

    <span
      v-if="search"
      class="text-sm"
    >
      Searching for “{{ search }}”
    </span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WHeaderBarSearch from 'eco-vue-js/dist/components/HeaderBar/WHeaderBarSearch.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

const shown = ref(false)
const search = ref<string>()
</script>
```

<!-- @example-end -->

## API

<!-- @api WHeaderBar -->

### WHeaderBar

```ts
import WHeaderBar from 'eco-vue-js/dist/components/HeaderBar/WHeaderBar.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Title of the page. The `title` slot replaces it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `right` | — | Content after the title, before the search button. |

<!-- @api-end -->

<!-- @api WHeaderBarSearch -->

### WHeaderBarSearch

```ts
import WHeaderBarSearch from 'eco-vue-js/dist/components/HeaderBar/WHeaderBarSearch.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `shown` | `boolean` | — | Opens the search right away, and again whenever it becomes `true`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ visible?: boolean \| undefined; hide?: (() => void) \| undefined; show?: (() => void) \| undefined; }` | Search content shown in place of the header's title row when the search button is clicked. `hide` goes back to the title. |

<!-- @api-end -->
