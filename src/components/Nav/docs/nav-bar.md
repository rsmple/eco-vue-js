---
group: Layout
description: WNavBar, WNavItem, WNavItemExpand and WNavItemTransition — the app's left nav that docks on wide screens and opens from the header below, with router-link items, groups and counters.
---

# Nav bar

`WNavBar` is the [app shell](/guide/app-shell)'s left nav, as on this page. It's `position: fixed` under the header and takes `--nav-bar-width` from `xl` (1280px). Below that it collapses, adds a menu button in the header's top-left corner, and opens as an overlay, emitting `update:is-open`. `w-nav-bar` is the hook for the app's surface and shadow; its content uses `w-nav-bar-width` to keep its width while collapsing.

The `brand` slot is the top row, level with the header, for a logo. `brandTo` makes the whole row a link, with an inset hover pill like the items'. In floating layouts, the pill and the first and last items keep equal room from the nav's edges so their corners run parallel; that room is part of the item, so it's clickable to the edge. Other content at the top sets its own spacing.

The `footer` slot sits at the bottom below a line (e.g. a back button or version), with items scrolling above. It paints nothing — don't add an opaque sticky block, which in glass covers the translucent fill.

```vue
<WNavBar :brand-to="{name: RouteName.HOME}">
  <template #brand>
    <AppLogo class="square-6" />
  </template>

  <WNavItem :to="{name: RouteName.PROJECTS}" />

  <template #footer>
    <span class="text-description text-xs">{{ version }}</span>
  </template>
</WNavBar>
```

## Nav items

`WNavItem` is a router link with icon and title, defaulting to the route's `meta.icon` and `meta.titleShort` (or `meta.title`) — often just `<WNavItem :to="{name: RouteName.PROJECTS}" />`. It's active when the route name matches; `queryFields` lists query params that must match too. `count` shows a bracketed number, `counter` a badge, `skeleton` while loading.

`WNavItemExpand` groups items under a title: shown while one is active, otherwise opened in a hover menu to the right. One group menu opens at a time. The menu aligns to the group's top (or bottom low on screen), shifts to stay visible, and scrolls when taller than the screen. `to` makes the group a link; `even` keeps items always shown and unindented, for an in-page nav.

Groups nest, indenting per level. Items without an icon (`icon`, `icon` slot or `meta.icon`) start with the title.

`WNavItemTransition` wraps items so ones added or removed with `v-if` (e.g. the current record) expand and collapse.

The demo uses `even` for an in-page group; its items link to this site, so the current page is active.

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

In an app, items open routes by name:

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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `brandTo` | `RouteLocationRaw` | — | Where the brand links to, such as the home page. The whole brand row is the link, as an item is, with its hover pill inset as the items' and the brand mark centered in it. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:is-open` | `(value: boolean)` | The nav opened or closed below `xl`, where it is an overlay. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the nav, such as WNavItem items. |
| `brand` | — | A logo or brand mark in the frame's top-left corner: the nav's top row, level with the header. With `brandTo` the row is a link and the slot is the mark in its pill. Without it the row is inset as the items are and the slot fills it, so content with `rounded-(--w-nav-item-rounded)` lines up with them. Below `xl` it is a row of its own under the toggle. |
| `footer` | — | Content at the nav's bottom, such as a back button or the app's version: under the items, which scroll above it, past a line. It is inset as the items are and paints nothing of its own, so it is the nav's surface in every layout style. |

<!-- @api-end -->

<!-- @api WNavItem -->

### WNavItem

```ts
import WNavItem from 'eco-vue-js/dist/components/Nav/WNavItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | — | Icon before the title. Defaults to the route's `meta.icon`. Without an icon the title takes its place. |
| `title` | `string` | — | Title of the item. Defaults to the title the route's page registers with `useRouteTitle` while it is open, then the route's `meta.titleShort`, then `meta.title`. |
| `count` | `number` | — | Number after the title in brackets, such as the number of items on the page it opens. |
| `counter` | `number` | — | Number in a badge over the end of the title, such as unread items. Hidden at 0. |
| `skeleton` | `boolean` | — | Shows a placeholder for `count` and hides `counter`, while they load. |
| `hasActive` | `boolean` | — | Marks the item as the parent of the active item. Set by WNavItemExpand. |
| `expand` | `boolean` | — | Marks the item as the toggle of a group without a route of its own. Set by WNavItemExpand. |
| `indent` | `number` | — | How many groups the item is nested in, which sets its indent. Set by WNavItemExpand. |
| `queryFields` | `string[]` | — | Query params that must match the current route's for the item to be active, besides its route name. Other params, such as filters, are ignored. |
| `paramFields` | `string[]` | — | Route params that must match the current route's for the item to be active, besides its route name. Other route params are ignored. |
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
| `icon` | `SVGComponent` | — | Icon before the title. Without an icon the title takes its place. |
| `title` | `string` | **required** | Title of the group. |
| `count` | `number` | — | Number after the title in brackets. |
| `counter` | `number` | — | Number in a badge over the end of the title. Hidden at 0. |
| `skeleton` | `boolean` | — | Shows a placeholder for `count` and hides `counter`, while they load. |
| `indent` | `number` | — | How many groups the group is nested in, which sets its indent. Set by a parent WNavItemExpand. |
| `queryFields` | `string[]` | — | Query params that must match the current route's for the group's own route to be active. |
| `paramFields` | `string[]` | — | Route params that must match the current route's for the group's own route to be active. |
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
