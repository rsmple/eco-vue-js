---
group: Guide
order: 2
description: Set up the frame of an eco-vue-js app with WNavBar, WHeaderBar and WActionsBar — the fixed header, nav and actions bars, the CSS variables that describe them, the content padding, filters and search in the bars, dark mode and a centred layout.
---

# App shell

Kit apps share one frame: a fixed header on top (`WHeaderBar`), a nav on the left (`WNavBar`) and an actions bar on the right (`WActionsBar`), with the page content between them. The bars are `position: fixed` and don't push anything aside — the app describes the frame in a few CSS variables, pads its content by them, and every component that needs to know where the content box is (sticky list headers and columns, full-width rows, dropdowns, modals) reads the same variables.

This site is built that way: its layout is [`DocsLayout.vue`](https://github.com/rsmple/eco-vue-js/blob/main/docs/.vitepress/theme/DocsLayout.vue) and its shell styles are at the top of [`style.css`](https://github.com/rsmple/eco-vue-js/blob/main/docs/.vitepress/theme/style.css).

## Frame variables

Set them on `body`. Each one is the space a part of the frame takes *in layout* at the current breakpoint, so all default to `0px`:

| Variable | What it is |
| --- | --- |
| `--header-height` | Height of the header. |
| `--nav-bar-width` | Space taken by the nav — `0px` below `xl`, where the nav is an overlay opened from the header. |
| `--actions-bar-width` | Space taken by the actions bar — `0px` on phones, where it is hidden. |
| `--inner-margin` | Horizontal padding of the content. |
| `--left-margin`, `--right-margin` | Space outside the frame when it is centred on a wide screen — see [Centred frame](#centred-frame). |
| `--w-actions-bar-width` | Width of the actions bar itself, at every breakpoint. |
| `--actions-bar-filter-width` | Width of the filter panel that slides out of the actions bar on `sm` and up — see [Filters](#filters-and-search). |

The bars' own widths come from two theme tokens, so they are also Tailwind sizes: the nav's content uses `w-nav-bar-width` to keep its width while the nav collapses.

```css
@import "tailwindcss";
@import "eco-vue-js/tailwind-base/base.css";

@theme {
  --spacing-nav-bar-width: 15rem;
  --spacing-actions-bar-width: 3.5rem;
}

body {
  --header-height: 3.5rem;
  --nav-bar-width: 0px;
  --actions-bar-width: 0px;
  --inner-margin: 1rem;
  --w-actions-bar-width: var(--spacing-actions-bar-width);
  --actions-bar-filter-width: 24rem;

  @apply
    bg-surface text-accent
    sm:[--inner-margin:1.5rem]
    sm:[--actions-bar-width:var(--spacing-actions-bar-width)]
    xl:[--nav-bar-width:var(--spacing-nav-bar-width)];
}

/* The bars have no background of their own: the class is a hook for the app's surface. */
.w-nav-bar {
  @apply bg-surface shadow-md xl:shadow-none;
}

.w-actions-bar {
  @apply bg-surface shadow-md sm:shadow-none;
}
```

The breakpoints aren't a free choice: `WNavBar` docks from `xl` (1280px) and turns into an overlay below it, and `useIsMobile()` reports `isMobile` below `sm` (640px) and `isTablet` below `xl` — the same widths the variables switch at.

### The content box

From the frame variables the kit derives the content box on every element, and exposes each as a Tailwind size:

| Variable | Utility size | Value |
| --- | --- | --- |
| `--w-left-inner` | `---left-inner` | Left edge of the content: left margin + nav + inner margin. |
| `--w-right-inner` | `---right-inner` | The same on the right, with the actions bar. |
| `--w-width-inner` | `---width-inner` | Width of the content: `100vw` minus both. |
| `--w-top-inner` | — | Header height plus the height of a sticky list header above. |
| `--w-height-inner` | `---height-inner` | Height left under them. |

The frame variables are sizes too: `pt---header-height`, `pl---nav-bar-width`, `px---inner-margin`. Inside a modal, the modal replaces the content box with its own, so the same classes work there.

An element that should stay in view while a wide list scrolls sideways sticks to the content's left edge and takes its width — the search input in the [list recipe](../recipes/list-with-fields) does this:

```vue
<WInput class="sticky left---left-inner w---width-inner" />
```

## Layout component

The root layout mounts the three bars and pads the content by the frame:

```vue
<template>
  <WNavBar @update:is-open="isNavOpen = $event">
    <div class="w-nav-bar-width no-scrollbar h-full overflow-y-auto overscroll-contain">
      <WNavItem
        to="/projects"
        title="Projects"
        :icon="markRaw(IconFolder)"
      />

      <WNavItem
        to="/settings"
        title="Settings"
        :icon="markRaw(IconSettings)"
      />
    </div>
  </WNavBar>

  <WHeaderBar
    :title="title"
    class="pl---nav-bar-width pr---actions-bar-width"
  />

  <main class="pt---header-height pl---left-inner pr---right-inner">
    <RouterView />
  </main>

  <Transition
    enter-active-class="transition-[translate]"
    leave-active-class="transition-[translate]"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <WActionsBar v-if="!isMobile || isNavOpen">
      <template #top>
        <WButtonAction
          to="/projects/new"
          title="New project"
          :icon="markRaw(IconAdd)"
        />
      </template>

      <template #footer>
        <WToggleTheme
          v-model="theme"
          center
          class="mb-4"
        />
      </template>
    </WActionsBar>
  </Transition>
</template>

<script setup lang="ts">
import {markRaw, ref, watch} from 'vue'
import {RouterView} from 'vue-router'

import {useIsMobile} from 'eco-vue-js/dist/utils/mobile'
import {Theme} from 'eco-vue-js/dist/utils/utils'

import WActionsBar from 'eco-vue-js/dist/components/ActionsBar/WActionsBar.vue'
import WButtonAction from 'eco-vue-js/dist/components/Button/WButtonAction.vue'
import WHeaderBar from 'eco-vue-js/dist/components/HeaderBar/WHeaderBar.vue'
import WNavBar from 'eco-vue-js/dist/components/Nav/WNavBar.vue'
import WNavItem from 'eco-vue-js/dist/components/Nav/WNavItem.vue'
import WToggleTheme from 'eco-vue-js/dist/components/Toggle/WToggleTheme.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
import IconFolder from 'eco-vue-js/dist/assets/icons/IconFolder'
import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'

defineProps<{
  title?: string
}>()

const {isMobile} = useIsMobile()

const isNavOpen = ref(false)

const theme = ref(Theme.LIGHT)

watch(theme, value => document.documentElement.classList.toggle('dark', value === Theme.DARK), {immediate: true})
</script>
```

What each part does:

- **`WNavBar`** docks at `xl`. Below it, it collapses and adds a menu button in the header's top-left corner — the header leaves that corner free on its own. It emits `update:is-open` when the overlay opens or closes.
- **`WHeaderBar`** spans the whole width; the `pl`/`pr` classes keep its title and buttons between the bars. The title is the `title` prop or the `#title` slot, and the `#right` slot goes before the search button.
- **`WActionsBar`** holds icon buttons: `WButtonAction` in the `#top` and `#bottom` slots, with `to` for routes or `tag="a"` with `href` for links, and settings in `#footer`. On phones it is off-screen, so it slides in together with the open nav.
- **Dark mode** is a `dark` class on an ancestor, usually `<html>`. `WToggleTheme` only switches a `Theme` value — applying and persisting it is up to the app.

## Nav items

`WNavItem` is a router link with an icon and a title. Both default to the route's `meta.icon` and `meta.titleShort` (or `meta.title`), so an item is often just `<WNavItem :to="{name: RouteName.PROJECTS}" />`. It is active while the current route has the same name; `queryFields` lists the query params that must match too, for items that open the same route with different filters. `count` shows a number in brackets after the title and `counter` a badge, with `skeleton` while they load.

`WNavItemExpand` groups items under a title. The items show under it while one of them is active; otherwise hovering the group opens them in a menu to the right. With `to`, the group is a link of its own. `even` keeps the items always shown and not indented, for a nav inside a page.

`WNavItemTransition` wraps a list of items so that the ones added or removed with `v-if` — such as an item for the current record — expand and collapse.

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

## Action buttons

`WButtonAction` is the icon button of the actions bar. `title` names it in a tooltip, or under the icon with `titleText`, and for screen readers. It is a router link with `to`, an external link with `tag="a"` and `href`, and a button otherwise. `count` adds a badge, `active` colors the icon for a toggle that is on, and `loading` runs a shimmer while its action is in progress.

## Filters and search

Pages put their own content into the bars without touching the layout:

- **`WActionsBarFilter`** — its default slot becomes a filter panel that slides out of the actions bar, and the bar gets a filter button with the `count` prop as its badge. The panel is `--actions-bar-filter-width` wide from `sm` up, and covers the screen next to the bar on phones.
- **`WHeaderBarSearch`** — its default slot is shown in place of the header's title row, and the header gets a search button that opens it. The slot receives `visible`, `show` and `hide`; the `shown` prop opens it right away.

Both render nothing where they are placed, and remove their content from the bar when the page unmounts.

```vue
<template>
  <WActionsBarFilter :count="activeFilterCount">
    <ProjectFilters v-model="filters" />
  </WActionsBarFilter>

  <WHeaderBarSearch>
    <template #default="{hide}">
      <WInput
        v-model="search"
        type="search"
        no-margin
        @blur="hide"
      />
    </template>
  </WHeaderBarSearch>

  <WList ... />
</template>
```

## Pages without a bar

Everything measures from inherited variables, so a route without a bar only needs the bar left out and its variable reset on an element that wraps the header and the content — for a page with no actions bar, `[--actions-bar-width:0px]`. The header and every component inside then use the full width.

## Centred frame

On very wide screens the frame can keep a maximum width and centre itself. Set the space outside it as `--left-margin` and `--right-margin`: `WNavBar` and `WActionsBar` offset themselves by them, and `---left-inner` and `---right-inner` already include them. The header needs them added to its padding:

```css
@theme {
  --spacing-frame-max-width: 92rem;
}

body {
  --left-margin: max(0px, (100vw - var(--spacing-frame-max-width)) / 2);
  --right-margin: var(--left-margin);
}
```

```vue
<WHeaderBar class="pl-[calc(var(--left-margin)+var(--nav-bar-width))] pr-[calc(var(--right-margin)+var(--actions-bar-width))]" />
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

<!-- @api WActionsBar -->

### WActionsBar

```ts
import WActionsBar from 'eco-vue-js/dist/components/ActionsBar/WActionsBar.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `textFilter` | `string` | — | Title of the filter button and heading of the filter panel. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `top` | — | WButtonAction buttons at the top, above the filter button. |
| `bottom` | — | WButtonAction buttons under the filter button. |
| `footer` | — | Content at the bottom of the bar, such as settings. |

<!-- @api-end -->

<!-- @api WActionsBarFilter -->

### WActionsBarFilter

```ts
import WActionsBarFilter from 'eco-vue-js/dist/components/ActionsBar/WActionsBarFilter.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | **required** | Number of filters set, shown as a badge on the filter button. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Filters, shown in the panel that slides out of the actions bar. |

<!-- @api-end -->

<!-- @api WButtonAction -->

### WButtonAction

```ts
import WButtonAction from 'eco-vue-js/dist/components/Button/WButtonAction.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | — | Icon of the button. The `icon` slot replaces it. |
| `title` | `string` | **required** | Name of the action, shown in a tooltip — or under the icon with `titleText` — and read by screen readers. |
| `active` | `boolean` | — | Colors the icon primary, for a toggle that is on. Only with the default `SECONDARY` type. |
| `tag` | `"button" \| "a"` | `"button"` | Element rendered without `to`: a `button`, or an `a` for an external link with `href`. |
| `href` | `string` | — | Link target when `tag` is `a`. |
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | `target` attribute of the link when `tag` is `a`. |
| `rel` | `string` | — | `rel` attribute of the link when `tag` is `a`. |
| `count` | `number` | — | Number in a badge on the corner, hidden at 0. |
| `semanticType` | `SemanticType` | `SemanticType.SECONDARY` | Color scheme of the button. |
| `disabled` | `boolean` | — | Grays the button out and ignores clicks. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the button and ignores clicks. |
| `tooltipText` | `string` | — | Tooltip text instead of `title`. |
| `titleText` | `boolean` | — | Shows `title` under the icon instead of in the tooltip. |
| `loading` | `boolean` | — | Runs a shimmer over the button while its action is in progress. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(event: MouseEvent)` | The button was clicked, unless it is disabled or a skeleton. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `icon` | — | Content of the button, replacing `icon`. |

<!-- @api-end -->

<!-- @api WToggleTheme -->

### WToggleTheme

```ts
import WToggleTheme from 'eco-vue-js/dist/components/Toggle/WToggleTheme.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Theme` | **required** | Current theme: the toggle is on, with a sun, for `Theme.LIGHT`, and off, with a moon, for `Theme.DARK`. |
| `title` | `string` | — | Label next to the switch; the `title` slot replaces it. |
| `small` | `boolean` | — | Smaller title text. |
| `disabled` | `boolean` | — | Blocks changes and dims the toggle. When unset, inherits the disabled state provided by a parent. |
| `loading` | `boolean` | — | Shows a spinner in the caret and ignores clicks. |
| `readonly` | `boolean` | — | Shows the state without allowing changes, and keeps the title selectable. When unset, inherits the readonly state provided by a parent. |
| `rightLabel` | `boolean` | — | Puts the title after the switch instead of before it. |
| `noMargin` | `boolean` | — | Drops the default vertical margin around the toggle. |
| `description` | `string` | — | Secondary text under the toggle. |
| `validate` | `ValidateFn \| ValidateFn[]` | — | Checks the new value before it is emitted. A returned error message cancels the change and is shown as a warning notification. |
| `center` | `boolean` | — | Centers the switch in its row. |
| `skeleton` | `boolean` | — | Renders a skeleton placeholder. When unset, inherits the skeleton state provided by a parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: Theme)` | The picked theme. |

<!-- @api-end -->
