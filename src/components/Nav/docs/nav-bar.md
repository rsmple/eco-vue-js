---
group: Layout
description: WNavBar, WNavItem, WNavItemExpand and WNavItemTransition — the app's left nav that docks on wide screens and opens from the header below, with router-link items, groups and counters.
---

# Nav bar

`WNavBar` is the nav on the left of the [app shell](/guide/app-shell) — the one on the left of this page. It is `position: fixed` under the header and takes `--nav-bar-width` in layout from `xl` (1280px) up. Below it, it collapses and adds a menu button in the header's top-left corner, and opens as an overlay over the page; it emits `update:is-open` when the overlay opens or closes. Its class `w-nav-bar` is the hook for the app's surface and shadow, and its content uses `w-nav-bar-width` to keep its width while the nav collapses.

## Nav items

`WNavItem` is a router link with an icon and a title. Both default to the route's `meta.icon` and `meta.titleShort` (or `meta.title`), so an item is often just `<WNavItem :to="{name: RouteName.PROJECTS}" />`. It is active while the current route has the same name; `queryFields` lists the query params that must match too, for items that open the same route with different filters. `count` shows a number in brackets after the title and `counter` a badge, with `skeleton` while they load.

`WNavItemExpand` groups items under a title. The items show under it while one of them is active; otherwise hovering the group opens them in a menu to the right. With `to`, the group is a link of its own. `even` keeps the items always shown and not indented, for a nav inside a page.

`WNavItemTransition` wraps a list of items so that the ones added or removed with `v-if` — such as an item for the current record — expand and collapse.

The demo below uses `even` to show a group inside a page. Its items link to pages of this site, so the one you're on is active.

<!-- @example Nav/Basic -->

<DocsDemo name="Nav/Basic" />

```vue
<template>
  <div class="grid max-w-xs gap-4">
    <WToggle
      v-model="showRecent"
      title="Show the recent page"
    />

    <div class="rounded-xl border border-solid border-line-subtle py-2">
      <WNavItemTransition>
        <WNavItemExpand
          title="Layout"
          :icon="markRaw(IconMenu)"
          :query-fields="[]"
          even
        >
          <WNavItem
            :to="{path: '/components/nav-bar'}"
            title="Nav bar"
            :icon="markRaw(IconList)"
            :query-fields="[]"
          />

          <WNavItem
            :to="{path: '/components/header-bar'}"
            title="Header bar"
            :icon="markRaw(IconHeading)"
            :count="2"
            :query-fields="[]"
          />

          <WNavItem
            :to="{path: '/components/actions-bar'}"
            title="Actions bar"
            :icon="markRaw(IconElement)"
            :counter="3"
            :query-fields="[]"
          />

          <WNavItem
            v-if="showRecent"
            :to="{path: '/components/report-pages'}"
            title="Report pages"
            :icon="markRaw(IconNote)"
            :query-fields="[]"
          />
        </WNavItemExpand>
      </WNavItemTransition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WNavItem from 'eco-vue-js/dist/components/Nav/WNavItem.vue'
import WNavItemExpand from 'eco-vue-js/dist/components/Nav/WNavItemExpand.vue'
import WNavItemTransition from 'eco-vue-js/dist/components/Nav/WNavItemTransition.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconElement from 'eco-vue-js/dist/assets/icons/IconElement'
import IconHeading from 'eco-vue-js/dist/assets/icons/IconHeading'
import IconList from 'eco-vue-js/dist/assets/icons/IconList'
import IconMenu from 'eco-vue-js/dist/assets/icons/IconMenu'
import IconNote from 'eco-vue-js/dist/assets/icons/IconNote'

const showRecent = ref(false)
</script>
```

<!-- @example-end -->

In an app the items open routes by name:

```vue
<WNavItemTransition>
  <WNavItem :to="{name: RouteName.PROJECTS}" />

  <WNavItem
    v-if="$route.name === RouteName.PROJECT"
    :to="{name: RouteName.PROJECT, params: {projectId: $route.params.projectId}}"
  />

  <WNavItemExpand
    title="Plants"
    :icon="markRaw(IconPlant)"
    :count="plantCount"
  >
    <WNavItem
      :to="{name: RouteName.PLANTS, query: {status: 'thirsty'}}"
      title="Thirsty"
      :query-fields="['status']"
    />

    <WNavItem
      :to="{name: RouteName.PLANTS, query: {status: 'watered'}}"
      title="Watered"
      :query-fields="['status']"
    />
  </WNavItemExpand>
</WNavItemTransition>
```

## API

<!-- @api WNavBar -->

### WNavBar

```ts
import WNavBar from 'eco-vue-js/dist/components/Nav/WNavBar.vue'
```

#### Props

_No props._

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:is-open` | `(value: boolean)` | The nav opened or closed below `xl`, where it is an overlay. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the nav, such as WNavItem items. |

<!-- @api-end -->

<!-- @api WNavItem -->

### WNavItem

```ts
import WNavItem from 'eco-vue-js/dist/components/Nav/WNavItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | — | Icon before the title. Defaults to the route's `meta.icon`. |
| `title` | `string` | — | Title of the item. Defaults to the route's `meta.titleShort`, then `meta.title`. |
| `count` | `number` | — | Number after the title in brackets, such as the number of items on the page it opens. |
| `counter` | `number` | — | Number in a badge over the end of the title, such as unread items. Hidden at 0. |
| `skeleton` | `boolean` | — | Shows a placeholder for `count` and hides `counter`, while they load. |
| `hasActive` | `boolean` | — | Marks the item as the parent of the active item. Set by WNavItemExpand. |
| `expand` | `boolean` | — | Marks the item as the toggle of a group without a route of its own. Set by WNavItemExpand. |
| `indent` | `boolean` | — | Indents the item as a child of a group. Set by WNavItemExpand. |
| `queryFields` | `string[]` | — | Query params that must match the current route's for the item to be active, besides its route name. Other params, such as filters, are ignored. |
| `hovered` | `boolean` | — | Highlights the item as hovered. Set by WNavItemExpand while its menu is open. |
| `even` | `boolean` | — | Lays the item out without the indent of a group. Set by WNavItemExpand. |
| `to` | `RouteLocationRaw` | **required** | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `icon` | — | Icon before the title, when neither `icon` nor the route's `meta.icon` is set. |
| `right` | — | Content at the end of the item. |

<!-- @api-end -->

<!-- @api WNavItemExpand -->

### WNavItemExpand

```ts
import WNavItemExpand from 'eco-vue-js/dist/components/Nav/WNavItemExpand.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | — | Icon before the title. |
| `title` | `string` | **required** | Title of the group. |
| `count` | `number` | — | Number after the title in brackets. |
| `counter` | `number` | — | Number in a badge over the end of the title. Hidden at 0. |
| `skeleton` | `boolean` | — | Shows a placeholder for `count` and hides `counter`, while they load. |
| `indent` | `boolean` | — | Indents the group as a child of another group. |
| `queryFields` | `string[]` | — | Query params that must match the current route's for the group's own route to be active. |
| `even` | `boolean` | — | Keeps the items always shown, without indent and without the menu on hover, e.g. for a nav inside a page. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | WNavItem items of the group. They show under the group while one of them is active, and in a menu on hover otherwise. |
| `icon` | — | Icon before the title, when `icon` isn't set. |

<!-- @api-end -->

<!-- @api WNavItemTransition -->

### WNavItemTransition

```ts
import WNavItemTransition from 'eco-vue-js/dist/components/Nav/WNavItemTransition.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Nav items. Items added or removed with `v-if` expand and collapse. |

<!-- @api-end -->
