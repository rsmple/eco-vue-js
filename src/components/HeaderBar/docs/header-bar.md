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

## Route titles

Without a `title` prop or slot, the header shows the titles of the current route as one line: its parent pages as muted links and the page's own title in bold. Each level of `route.matched` takes its title from the page, or from its `meta.title`.

A page reports a title that depends on its data from setup with `useRouteTitle`. It registers the title for the route record the page is rendered by, and removes it when the page unmounts:

```ts
import {useRouteTitle} from 'eco-vue-js/dist/utils/useRouteTitle'

useRouteTitle(() => ({
  title: query.data.value?.name,
  suffix: ProductTitleSuffix,
}))
```

- `title` is `undefined` while the data loads, and the header shows a placeholder.
- `titleShort` goes to the breadcrumb, the browser tab and nav items, instead of `title`.
- `documentTitle` goes to the browser tab only — e.g. a long name the page shows in full in its body, while the header shows a short label.
- `to` is the breadcrumb link while a child page is open. It defaults to the level's named route, then its named `''` child, then its `redirect`.
- `suffix` is a component shown after the title, only while the page is the current one — a parent page's chips leave the header on its child pages.

Records that share a path, such as a parent and its `''` child, are one level, so a parent layout can title its index page.

The same titles fill other places:

- `useDocumentTitle(suffix)` keeps `document.title` in sync, page first: `payments/api · Payments Platform · App`. Call it once in the app's root component.
- WNavItem shows the short title its route's page registers, while the page is open, so a nav item of an item page shows the item instead of a static "Item".
- `useRouteTitles()` returns the levels for a custom header.

## API

<!-- @api WHeaderBar -->

### WHeaderBar

```ts
import WHeaderBar from 'eco-vue-js/dist/components/HeaderBar/WHeaderBar.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Title of the page. The `title` slot replaces it. Without both, the header shows the titles of the current route: a breadcrumb of its parents and the page title, see `useRouteTitle`. |

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
