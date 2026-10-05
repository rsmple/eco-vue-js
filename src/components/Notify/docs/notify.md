---
group: Overlays
description: Showing success, warning, error and in-progress notifications with Notify — title, caption, the user's input, a link and custom content, merged when repeated — and their history in the notify center with WNotifyCenter and WNotifyCenterButton.
---

# Notify

Notifications are shown from code, from anywhere — setup, a store, a query's error handler. `Notify.success`, `Notify.warn` and `Notify.error` add one to the `WNotify` container mounted once at the app root (see [Getting started](/guide/getting-started#global-containers)); before it is mounted, the calls do nothing.

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
| `userInput` | What the user typed or picked, shown after the caption and broken anywhere to fit — a file name, a search term. |
| `to` | A route; the notification links to it, titled with the route's `meta.title`. |
| `channel` | `NotifyChannel.ACTIVITY` (the default) or `NotifyChannel.ACTION` — see [Notify center](#notify-center). |
| `group` | Shows notifications with the same group `key` as one entry — see [Groups](#groups). |
| `key` | Shows it once: the same key again returns the notification already there, and nothing comes back after the user closed it. |
| `toast` | `false` adds it to the notify center without a toast. |
| `component`, `componentProps` | Content under the caption — see [Custom content](#custom-content). |
| `onRemove` | Called when the user closes it. |

A toast closes after 5 seconds. While the pointer is over the toasts, none of them close: their time stops and goes on from where it was once the pointer leaves. The same notification shown again within those 5 seconds doesn't stack: the one on screen stays, gets a counter, and its 5 seconds start over. Clicking the same failing button five times shows one error with a 5 on it.

Toasts show in the top right corner, under the header. `position` on `WNotify` moves them to `top-center`, `bottom-right` or `bottom-center`; at the bottom the newest toast is closest to the edge.

<NotifyPositionPlayground />

The kit shows notifications itself in a few places: copying and pasting, invalid form values when leaving a tab or submitting a form, a `validate` error in `WToggle`, and failed requests made through its API helpers.

## Progress

`Notify.process` shows something in progress with a spinner. Every call returns the notification's id — or `undefined` before `WNotify` is mounted — and `Notify.update` changes it later: once it gets another type, its toast shows again with the result. `Notify.remove` takes it away without calling `onRemove`.

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
import {NotifyType} from 'eco-vue-js/dist/components/Notify/models/NotifyType'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
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

A pending notification can't be closed in the notify center; closing its toast only hides the toast.

## Notify center

Every notification is also kept in a history of the last 50, shown by `WNotifyCenter`. `WNotifyCenterButton` is a bell for the [actions bar](/guide/app-shell) that opens it as a dropdown — a bottom sheet on phones. It counts the notifications that need action and runs a shimmer while any is pending. Toasts are hidden while the center is open.

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
import {closeNotifyCenter} from 'eco-vue-js/dist/components/Notify/models/notifyCenter'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WActionsBar from 'eco-vue-js/dist/components/ActionsBar/WActionsBar.vue'
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WNotifyCenterButton from 'eco-vue-js/dist/components/Notify/WNotifyCenterButton.vue'
</script>
```

For a trigger of your own, such as the bell in this site's header, open it with `useNotifyCenter`, called in setup. It returns `isOpen`, `open(anchor)`, `close` and `toggle(anchor)`, and takes the center's props and footer:

```ts
import {useNotifyCenter} from 'eco-vue-js/dist/components/Notify/use/useNotifyCenter'

const {isOpen, toggle} = useNotifyCenter({props: () => ({title: 'Alerts'})})
```

`WNotifyCenter` can also be placed on a page as it is. Notifications on the `ACTION` channel need the user: they are pinned on top under their own heading, their toast stays until closed, and clearing the history keeps them — as it keeps pending ones.

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
import {NotifyChannel} from 'eco-vue-js/dist/components/Notify/models/NotifyType'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
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

Notifications with the same `group.key` show as one entry while there are two or more of them — in a toast and in the center — with the group's `title` and `caption`, the most severe type of its members, and a list of them to expand, newest first. A member is never merged into a repeat of itself — every one adds to the list, and the group's toast stays up for 5 seconds after its latest member. Closing the entry closes each member, or calls the group's `onRemoveItems` with all of them at once. A group's `component` gets its `items` along with `componentProps`.

## Custom content

`component` renders under the caption with `componentProps`, such as the progress of a background operation. It may emit `update` with new fields — `title`, `caption`, `type`, `channel` or `group` — and `remove` to take the notification away; type its emits with `NotifyContentEmits`. In a group's list it gets `compact`.

The toast and the center each render their own copy, so keep the state outside the component — in a query or a reactive object — rather than in it.

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
| `position` | `NotifyPosition` | `"top-right"` | Corner or edge of the screen the toasts show in. On top they sit under the header (`--header-height`); new toasts stack away from the edge. |

<!-- @api-end -->

<!-- @api WNotifyCenter -->

### WNotifyCenter

```ts
import WNotifyCenter from 'eco-vue-js/dist/components/Notify/WNotifyCenter.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Heading of the notify center. Defaults to `Notifications`. |
| `clearText` | `string` | — | Text of the button that clears the history. Defaults to `Clear`. |
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
| `clearText` | `string` | — | Text of the button that clears the history. Defaults to `Clear`. |
| `emptyText` | `string` | — | Shown when there are no notifications. Defaults to `No notifications yet`. |
| `actionText` | `string` | — | Heading of the notifications that need action (`NotifyChannel.ACTION`). Defaults to `Action required`. |
| `activityText` | `string` | — | Heading of the rest of the history, shown under the ones that need action. Defaults to `Activity`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `footer` | — | Footer of the notify center. Close the center from it with `closeNotifyCenter`. |

<!-- @api-end -->
