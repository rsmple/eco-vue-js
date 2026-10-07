---
group: Guide
order: 1
description: Install eco-vue-js, wire Tailwind v4, vue-query and the global containers (modals, notifications, tooltips), and import components.
---

# Getting started

## Install

```sh
npm i eco-vue-js @tanstack/vue-query
```

Peer dependencies: `vue` ≥ 3.5, `@tanstack/vue-query` ≥ 5. `vue-router` is optional — only needed for components that take a `to` prop.

## Styles

The kit ships Tailwind v4 classes, not compiled CSS. Import its Tailwind base right after Tailwind in your app's stylesheet — it adds the theme tokens, variants and plugins, and registers the kit's components as a Tailwind source:

```css
@import "tailwindcss";
@import "eco-vue-js/tailwind-base/base.css";
```

Dark mode follows a `dark` class on an ancestor (usually `<html>`). Colors, fonts and field sizes are CSS variables — see [Theming](./theming) to change them.

### Markdown

Rendered markdown is styled inside a `.w-markdown` container: headings, lists, tables, inline code, and code blocks with numbered `.line`s. Sizes are in `em`, so the content follows the container's font size, and colors come from the color roles. Import it after the base:

```css
@import "eco-vue-js/tailwind-base/markdown.css";
/* Optional: GitBook blocks — hints, colored text, expandable sections, embedded videos */
@import "eco-vue-js/tailwind-base/css/markdown/blocks.css";
```

Add `enable-mobile` to the container to keep text on the page's inner margin below `sm` while code blocks and tables reach the screen edges, or `w-report` for print: code wraps and lines don't highlight on hover.

## Query client

List, select and async components fetch through `@tanstack/vue-query`. Install the plugin and hand the same client to the kit, so model actions running outside `setup` can reach it:

```ts
import {QueryClient, VueQueryPlugin} from '@tanstack/vue-query'
import {setQueryClient} from 'eco-vue-js/dist/utils/queryClient'

export const queryClient = new QueryClient()

setQueryClient(queryClient)

app.use(VueQueryPlugin, {queryClient})
```

The queries themselves are declared per model — see [Data layer](/guide/data-layer).

## App layout

Sticky list headers and columns, full-width rows, dropdowns and modals position themselves from a few CSS variables that describe the app's frame. Set them on `body`, with the values your header and side bars actually take at each breakpoint — all default to `0px`:

```css
body {
  --header-height: 3.5rem;
  --nav-bar-width: 0px;
  --actions-bar-width: 0px;
  --inner-margin: 1rem;

  @apply sm:[--actions-bar-width:3.5rem] xl:[--nav-bar-width:15rem];
}
```

[App shell](./app-shell) explains each variable and sets up the header, nav and actions bars around the content.

## Global containers

Modals, menus, notifications and tooltips render into containers mounted once at the root of the app — `WModal` renders the modals and every `WButtonMore` menu. `WShineEffect` is optional: it drives the moving shine on action buttons. `WNotify` shows the toasts; their history opens from `WNotifyCenterButton` in the actions bar (see [Notify](/components/notify#notify-center)).

```vue
<template>
  <RouterView />

  <WTooltipContainer />
  <WNotify />
  <WModal />
  <WShineEffect />
</template>

<script setup lang="ts">
import WModal from 'eco-vue-js/dist/components/Modal/WModal.vue'
import WNotify from 'eco-vue-js/dist/components/Notify/WNotify.vue'
import WShineEffect from 'eco-vue-js/dist/components/Shine/WShineEffect.vue'
import WTooltipContainer from 'eco-vue-js/dist/components/Tooltip/WTooltipContainer.vue'
</script>
```

## Texts

A few texts the components show on their own are in English: the Back, Next, Close, Cancel and submit buttons of a stepper, a confirm's Cancel and Accept, the question before a modal with unsaved changes closes, the warning about invalid fields, the From and To of a date picker, and No data on an empty chart. Replace them once, before the app mounts. A getter is read as the text renders, so a translation follows the locale:

```ts
import {setTexts} from 'eco-vue-js/dist/utils/texts'

setTexts({
  back: () => i18n.global.t('modal.back'),
  next: () => i18n.global.t('modal.next'),
  close: () => i18n.global.t('modal.close'),
  cancel: () => i18n.global.t('modal.cancel'),
})
```

A prop such as `submitText` or a confirm's `acceptText` still names its own button.

Dates, times, durations and numbers are formatted in `en-GB` until `setLocale` sets another locale — see [Formatting](/utilities/formatting#dates):

```ts
import {setLocale} from 'eco-vue-js/dist/utils/locale'

setLocale(() => i18n.global.locale.value)
```

## Importing

Import each component, utility and icon by its own path — there is no barrel import:

```ts
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
```

See [Conventions](./conventions) for the patterns the rest of the docs assume.

## AI assistants

The package carries these docs as Markdown, for the version it is: point an assistant at `node_modules/eco-vue-js/docs/llms.txt`, for example with a line in the app's `CLAUDE.md` or `AGENTS.md`:

```md
UI kit docs: node_modules/eco-vue-js/docs/llms.txt — read the page for a component before using it.
```

This site also serves them for the latest version: [llms.txt](https://rsmple.github.io/eco-vue-js/llms.txt) indexes every page, and [llms-full.txt](https://rsmple.github.io/eco-vue-js/llms-full.txt) has all of them in one file.

## Eslint config

The package also ships the shared eslint config used by its consumers:

```js
import plugin from 'eco-vue-js/eslint/plugin'

export default [
  ...plugin.configs.recommended({
    tsConfig: ['tsconfig.node.json', 'tsconfig.vue.json'],
  }),
]
```
