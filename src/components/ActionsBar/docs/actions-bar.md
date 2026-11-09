---
group: Layout
description: WActionsBar, WActionsBarFilter and WButtonAction — the app's bar of icon buttons on the right, with a filter panel that pages slide out of it.
---

# Actions bar

`WActionsBar` is the [app shell](/guide/app-shell)'s right bar of icon buttons: `position: fixed`, `--w-actions-bar-width` wide, taking `--actions-bar-width` from `sm`. On phones it's off-screen and slides in with the open nav. `w-actions-bar` is the hook for the app's surface and shadow.

Buttons go in `top` and `bottom` (the filter button sits between); settings like a [theme toggle](/components/toggle#theme-toggle) go in `footer`.

## Action buttons

`WButtonAction` is the bar's icon button. `title` labels it in a tooltip (or under the icon with `titleText`) and for screen readers. A router link with `to`, a link with `tag="a"` + `href`, else a button. `count` adds a badge, `active` highlights a toggle, `loading` shimmers.

## Filters

`WActionsBarFilter` lets a page put filters in the bar: its slot becomes a sliding panel, and the bar gets a filter button badged with `count`, titled by the bar's `textFilter` (also the panel heading). `--actions-bar-filter-width` wide from `sm`; full screen beside the bar on phones. Renders nothing in place; cleans up on unmount.

The demo's bar is fixed to the frame, not the window. Click the filter button.

<!-- @example ActionsBar/Basic client -->

<DocsDemo name="ActionsBar/Basic" client-only />

```vue
<template>
  <!--
    The bar is `position: fixed` to the window in an app. The transform makes this frame the box it is fixed to,
    and the variables are the ones an app sets on `body`. `docs-app-frame` is this site's own: it lets the bar float as the site's bars do.
  -->
  <div
    class="
      docs-app-frame relative h-112 overflow-hidden rounded-xl border border-solid border-line-subtle transform-[translateZ(0)]
      [--actions-bar-filter-width:16rem] [--header-height:3.5rem] [--w-actions-bar-width:3.5rem]
    "
  >
    <div class="p---inner-margin grid gap-2 pr-20">
      <span class="font-semibold">Plants</span>
      <span class="text-description text-sm">
        {{ onlyThirsty ? 'Thirsty plants only' : 'All plants' }}{{ light ? `, ${ light } light` : '' }}
      </span>
    </div>

    <WActionsBar text-filter="Filters">
      <template #top>
        <WButtonAction
          title="Add plant"
          :icon="markRaw(IconAdd)"
          @click="added++"
        />

        <WButtonAction
          title="Water all"
          :icon="markRaw(IconDrop)"
          :loading="watering"
          @click="water"
        />

        <WButtonAction
          title="Alerts"
          :icon="markRaw(IconNotification)"
          :count="added"
          :active="added > 0"
          @click="added = 0"
        />
      </template>

      <template #footer>
        <WButtonAction
          title="Settings"
          :icon="markRaw(IconSettings)"
          title-text
        />
      </template>
    </WActionsBar>

    <WActionsBarFilter :count="(onlyThirsty ? 1 : 0) + (light ? 1 : 0)">
      <div class="px---inner-margin grid gap-4">
        <WToggle
          v-model="onlyThirsty"
          title="Thirsty only"
        />

        <WCheckbox
          v-for="item in lights"
          :key="item"
          :model-value="light === item"
          :title="item"
          radio
          @update:model-value="light = $event ? item : undefined"
        />
      </div>
    </WActionsBarFilter>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WActionsBar from 'eco-vue-js/dist/components/ActionsBar/WActionsBar.vue'
import WActionsBarFilter from 'eco-vue-js/dist/components/ActionsBar/WActionsBarFilter.vue'
import WButtonAction from 'eco-vue-js/dist/components/Button/WButtonAction.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'
import IconNotification from 'eco-vue-js/dist/assets/icons/IconNotification'
import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'

const lights = ['Bright', 'Partial', 'Shade']

const onlyThirsty = ref(false)
const light = ref<string>()
const added = ref(0)
const watering = ref(false)

const water = () => {
  watering.value = true
  setTimeout(() => watering.value = false, 1500)
}
</script>
```

<!-- @example-end -->

## API

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
