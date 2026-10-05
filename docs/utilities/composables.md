---
group: Utilities
description: Composables from eco-vue-js — useCopy for the clipboard, useComponentStates for inherited readonly, disabled and skeleton states, useIsMobile, useTabActiveListener and useOptionalRouter.
---

# Composables

Composables the kit's components are built on, for building your own components the same way. Each is imported from its own file under `eco-vue-js/dist/utils/` or `eco-vue-js/dist/composables/`.

## Clipboard

```ts
import {doCopy, useCopy} from 'eco-vue-js/dist/utils/useCopy'
```

`useCopy(value)` copies a ref or getter to the clipboard and reports it with a notification: "Copied", "Nothing to copy" for an empty value, or "Copy failed" with a hint to allow clipboard access for the site. It returns `doCopy`, `copied` — `true` for a second after a copy — and `iconCopy`, the copy icon that turns into a check while `copied`. `doCopy(text)` is the same without the state, and resolves to whether the copy succeeded.

The notifications need [`WNotify`](/components/notify) mounted at the app root.

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

The kit's controls take `readonly`, `disabled` and `skeleton` from the nearest parent that provides them, unless the prop is set — see [Conventions](/guide/conventions#disabled-readonly-and-skeleton-are-inherited). Your own components can do the same:

- **`useComponentStates(props)`** returns `isReadonly`, `isDisabled` and `isSkeleton`: the prop when it is set, the provided state otherwise. Declare the props as optional booleans, so that unset stays `undefined` rather than `false`.
- **`useComponentStatesButton(props)`** is the version for buttons, which have no readonly state: `isDisabled` is also `true` inside a readonly parent.
- **`useComponentStatesSkeleton(props)`** returns only `isSkeleton`, for display components.
- **`useProvideReadonly(value)`**, **`useProvideDisabled(value)`** and **`useProvideSkeleton(value)`** provide a state — a boolean or a ref — to everything inside the calling component, and return the state provided above it. Called without a value they only read it.

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

`useIsMobile()` returns `isMobile` (below `sm`, 640px) and `isTablet` (below `xl`, 1280px) as computed refs, kept up to date on resize. Both are `false` until the component mounts, so the server render and the first client render match. `getIsMobile()` and `getIsTablet()` read the same once, without reactivity.

`getIsTouchDevice()` tells whether the device has a touch screen; tooltips with `noTouch` use it to stay closed. `setIsTouchDeviceInit(value)` overrides it, e.g. in tests.

## Tab activation

```ts
import {useTabActiveListener} from 'eco-vue-js/dist/utils/useTabActiveListener'
```

`useTabActiveListener(listener)` calls `listener` whenever the [tab](/components/tabs) the component is in becomes active — for something to do once it is in view, such as focusing a field: inputs with `autofocus` use it to take focus when their tab opens. Outside tabs it does nothing.

## Optional router

```ts
import {useOptionalRoute, useOptionalRouter} from 'eco-vue-js/dist/composables/useOptionalRouter'
```

The kit works with or without vue-router. `useOptionalRouter()` returns the app's router when it has one, and otherwise a fallback with the same `push`, `replace` and `resolve`, which navigates by changing `location`. `useOptionalRoute()` likewise returns the current route, or one read from `location` — `name` is then the path. Both have `noRouter: true` when they are the fallback. Use them in components that should work in apps without vue-router, as [`WNavItem`](/components/nav-bar) does.
