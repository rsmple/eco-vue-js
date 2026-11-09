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

Peer dependencies: `vue` ≥ 3.5, `@tanstack/vue-query` ≥ 5. `vue-router` is optional — needed only for `to` props.

## Styles

The kit ships Tailwind v4 classes, not compiled CSS. Import its base right after Tailwind — it adds theme tokens, variants and plugins, and registers the kit's components as a source:

```css
@import "tailwindcss";
@import "eco-vue-js/tailwind-base/base.css";
```

Dark mode follows a `dark` class on an ancestor (usually `<html>`). Colors, fonts and field sizes are CSS variables — see [Theming](./theming).

### Markdown

`.w-markdown` styles rendered markdown: headings, lists, tables, inline code, and code blocks with numbered `.line`s. Sizes are in `em` and colors use the color roles. Import it after the base:

```css
@import "eco-vue-js/tailwind-base/markdown.css";
/* Optional: GitBook blocks — hints, colored text, expandable sections, embedded videos */
@import "eco-vue-js/tailwind-base/css/markdown/blocks.css";
```

Add `enable-mobile` to keep text on the inner margin below `sm` while code blocks and tables reach the edges, or `w-report` for print (code wraps, no line hover).

## Query client

Lists, selects and async components fetch through `@tanstack/vue-query`. Install the plugin and pass the same client to the kit, so model actions outside `setup` can reach it:

```ts
import {QueryClient, VueQueryPlugin} from '@tanstack/vue-query'
import {defaultQueryRetry, setQueryClient} from 'eco-vue-js/dist/utils/queryClient'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {retry: defaultQueryRetry},
  },
})

setQueryClient(queryClient)

app.use(VueQueryPlugin, {queryClient})
```

`defaultQueryRetry` retries twice when it may help: unreachable server, 5xx, 408 or 429. Other 4xx, cancellations and errors thrown by the query function fail immediately. To skip more, compose with `isRetryableError`:

```ts
options: {
  retry: (failureCount, error) => error.response?.status !== 504 && defaultQueryRetry(failureCount, error),
}
```

Queries are declared per model — see [Data layer](/guide/data-layer).

## App layout

Sticky list headers and columns, full-width rows, dropdowns and modals position from CSS variables describing the app frame. Set them on `body` with your bars' actual sizes per breakpoint — all default to `0px`:

```css
body {
  --header-height: 3.5rem;
  --nav-bar-width: 0px;
  --actions-bar-width: 0px;

  @apply sm:[--actions-bar-width:3.5rem] xl:[--nav-bar-width:15rem];
}
```

[App shell](./app-shell) explains each and sets up the bars.

## Global containers

Modals, menus, notifications and tooltips render into containers mounted once at the app root. `WModal` renders modals and `WButtonMore` menus. `WShineEffect` (optional) drives the shine on action buttons. `WNotify` shows toasts; their history opens from `WNotifyCenterButton` ([Notify](/components/notify#notify-center)). `WQueryStatus` shows one message with Retry when on-screen queries fail ([Query status](/components/query-status)).

```vue
<template>
  <RouterView />

  <WTooltipContainer />
  <WNotify />
  <WQueryStatus />
  <WModal />
  <WShineEffect />
</template>

<script setup lang="ts">
import WModal from 'eco-vue-js/dist/components/Modal/WModal.vue'
import WNotify from 'eco-vue-js/dist/components/Notify/WNotify.vue'
import WQueryStatus from 'eco-vue-js/dist/components/QueryStatus/WQueryStatus.vue'
import WShineEffect from 'eco-vue-js/dist/components/Shine/WShineEffect.vue'
import WTooltipContainer from 'eco-vue-js/dist/components/Tooltip/WTooltipContainer.vue'
</script>
```

## Texts

Built-in texts are in English: stepper buttons, confirm Cancel/Accept, the unsaved-changes prompt, the invalid-fields warning, date picker From/To, the empty chart's No data, list/[query boundary](/components/query-boundary)/[query status](/components/query-status) errors and Retry, and the [page error](/components/page-error). Replace them once before mounting; getters are read at render, so translations follow the locale:

```ts
import {setTexts} from 'eco-vue-js/dist/utils/texts'

setTexts({
  back: () => i18n.global.t('modal.back'),
  next: () => i18n.global.t('modal.next'),
  close: () => i18n.global.t('modal.close'),
  cancel: () => i18n.global.t('modal.cancel'),
})
```

Props like `submitText` or `acceptText` still override per button.

Dates, times, durations and numbers use `en-GB` until `setLocale` changes it — see [Formatting](/utilities/formatting#dates):

```ts
import {setLocale} from 'eco-vue-js/dist/utils/locale'

setLocale(() => i18n.global.locale.value)
```

## Importing

Import each component, utility and icon by path — there is no barrel:

```ts
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
```

See [Conventions](./conventions) for patterns the docs assume.

## AI assistants

The package ships these docs as Markdown for its version: point an assistant at `node_modules/eco-vue-js/docs/llms.txt`, e.g. from the app's `CLAUDE.md` or `AGENTS.md`:

```md
UI kit docs: node_modules/eco-vue-js/docs/llms.txt — read the page for a component before using it.
```

For the latest version, this site serves [llms.txt](https://rsmple.github.io/eco-vue-js/llms.txt) (an index) and [llms-full.txt](https://rsmple.github.io/eco-vue-js/llms-full.txt) (everything in one file).

## Eslint config

The package also ships a shared eslint config:

```js
import plugin from 'eco-vue-js/eslint/plugin'

export default [
  ...plugin.configs.recommended({
    tsConfig: ['tsconfig.node.json', 'tsconfig.vue.json'],
  }),
]
```
