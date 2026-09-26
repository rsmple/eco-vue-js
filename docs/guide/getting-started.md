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

Dark mode follows a `dark` class on an ancestor (usually `<html>`).

## Query client

List, select and async components fetch through `@tanstack/vue-query`. Install the plugin and hand the same client to the kit, so model actions running outside `setup` can reach it:

```ts
import {QueryClient, VueQueryPlugin} from '@tanstack/vue-query'
import {setQueryClient} from 'eco-vue-js/dist/utils/queryClient'

export const queryClient = new QueryClient()

setQueryClient(queryClient)

app.use(VueQueryPlugin, {queryClient})
```

## Global containers

Modals, notifications and tooltips render into containers mounted once at the root of the app:

```vue
<template>
  <RouterView />

  <WTooltipContainer />
  <WNotify />
  <WModal />
</template>

<script setup lang="ts">
import WModal from 'eco-vue-js/dist/components/Modal/WModal.vue'
import WNotify from 'eco-vue-js/dist/components/Notify/WNotify.vue'
import WTooltipContainer from 'eco-vue-js/dist/components/Tooltip/WTooltipContainer.vue'
</script>
```

## Importing

Import each component, utility and icon by its own path — there is no barrel import:

```ts
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
```

See [Conventions](./conventions) for the patterns the rest of the docs assume.

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
