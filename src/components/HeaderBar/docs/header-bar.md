---
group: Layout
description: WHeaderBar and WHeaderBarSearch — the app's fixed header with the page title and buttons, and a search that a page puts into it.
---

# Header bar

`WHeaderBar` is the [app shell](/guide/app-shell)'s fixed header, as on this page: full width, `--header-height` tall. Pad it by the side bars (`pl---nav-bar-width pr---actions-bar-width`) to keep its content between them. Below `xl` it leaves its top-left corner free for the nav's menu button.

The title is the `title` prop or slot; the `right` slot follows, before the search button. The background is translucent and blurred where `backdrop-filter` is supported.

## Search

`WHeaderBarSearch` puts a search into the header from any page. Its slot replaces the title row, opened by a search button. The slot receives `visible`, `show` and `hide`; `shown` opens it immediately and whenever it turns `true`. It renders nothing in place and cleans up on unmount.

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

Without a `title`, the header shows the current route's titles on one line: parents as muted links, the page in bold. Each `route.matched` level takes its title from the page or its `meta.title`.

A page sets a data-dependent title from setup with `useRouteTitle`, registered for its route record and removed on unmount:

```ts
import {useRouteTitle} from 'eco-vue-js/dist/utils/useRouteTitle'

useRouteTitle(() => ({
  title: query.data.value?.name,
  suffix: ProductTitleSuffix,
}))
```

- `title` — `undefined` while loading shows a placeholder.
- `titleShort` — used in the breadcrumb, browser tab and nav items instead of `title`.
- `documentTitle` — browser tab only, e.g. a long name while the header shows a short label.
- `to` — breadcrumb link while a child page is open. Defaults to the level's named route, then its named `''` child, then its `redirect`.
- `suffix` — a component after the title, only while the page is current.
- `trail` — non-route levels after the page, like a list's active filter. The page level becomes a link (set `to` to keep other filters), and the last trail level is current, with its own `suffix`:

```ts
useRouteTitle(() => ({
  title: t('nav.pipelines'),
  to: {query: {...route.query, status: undefined}},
  trail: status.value ? [{title: statusTitleMap[status.value], suffix: WorkersText}] : [],
  suffix: WorkersText,
}))
```

Records sharing a path (a parent and its `''` child) are one level, so a parent layout can title its index page.

The same titles feed:

- `useDocumentTitle(suffix)` — keeps `document.title` in sync, page first: `payments/api · Payments Platform · App`. Call once in the root component.
- WNavItem — shows its page's registered short title while open, so an item page's nav entry shows the item, not "Item".
- `useRouteTitles()` — the levels, for a custom header.

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
