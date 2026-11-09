---
group: Overlays
description: Showing success, warning, error and in-progress notifications with Notify — title, caption, the user's input, a link and custom content, merged when repeated — and their history in the notify center with WNotifyCenter and WNotifyCenterButton.
---

# Notify

Notifications are shown from code anywhere — setup, a store, a query error handler. `Notify.success`, `Notify.warn` and `Notify.error` add one to the `WNotify` container at the app root (see [Getting started](/guide/getting-started#global-containers)); before it mounts, calls do nothing.

<!-- @example Notify/Basic -->

<DocsDemo name="Notify/Basic" />

```vue
<template>
  <div class="flex flex-wrap gap-4">
    <WButton
      :semantic-type="SemanticType.POSITIVE"
      @click="Notify.success({title: 'Project saved'})"
    >
      Success
    </WButton>

    <WButton
      :semantic-type="SemanticType.WARNING"
      @click="Notify.warn({title: 'Form contains invalid values', caption: 'Name is required.'})"
    >
      Warning
    </WButton>

    <WButton
      :semantic-type="SemanticType.NEGATIVE"
      @click="Notify.error({title: 'Upload failed', caption: 'The file is larger than 10 MB.', userInput: 'annual-report-final-v2.pdf'})"
    >
      Error
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
</script>
```

<!-- @example-end -->

Each call takes:

| Field | What it is |
| --- | --- |
| `title` | The message, as a string or a VNode. |
| `caption` | A second line with details. |
| `userInput` | What the user typed or picked (a file name, a search term), shown after the caption and wrapped anywhere. |
| `to` | A route to link to, titled with its `meta.title`. |
| `channel` | `NotifyChannel.ACTIVITY` (the default) or `NotifyChannel.ACTION` — see [Notify center](#notify-center). |
| `group` | Merges notifications with the same group `key` into one entry — see [Groups](#groups). |
| `key` | Shows it once: the same key returns the existing notification, and nothing reappears after the user closes it. |
| `toast` | `false` adds it to the notify center only. |
| `component`, `componentProps` | Content under the caption — see [Custom content](#custom-content). |
| `onRemove` | Called when the user closes it. |

Toasts close after 5 seconds unless in progress or needing action; hovering pauses all timers. A repeat within 5 seconds doesn't stack — the existing toast gets a counter and restarts its timer.

Toasts show top-right under the header. `position` on `WNotify` sets `top-center`, `bottom-right` or `bottom-center` (newest nearest the edge). On phones they always show at the top, since the bottom holds modal, sheet and page buttons.

<NotifyPositionPlayground />

The kit notifies on its own for copy/paste, invalid form values on tab change or submit, `validate` errors in `WToggle`, and failed requests through its API helpers.

## Progress

`Notify.process` shows a spinner. Every call returns the notification id (`undefined` before `WNotify` mounts); `Notify.update` changes it later. The toast stays until then; once its type changes it reappears with the result (even if closed) and closes after 5 seconds. `Notify.remove` removes it without calling `onRemove`.

<!-- @example Notify/Process -->

<DocsDemo name="Notify/Process" />

```vue
<template>
  <WButton
    :semantic-type="SemanticType.PRIMARY"
    @click="water"
  >
    Water the greenhouse
  </WButton>
</template>

<script lang="ts" setup>
import {Notify, NotifyType} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const water = () => {
  const id = Notify.process({title: 'Watering 12 plants', caption: 'Greenhouse A'})

  if (id === undefined) return

  setTimeout(() => Notify.update(id, {type: NotifyType.SUCCESS, title: '12 plants watered'}), 3000)
}
</script>
```

<!-- @example-end -->

A pending notification can't be closed in the center; closing its toast only hides the toast.

## Notify center

`WNotifyCenter` shows a history of the last 50. `WNotifyCenterButton` is a bell for the [actions bar](/guide/app-shell) that opens it as a dropdown (a bottom sheet on phones), counts notifications needing action and shimmers while any is pending. Toasts hide while the center is open. It opens under the button with a tip; `horizontal-align` changes that — `HorizontalAlign.LEFT_INNER` for a bell at the header's right end (grows left, no tip), `HorizontalAlign.LEFT_CENTER` for a side rail (opens beside with a tip; only the box shifts near screen edges).

```vue
<template>
  <WActionsBar>
    <WNotifyCenterButton>
      <template #footer>
        <WButton
          :to="{name: 'operations'}"
          :semantic-type="SemanticType.SECONDARY"
          @click="closeNotifyCenter"
        >
          All operations
        </WButton>
      </template>
    </WNotifyCenterButton>
  </WActionsBar>
</template>

<script lang="ts" setup>
import {closeNotifyCenter} from 'eco-vue-js/dist/utils/NotifyCenter'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WActionsBar from 'eco-vue-js/dist/components/ActionsBar/WActionsBar.vue'
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WNotifyCenterButton from 'eco-vue-js/dist/components/Notify/WNotifyCenterButton.vue'
</script>
```

For a custom trigger, like this site's header bell, use `useNotifyCenter` in setup. It returns `isOpen`, `open(anchor)`, `close` and `toggle(anchor)`, and takes the center's props, footer and `horizontalAlign`:

```ts
import {HorizontalAlign} from 'eco-vue-js/dist/utils/HorizontalAlign'
import {useNotifyCenter} from 'eco-vue-js/dist/utils/NotifyCenter'

const {isOpen, toggle} = useNotifyCenter({
  props: () => ({title: 'Alerts'}),
  horizontalAlign: () => HorizontalAlign.LEFT_INNER,
})
```

`WNotifyCenter` can also sit directly on a page. `ACTION` notifications are pinned on top under their own heading, their toasts stay until closed, and Clear keeps them (as it keeps pending ones). Clear sits beside the activity heading; with `onDismissActions`, Dismiss all sits beside the action heading — it passes them all at once (e.g. to dismiss server-side in one request) and removes them on resolve, without each `onRemove`.

<!-- @example Notify/Center -->

<DocsDemo name="Notify/Center" />

```vue
<template>
  <div class="grid items-start gap-4 sm:grid-cols-[auto_1fr]">
    <div class="flex flex-wrap gap-2 sm:flex-col">
      <WButton
        :semantic-type="SemanticType.POSITIVE"
        @click="Notify.success({title: 'Repotted', caption: 'The monstera moved to a 30 cm pot.'})"
      >
        Activity
      </WButton>

      <WButton
        :semantic-type="SemanticType.NEGATIVE"
        @click="Notify.error({title: 'Sensor offline', caption: 'The greenhouse probe stopped reporting.', channel: NotifyChannel.ACTION})"
      >
        Needs action
      </WButton>

      <WButton
        :semantic-type="SemanticType.WARNING"
        @click="checkSoil"
      >
        Group
      </WButton>
    </div>

    <WNotifyCenter />
  </div>
</template>

<script lang="ts" setup>
import {Notify, NotifyChannel} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WNotifyCenter from 'eco-vue-js/dist/components/Notify/WNotifyCenter.vue'

const DRY_SOIL_GROUP = {key: 'dry-soil', title: 'Soil is dry', caption: 'These beds need water.'}

const checkSoil = () => {
  ['Bed 1', 'Bed 4', 'Bed 7'].forEach(bed => {
    Notify.warn({title: 'Soil is dry', caption: bed, group: DRY_SOIL_GROUP})
  })
}
</script>
```

<!-- @example-end -->

### Groups

Notifications sharing `group.key` show as one entry once there are two or more — toast and center — with the group's `title` and `caption`, the most severe member type, and an expandable list, newest first. Members never merge as repeats; each joins the list, and the group's toast stays 5 seconds after the latest. Closing the entry closes each member, or calls `onRemoveItems` with all of them. A group's `component` gets `items` with `componentProps`.

## Custom content

`component` renders under the caption with `componentProps`, e.g. a background job's progress. It may emit `update` with new `title`, `caption`, `type`, `channel` or `group`, and `remove`; type emits with `NotifyContentEmits` from `eco-vue-js/dist/utils/Notify`. In a group's list it gets `compact`.

Toast and center render separate copies, so keep state outside the component (a query or reactive object).

<!-- @example Notify/Content -->

<DocsDemo name="Notify/Content" />

```vue
<template>
  <WButton
    :semantic-type="SemanticType.PRIMARY"
    @click="repot"
  >
    Repot the seedlings
  </WButton>
</template>

<script lang="ts" setup>
import {reactive} from 'vue'

import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

import NotifyRepotProgress from './parts/NotifyRepotProgress.vue'

const repot = () => {
  const task = reactive({done: 0, total: 8})

  Notify.process({title: 'Repotting seedlings', component: NotifyRepotProgress, componentProps: {task}})

  const interval = setInterval(() => {
    task.done++

    if (task.done === task.total) clearInterval(interval)
  }, 500)
}
</script>
```

<!-- @example-end -->

## API

<!-- @api WNotify -->

### WNotify

```ts
import WNotify from 'eco-vue-js/dist/components/Notify/WNotify.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `NotifyPosition` | `"top-right"` | Corner or edge of the screen the toasts show in. On top they sit under the header (`--header-height`); new toasts stack away from the edge. On phones they always show at the top edge, over the header or a modal's title, clear of the buttons at the bottom and the fields under the header. |

<!-- @api-end -->

<!-- @api WNotifyCenter -->

### WNotifyCenter

```ts
import WNotifyCenter from 'eco-vue-js/dist/components/Notify/WNotifyCenter.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `onDismissActions` | `((items: NotifyItem[]) => unknown)` | — | Shows a button beside the heading of the notifications that need action that hands them all to this function — such as to dismiss them on the server in one request — and removes them once it resolves, without calling their `onRemove`. A rejection keeps them. |
| `title` | `string` | — | Heading of the notify center. Defaults to `Notifications`. |
| `clearText` | `string` | — | Text of the button beside the activity heading that clears it. Defaults to `Clear`. |
| `dismissActionsText` | `string` | — | Text of the button that dismisses the notifications that need action, shown with `onDismissActions`. Defaults to `Dismiss all`. |
| `emptyText` | `string` | — | Shown when there are no notifications. Defaults to `No notifications yet`. |
| `actionText` | `string` | — | Heading of the notifications that need action (`NotifyChannel.ACTION`). Defaults to `Action required`. |
| `activityText` | `string` | — | Heading of the rest of the history, shown under the ones that need action. Defaults to `Activity`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `footer` | — | Under the list, such as a link to a page with every operation. Close the center from it with `closeNotifyCenter`. |

<!-- @api-end -->

<!-- @api WNotifyCenterButton -->

### WNotifyCenterButton

```ts
import WNotifyCenterButton from 'eco-vue-js/dist/components/Notify/WNotifyCenterButton.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Tooltip of the button and heading of the notify center. Defaults to `Notifications`. |
| `icon` | `SVGComponent` | — | Icon of the button. Defaults to a bell. |
| `horizontalAlign` | `HorizontalAlign` | — | Aligns the notify center to the button — such as `HorizontalAlign.LEFT_INNER` to grow left from its right edge, without a tip, or `HorizontalAlign.LEFT_CENTER` beside it with a tip, for a button in a side rail. Defaults to centered under the button with a tip. |
| `onDismissActions` | `((items: NotifyItem[]) => unknown)` | — | Shows a button beside the heading of the notifications that need action that hands them all to this function — such as to dismiss them on the server in one request — and removes them once it resolves, without calling their `onRemove`. A rejection keeps them. |
| `clearText` | `string` | — | Text of the button beside the activity heading that clears it. Defaults to `Clear`. |
| `dismissActionsText` | `string` | — | Text of the button that dismisses the notifications that need action, shown with `onDismissActions`. Defaults to `Dismiss all`. |
| `emptyText` | `string` | — | Shown when there are no notifications. Defaults to `No notifications yet`. |
| `actionText` | `string` | — | Heading of the notifications that need action (`NotifyChannel.ACTION`). Defaults to `Action required`. |
| `activityText` | `string` | — | Heading of the rest of the history, shown under the ones that need action. Defaults to `Activity`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `footer` | — | Footer of the notify center. Close the center from it with `closeNotifyCenter`. |

<!-- @api-end -->
