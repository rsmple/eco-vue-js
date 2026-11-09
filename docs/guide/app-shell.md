---
group: Guide
order: 2
description: Set up the frame of an eco-vue-js app with WNavBar, WHeaderBar and WActionsBar — the CSS variables that describe the fixed bars, the content padding, filters and search in the bars, dark mode and a centred layout.
---

# App shell

Kit apps share one frame: a fixed header (`WHeaderBar`), a nav on the left (`WNavBar`) and an actions bar on the right (`WActionsBar`), with content between. The bars are `position: fixed` and push nothing aside — the app describes the frame in CSS variables, pads content by them, and every component that needs the content box (sticky list headers and columns, full-width rows, dropdowns, modals) reads the same variables.

This site works that way: see [`DocsLayout.vue`](https://github.com/rsmple/eco-vue-js/blob/main/docs/.vitepress/theme/DocsLayout.vue) and the top of [`style.css`](https://github.com/rsmple/eco-vue-js/blob/main/docs/.vitepress/theme/style.css).

## Frame variables

Set them on `body`. Each is the layout space a frame part takes at the current breakpoint; all but `--inner-margin` default to `0px`:

| Variable | What it is |
| --- | --- |
| `--header-height` | Height of the header. |
| `--nav-bar-width` | Space taken by the nav — `0px` below `xl`, where it's an overlay. |
| `--actions-bar-width` | Space taken by the actions bar — `0px` on phones, where it's hidden. |
| `--inner-margin` | Horizontal content padding. Comes from the theme (`w-inner-margin`, `w-inner-margin-sm`; `1rem`/`1.5rem`, see [Theming](./theming#layout)); set here only to override. |
| `--left-margin`, `--right-margin` | Space outside the frame, for custom centring — see [Centred frame](#centred-frame). |
| `--w-actions-bar-width` | Width of the actions bar itself, at every breakpoint. |
| `--actions-bar-filter-width` | Width of the filter panel sliding out of the actions bar from `sm` — see [Filters](#filters-and-search). |

The bars' widths are theme tokens, so also Tailwind sizes: the nav's content uses `w-nav-bar-width` to keep its width while collapsing.

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
  --w-actions-bar-width: var(--spacing-actions-bar-width);
  --actions-bar-filter-width: 24rem;

  @apply
    bg-surface text-accent
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

The breakpoints are fixed: `WNavBar` docks from `xl` (1280px), and `useIsMobile()` reports `isMobile` below `sm` (640px) and `isTablet` below `xl`.

### The content box

The kit derives the content box from the frame variables, each also a Tailwind size:

| Variable | Utility size | Value |
| --- | --- | --- |
| `--w-left-inner` | `---left-inner` | Content left edge: left margin + nav + inner margin. |
| `--w-right-inner` | `---right-inner` | The same on the right, with the actions bar. |
| `--w-width-inner` | `---width-inner` | Content width: `100vw` minus both. |
| `--w-top-inner` | — | Header height plus any sticky list header above. |
| `--w-height-inner` | `---height-inner` | Height remaining below. |

Frame variables are sizes too: `pt---header-height`, `pl---nav-bar-width`, `px---inner-margin`. Modals replace the content box with their own, so the classes work there too.

On a page (`w-page`) and in modals, content beside a wide list stays in view automatically while it scrolls sideways (see [List page](../recipes/list-page#content-beside-the-list)). Pages don't use these sizes for positioning — they're for what the kit doesn't place, like a fixed overlay.

## Layout component

The root layout mounts the three bars; its main area is `w-page`, which pads content by the frame (see [Page layout](../recipes/page-layout)):

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

  <main class="w-page">
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

The parts:

- **[`WNavBar`](/components/nav-bar)** docks at `xl`; below, it collapses and adds a menu button in the header's top-left corner (the header leaves it free). Emits `update:is-open`.
- **[`WHeaderBar`](/components/header-bar)** spans the full width; `pl`/`pr` keep its contents between the bars. Title via `title` or `#title`; `#right` goes before the search button.
- **[`WActionsBar`](/components/actions-bar)** holds `WButtonAction`s in `#top` and `#bottom` (`to` for routes, `tag="a"` + `href` for links) and settings in `#footer`. Off-screen on phones; slides in with the open nav.
- **Dark mode** is a `dark` class on an ancestor, usually `<html>`. [`WToggleTheme`](/components/toggle#theme-toggle) only switches a `Theme` value — the app applies and persists it.

## Filters and search

Pages add content to the bars without touching the layout:

- **[`WActionsBarFilter`](/components/actions-bar#filters)** — its slot becomes a panel sliding out of the actions bar, which gets a filter button badged with `count`. `--actions-bar-filter-width` wide from `sm`; full screen beside the bar on phones.
- **[`WHeaderBarSearch`](/components/header-bar#search)** — its slot replaces the header's title row, opened by a search button. The slot receives `visible`, `show` and `hide`; `shown` opens it immediately.

Both render nothing in place and clean up when the page unmounts.

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

Everything reads inherited variables, so a route without a bar just omits it and resets its variable on a wrapper of header and content — e.g. `[--actions-bar-width:0px]`.

## Centred frame

On wide screens the frame stops growing past `--w-content-max-width` (`80rem`, a theme token on `body`) and centres, with the outside space growing on both sides. The bars follow and `---left-inner`/`---right-inner` include it — pages need nothing.

```css
body {
  /* Wider pages, or `100vw` for no limit. */
  --w-content-max-width: 96rem;
}
```

To size the frame differently, set `--left-margin` and `--right-margin` yourself; they override the token:

```css
body {
  --left-margin: max(0px, (100vw - 92rem) / 2);
  --right-margin: var(--left-margin);
}
```
