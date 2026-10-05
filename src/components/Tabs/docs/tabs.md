---
group: Controls
description: WTabs and WTabsItem — tabbed content with icons, counters and disabled tabs, closable and added tabs, a side layout, and status marks for forms.
---

# Tabs

`WTabs` takes `WTabsItem` children and renders a header of tab buttons above the active tab's content. Each item needs a unique `name`; `title`, `icon` and `count` go on its button. The first tab opens unless `initTab`, `initTabIndex` or an item's `init` says otherwise.

<!-- @example Tabs/Basic overflowHidden -->

<DocsDemo name="Tabs/Basic" overflowHidden />

```vue
<template>
  <WTabs
    :init-tab="current"
    @update:current="current = $event"
  >
    <WTabsItem
      name="profile"
      title="Profile"
      :icon="markRaw(IconUser)"
    >
      <p>Name, avatar and contact details.</p>
    </WTabsItem>

    <WTabsItem
      name="security"
      title="Security"
      :icon="markRaw(IconLock)"
    >
      <p>Password, two-factor authentication and active sessions.</p>
      <p>Tabs keep the height of the tallest one opened so far, so the page below doesn't jump.</p>
    </WTabsItem>

    <WTabsItem
      name="notifications"
      title="Notifications"
      :icon="markRaw(IconAlarm)"
      :count="3"
    >
      <p>Three unread notifications.</p>
    </WTabsItem>

    <WTabsItem
      name="billing"
      title="Billing"
      disabled
    >
      <p>Not available on the free plan.</p>
    </WTabsItem>
  </WTabs>

  <p class="text-description mt-4 text-sm">
    Current tab: {{ current }}
  </p>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

import IconAlarm from 'eco-vue-js/dist/assets/icons/IconAlarm'
import IconLock from 'eco-vue-js/dist/assets/icons/IconLock'
import IconUser from 'eco-vue-js/dist/assets/icons/IconUser'

const current = ref('security')
</script>
```

<!-- @example-end -->

Switching slides the content in from the side of the new tab, and the content area keeps the height of the tallest tab opened so far, so what's below it doesn't jump — `disableMinHeight` turns that off, `lessTransitions` fades instead of sliding.

The slide moves content its full width plus `--inner-margin` past the edge of the tabs, and WTabs doesn't clip it: the container decides where it shows. Spanning the page, the content slides in from the screen edge. Inside a card, a modal or a column, give the container `overflow-x-clip` — unlike `overflow-hidden`, it keeps sticky elements inside working. A header wider than its space scrolls sideways and keeps the active tab in view.

`update:current` and `update:current-index` emit the active tab, and `update:current-title` its title — for putting it in a page header when the tabs' own header is hidden with `noHeader`. To switch from code, call `updateCurrent(name)` or `updateIndex(index)` on a template ref. The first `update:current` comes during setup, so when the parent shows the current tab, seed it and pass it as `initTab`, as the demo does — otherwise a server-rendered page shows a different value than the first client render.

## Closable and added tabs

A tab with a `close` listener gets a close button. Children that aren't `WTabsItem` render in the header after the tab buttons, which is where an add button goes; `switchToNew` opens a tab as soon as it is added. When the active tab is removed, the one before it opens.

<!-- @example Tabs/Closable overflowHidden -->

<DocsDemo name="Tabs/Closable" overflowHidden />

```vue
<template>
  <WTabs switch-to-new>
    <WTabsItem
      v-for="tab in tabs"
      :key="tab.id"
      :name="String(tab.id)"
      :title="tab.title"
      v-bind="tabs.length > 1 ? {onClose: () => remove(tab.id)} : {}"
    >
      <p>Contents of {{ tab.title }}.</p>
    </WTabsItem>

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      class="ml-2 self-center"
      @click="add"
    >
      <IconAdd class="square-4" />
    </WButton>
  </WTabs>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'

let nextId = 3

const tabs = ref([
  {id: 1, title: 'Query 1'},
  {id: 2, title: 'Query 2'},
])

const add = () => {
  tabs.value.push({id: nextId, title: `Query ${ nextId }`})
  nextId++
}

const remove = (id: number) => {
  tabs.value = tabs.value.filter(tab => tab.id !== id)
}
</script>
```

<!-- @example-end -->

## Side layout

`side` puts the tab buttons in a column to the left of the content, `w-tabs-side-width-*` sets the column's maximum width. On phones the column and the content become two full-width screens side by side, and picking a tab scrolls to its content.

<!-- @example Tabs/Side -->

<DocsDemo name="Tabs/Side" />

```vue
<template>
  <WTabs
    side
    class="w-tabs-side-width-48"
  >
    <WTabsItem
      name="general"
      title="General"
      :icon="markRaw(IconSettings)"
    >
      <p>Workspace name, language and time zone.</p>
    </WTabsItem>

    <WTabsItem
      name="members"
      title="Members"
      :icon="markRaw(IconUser)"
      :count="12"
    >
      <p>Twelve members, two of them admins.</p>
    </WTabsItem>

    <WTabsItem
      name="integrations"
      title="Integrations"
      :icon="markRaw(IconLink)"
    >
      <p>Connected services and API tokens.</p>
    </WTabsItem>
  </WTabs>
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

import IconLink from 'eco-vue-js/dist/assets/icons/IconLink'
import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'
import IconUser from 'eco-vue-js/dist/assets/icons/IconUser'
</script>
```

<!-- @example-end -->

`WButtonTab` is the tab button on its own, for a button among the tab buttons that isn't a tab — such as "New chat" at the top of a side column of chats. With `side` it lines up with the side column's buttons; `title`, `icon` and `count` show as on a tab, and it emits `click`.

`WTabsColumns` shows its `WTabsItem` items as tabs on phones and as columns side by side from `sm` up, e.g. for the two halves of a form in a modal.

## Tabs in forms

An item's `hasError`, `hasChanges` and `hasValue` mark its button — `statusIcon` shows them as icons, `showHasValue` marks tabs with a value. When a tab gets an error while another is open, the tabs switch to it; `noSwitchOnInvalid` turns that off. Inside a Uniform form the tab items pick these states up from their fields on their own.

`stepper` turns the tabs into steps: the tabs after the first one with `hasValue` set to `false` are disabled, and `next()`, `previous()` and `jump(name)` on a template ref move between steps. Before `next()` and `jump(name)` leave a step, `validate` on its item runs, then the Uniform fields inside it are checked: invalid fields show their errors, a warning lists them, and the step stays open. `update:progress`, `update:first` and `update:last` emit where the stepper is, for the buttons around it.

## API

<!-- @api WTabs -->

### WTabs

```ts
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `customSlots` | `VNode[]` | — | Tab items rendered instead of the `default` slot. |
| `lessTransitions` | `boolean` | — | Fades between tabs instead of sliding. |
| `initTab` | `string` | — | Name of the tab opened first. |
| `initTabIndex` | `number` | — | Index of the tab opened first, when `initTab` is not set. |
| `side` | `boolean` | — | Puts the tab buttons in a column beside the content. On small screens the buttons and the content become two swipeable screens, and picking a tab scrolls to its content. |
| `disableMinHeight` | `boolean` | — | Lets the content shrink to the current tab's height. By default it keeps the height of the tallest tab shown so far. |
| `noHeader` | `boolean` | — | Hides the tab buttons. Switch tabs through the exposed methods. |
| `headerClass` | `string` | — | Classes for the row of tab buttons. |
| `switchToNew` | `boolean` | — | Switches to a tab when it is added. |
| `stepper` | `boolean` | — | Numbers the tab titles and disables every tab after the first one with `hasValue` false. The exposed `next` and `jump` check the Uniform fields of the tab they leave and stay on it if one is invalid. Enables `update:progress`, `update:first` and `update:last`. |
| `showHasValue` | `boolean` | — | Colors the titles of tabs that have a value. |
| `noSwitchOnInvalid` | `boolean` | — | Stays on the current tab when another one gets an error. By default the first tab with an error is opened. |
| `wrap` | `boolean` | — | Wraps the tab buttons onto new lines instead of scrolling sideways. |
| `statusIcon` | `boolean` | — | Shows a value and error status icon next to each title. |
| `flat` | `boolean` | — | Renders all tabs one after another, each under its title, without the buttons. |
| `indicator` | `boolean` | — | Shows a large status circle on each tab button — error, has value or empty. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:current` | `(value: string)` | Name of the open tab. Also emitted on mount. |
| `update:current-index` | `(value: number)` | Index of the open tab. Also emitted on mount. |
| `update:has-changes` | `(value: boolean)` | Whether any tab has unsaved changes. |
| `update:current-title` | `(value: string \| undefined)` | Title of the open tab, also when the title itself changes. |
| `update:tabs-length` | `(value: number)` | Number of tabs. Also emitted on mount. |
| `update:progress` | `(value: number)` | With `stepper`, the share of steps reached, in percent. |
| `update:first` | `(value: boolean)` | With `stepper`, whether the first tab is open. |
| `update:last` | `(value: boolean)` | With `stepper`, whether the last tab is open. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | WTabsItem elements. Anything else is rendered among the tab buttons. |

<!-- @api-end -->

<!-- @api WTabsItem -->

### WTabsItem

```ts
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Title of the tab button. The `title` slot replaces it. |
| `name` | `string` | **required** | Unique key of the tab, used by `initTab`, `update:current` and the exposed methods. |
| `icon` | `SVGComponent` | — | Icon before the title. |
| `disabled` | `boolean` | — | Disables the tab button. |
| `removable` | `boolean` | — | Unmounts the content while the tab is not open, instead of hiding it. |
| `init` | `boolean` | — | Opens this tab first, when WTabs has no `initTab` or `initTabIndex`. |
| `hasValue` | `boolean \| null` | — | Marks the tab as filled in. By default it is read from the forms inside the tab. |
| `hasError` | `boolean` | — | Marks the tab as invalid. By default it is read from the forms inside the tab. |
| `hasChanges` | `boolean` | — | Shows the unsaved changes dot. By default it is read from the forms inside the tab. |
| `validate` | `(() => string \| undefined)` | — | Checks the tab before the exposed `next` and `jump` leave it. A returned error message is shown as a warning and the tab stays open. |
| `requireSave` | `boolean` | — | Submits the enclosing stepper form before moving forward past this tab, and stays on it if the submit fails. |
| `count` | `number` | — | Number shown in brackets after the title. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | The close button was clicked. Listening to it adds the button to the tab. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the tab. |
| `title` | `StateScope` | Replaces the content of the tab button. |
| `suffix` | `StateScope` | Content after the title, inside the tab button. |
| `right` | `StateScope` | Content after the tab button. |

<!-- @api-end -->

<!-- @api WButtonTab -->

### WButtonTab

```ts
import WButtonTab from 'eco-vue-js/dist/components/Button/WButtonTab.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `boolean` | — | Marks the button as the open tab: primary text and an underline. |
| `hasError` | `boolean` | — | Colors the button red, over the other states. |
| `hasValue` | `boolean` | — | Marks the tab as filled in, for `showHasValue`, `statusIcon` and `indicator`. |
| `hasChanges` | `boolean` | — | Shows the unsaved changes dot. |
| `disabled` | `boolean` | — | Grays the button out and ignores clicks. |
| `icon` | `SVGComponent` | — | Icon before the title. |
| `title` | `string` | — | Text of the button. The `title` slot replaces it. |
| `indicator` | `boolean` | — | Shows a large status circle — error, has value or empty — before the title. |
| `side` | `boolean` | — | Aligns the title to the start, for a column of tab buttons. |
| `statusIcon` | `boolean` | — | Shows a value and error status icon after the title. |
| `showHasValue` | `boolean` | — | Colors the title green when `hasValue` is set and the tab isn't open. |
| `enableOverflow` | `boolean` | — | Scrolls a title that doesn't fit into view on hover. |
| `count` | `number` | — | Number shown in brackets after the title. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The button was clicked, unless it is disabled. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | `{ hasChanges?: boolean \| undefined; hasError?: boolean \| undefined; hasValue?: boolean \| undefined; }` | Content of the button, replacing the title, icon, count and status icon. |
| `suffix` | `{ hasChanges?: boolean \| undefined; hasError?: boolean \| undefined; hasValue?: boolean \| undefined; }` | Content after the title, such as a close button. |

<!-- @api-end -->

<!-- @api WTabsColumns -->

### WTabsColumns

```ts
import WTabsColumns from 'eco-vue-js/dist/components/Tabs/WTabsColumns.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | WTabsItem items: tabs on phones, and columns side by side from `sm` up. |

<!-- @api-end -->
