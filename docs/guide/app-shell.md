---
group: Guide
order: 2
description: Set up the frame of an eco-vue-js app — the fixed header, nav and actions bars, the CSS variables that describe them, the content padding, filters and search in the bars, dark mode and a centred layout.
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
    bg-default dark:bg-default-dark text-black-default dark:text-gray-100
    sm:[--inner-margin:1.5rem]
    sm:[--actions-bar-width:var(--spacing-actions-bar-width)]
    xl:[--nav-bar-width:var(--spacing-nav-bar-width)];
}

/* The bars have no background of their own: the class is a hook for the app's surface. */
.w-nav-bar {
  @apply bg-default dark:bg-default-dark shadow-md xl:shadow-none;
}

.w-actions-bar {
  @apply bg-default dark:bg-default-dark shadow-md sm:shadow-none;
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
