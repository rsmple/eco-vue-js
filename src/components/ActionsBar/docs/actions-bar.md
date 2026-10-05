---
group: Layout
description: WActionsBar, WActionsBarFilter and WButtonAction — the app's bar of icon buttons on the right, with a filter panel that pages slide out of it.
---

# Actions bar

`WActionsBar` is the bar of icon buttons on the right of the [app shell](/guide/app-shell). It is `position: fixed`, `--w-actions-bar-width` wide, and takes `--actions-bar-width` in layout from `sm` up; on phones it is off-screen, and apps slide it in together with the open nav. Its class `w-actions-bar` is the hook for the app's surface and shadow.

Buttons go in the `top` and `bottom` slots — the filter button sits between them — and settings, such as a [theme toggle](/components/toggle#theme-toggle), in `footer` at the bottom.

## Action buttons

`WButtonAction` is the icon button of the actions bar. `title` names it in a tooltip, or under the icon with `titleText`, and for screen readers. It is a router link with `to`, an external link with `tag="a"` and `href`, and a button otherwise. `count` adds a badge, `active` colors the icon for a toggle that is on, and `loading` runs a shimmer while its action is in progress.

## Filters

`WActionsBarFilter` lets a page put its filters into the bar. Its default slot becomes a panel that slides out of the bar, and the bar gets a filter button with the `count` prop as its badge — titled by the bar's `textFilter`, which also heads the panel. The panel is `--actions-bar-filter-width` wide from `sm` up, and covers the screen next to the bar on phones. It renders nothing where it is placed, and takes the panel out of the bar when the page unmounts.

In the demo, the bar is fixed to the frame instead of the window. Click the filter button to slide out the panel.

<!-- @example ActionsBar/Basic client -->

<DocsDemo name="ActionsBar/Basic" client-only />

```vue
<template>
  <!--
    The bar is `position: fixed` to the window in an app. The transform makes this frame the box it is fixed to,
    and the variables are the ones an app sets on `body`.
  -->
  <div
    class="
      relative h-96 overflow-hidden rounded-xl border border-solid border-line-subtle transform-[translateZ(0)]
      [--actions-bar-filter-width:16rem] [--header-height:3.5rem] [--right-margin:0px] [--w-actions-bar-width:3.5rem]
    "
  >
    <div class="grid gap-2 p-4 pr-18">
      <span class="font-semibold">Plants</span>
      <span class="text-description text-sm">
        {{ onlyThirsty ? 'Thirsty plants only' : 'All plants' }}{{ light ? `, ${ light } light` : '' }}
      </span>
    </div>

    <WActionsBar
      text-filter="Filters"
      class="bg-surface shadow-md"
    >
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
      <div class="grid gap-4 px-4">
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
