---
group: Utilities
description: Composables from eco-vue-js — useCopy for the clipboard, useComponentStates for inherited readonly, disabled and skeleton states, useIsMobile, useTabActiveListener and useOptionalRouter.
---

# Composables

The composables the kit's components use, for building your own the same way. Each comes from its own file under `eco-vue-js/dist/utils/` or `eco-vue-js/dist/composables/`.

## Clipboard

```ts
import {doCopy, useCopy} from 'eco-vue-js/dist/utils/useCopy'
```

`useCopy(value)` copies a ref or getter and notifies: "Copied", "Nothing to copy", or "Copy failed" with a hint to allow clipboard access. It returns `doCopy`, `copied` (`true` for a second) and `iconCopy` (turns into a check while `copied`). `doCopy(text)` is the stateless version, resolving to success.

Notifications need [`WNotify`](/components/notify) mounted.

<!-- @example utilities/Copy -->

<DocsDemo name="utilities/Copy" />

```vue
<template>
  <div class="flex max-w-md items-end gap-2">
    <WInput
      v-model="code"
      title="Invite code"
      no-margin
      class="flex-1"
    />

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      :aria-label="copied ? 'Copied' : 'Copy'"
      @click="doCopy"
    >
      <component
        :is="iconCopy"
        class="square-5"
      />
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {useCopy} from 'eco-vue-js/dist/utils/useCopy'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

const code = ref<string | undefined>('GREEN-THUMB-2026')

const {copied, iconCopy, doCopy} = useCopy(code)
</script>
```

<!-- @example-end -->

## Component states

```ts
import {useComponentStates, useComponentStatesButton, useComponentStatesSkeleton} from 'eco-vue-js/dist/utils/useComponentStates'
import {useProvideDisabled, useProvideReadonly, useProvideSkeleton} from 'eco-vue-js/dist/utils/provide'
```

Controls take `readonly`, `disabled` and `skeleton` from the nearest providing parent unless set — see [Conventions](/guide/conventions#disabled-readonly-and-skeleton-are-inherited). For your own components:

- **`useComponentStates(props)`** returns `isReadonly`, `isDisabled` and `isSkeleton`: the prop if set, else the provided state. Declare the props as optional booleans so unset stays `undefined`.
- **`useComponentStatesButton(props)`** — for buttons (no readonly): `isDisabled` is also `true` in a readonly parent.
- **`useComponentStatesSkeleton(props)`** — only `isSkeleton`, for display components.
- **`useProvideReadonly(value)`**, **`useProvideDisabled(value)`**, **`useProvideSkeleton(value)`** provide a state (boolean or ref) to descendants and return the state from above. Without a value they only read.

<!-- @example utilities/States -->

<DocsDemo name="utilities/States" />

```vue
<template>
  <div class="grid max-w-md gap-4">
    <div class="flex flex-wrap gap-x-6">
      <WToggle
        v-model="readonly"
        title="Readonly"
      />

      <WToggle
        v-model="skeleton"
        title="Skeleton"
      />
    </div>

    <PlantShelf
      :readonly="readonly"
      :skeleton="skeleton"
    >
      <PlantBadge
        v-for="name in plants"
        :key="name"
        :name="name"
        @water="watered = name"
      />

      <PlantBadge
        name="Cactus"
        :readonly="false"
        @water="watered = 'Cactus'"
      />
    </PlantShelf>

    <span
      v-if="watered"
      class="text-description text-sm"
    >
      Watered {{ watered }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import PlantBadge from './parts/PlantBadge.vue'
import PlantShelf from './parts/PlantShelf.vue'

const plants = ['Basil', 'Fern']

const readonly = ref(false)
const skeleton = ref(false)
const watered = ref<string>()
</script>
```

<!-- @example-end -->

## Screen size

```ts
import {getIsMobile, getIsTablet, getIsTouchDevice, setIsTouchDeviceInit, useIsMobile} from 'eco-vue-js/dist/utils/mobile'
```

`useIsMobile()` returns `isMobile` (below `sm`, 640px) and `isTablet` (below `xl`, 1280px) as computed refs. Both are `false` until mount, so SSR and hydration match. `getIsMobile()` and `getIsTablet()` read once, non-reactively.

`getIsTouchDevice()` detects a touch screen (tooltips with `noTouch` use it); `setIsTouchDeviceInit(value)` overrides it, e.g. in tests.

## Tab activation

```ts
import {useTabActiveListener} from 'eco-vue-js/dist/utils/useTabActiveListener'
```

`useTabActiveListener(listener)` runs whenever the component's [tab](/components/tabs) becomes active — e.g. `autofocus` inputs focus when their tab opens. No-op outside tabs.

## Optional router

```ts
import {useOptionalRoute, useOptionalRouter} from 'eco-vue-js/dist/composables/useOptionalRouter'
```

The kit works with or without vue-router. `useOptionalRouter()` returns the router, or a fallback with `push`, `replace` and `resolve` that navigates via `location`. `useOptionalRoute()` returns the route, or one read from `location` (`name` is the path). Fallbacks have `noRouter: true`. [`WNavItem`](/components/nav-bar) uses them.
