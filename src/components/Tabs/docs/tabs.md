---
group: Controls
description: WTabs and WTabsItem — tabbed content with icons, counters and disabled tabs, closable and added tabs, a side layout, and status marks for forms.
---

# Tabs

`WTabs` renders a header of tab buttons for its `WTabsItem` children above the active tab's content. Each item needs a unique `name`; `title`, `icon` and `count` (a badge) go on its button. `divider` draws a line under the buttons. The first tab opens unless `initTab`, `initTabIndex` or an item's `init` says otherwise.

<!-- @example Tabs/Basic overflowHidden -->

<DocsDemo name="Tabs/Basic" overflowHidden />

```vue
<template>
  <WTabs
    :init-tab="current"
    divider
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

Content slides in from the new tab's side, and the area keeps the tallest height seen so far so content below doesn't jump. `disableMinHeight` turns that off; `lessTransitions` fades instead.

The slide travels the full width plus `--inner-margin`, unclipped — the container decides visibility. On a full-width page it slides from the screen edge; inside a card, modal or column, give the container `overflow-x-clip` (unlike `overflow-hidden`, it keeps sticky children working). An overflowing header scrolls sideways, keeping the active tab in view.

`update:current` and `update:current-index` emit the active tab, `update:current-title` its title (e.g. for a page header when `noHeader` hides the tabs' own). Switch from code with `updateCurrent(name)` or `updateIndex(index)` on a template ref. The first `update:current` fires during setup, so if the parent displays the current tab, seed it and pass it as `initTab` — otherwise SSR and the first client render disagree.

## Tabs as routes

Give each `WTabsItem` a `to`: the tab whose location matches the current route's path (ignoring query and hash) opens. Buttons become links that replace the history entry (Back leaves the page) and open in a new tab on middle click. Any other link to a tab's location switches to it, and `updateCurrent` navigates. `initTab` applies only when no tab matches.

```vue
<WTabs>
  <WTabsItem name="findings" :to="{name: 'asset', params: {assetId, tab: 'findings'}}" />
  <WTabsItem name="settings" :to="{name: 'asset', params: {assetId, tab: 'settings'}}" />
</WTabs>
```

## Closable and added tabs

A tab with a `close` listener gets a close button. Non-`WTabsItem` children render in the header after the buttons — put an add button there; `switchToNew` opens added tabs. Removing the active tab opens the previous one.

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

`side` puts the buttons in a column left of the content; `w-tabs-side-width-*` caps its width. On phones, column and content become two full-width screens side by side, and picking a tab scrolls to its content.

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

`WButtonTab` is a standalone tab button for non-tab actions among the tabs, like "New chat" atop a side column. It aligns with `side` columns, shows `title`, `icon` and `count`, and emits `click`.

`WTabsColumns` shows its items as tabs on phones and side-by-side columns from `sm`, e.g. for a form's two halves in a modal.

## Tabs in forms

An item's `hasError`, `hasChanges` and `hasValue` mark its button; `statusIcon` shows them as icons, `showHasValue` marks tabs with a value. A tab that gets an error while another is open is switched to, unless `noSwitchOnInvalid`. Inside a Uniform form, items pick these states up from their fields.

`stepper` turns tabs into steps: tabs after the first with `hasValue` `false` are disabled, and `next()`, `previous()` and `jump(name)` move between them. Before `next()` or `jump(name)` leaves a step, its item's `validate` runs, then its Uniform fields: errors show, a warning lists them, and the step stays. `update:progress`, `update:first` and `update:last` report position for surrounding buttons.

`stepperControls` renders those buttons: Back (or on the first step in an overlay, Close — Cancel once changed) and Next (or submit on the last, labelled by `submitText`). `submitting` shows a spinner during `submit`; `disabledNext` disables it. Texts come from `setTexts` ([Getting started](/guide/getting-started#texts)). Submit validates the last step and submits the surrounding `api-method` form, or emits `submit`. In an overlay frame, or a WModalWrapper on a page, the step title, progress line and buttons move to the frame's title, subtitle and actions (a form's own title takes precedence). One stepper per frame: the first to mount takes it; others, like a stepper inside a step, keep their controls inline.

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
| `stepperControls` | `boolean` | — | With `stepper`, brings its own controls: the open step's title, a progress line, and Back, Next and submit buttons — Close on the first step in an overlay. In a frame, such as a modal or a page WModalWrapper, they go to its title, subtitle and actions, under a title of the form's own if there is one; the first stepper in the frame takes it. The submit checks the last step and submits the enclosing form with `api-method`, or emits `submit`. |
| `submitText` | `string` | — | Text of the submit button on the last step with `stepperControls`. Defaults to the `submit` text of `setTexts`. |
| `submitting` | `boolean` | — | With `stepperControls`, shows a spinner in the Next or submit button and disables Back and Close, such as while a submit on `submit` runs. A form with `api-method` around the stepper does it on its own. |
| `disabledNext` | `boolean` | — | With `stepperControls`, disables the Next or submit button, such as until something is picked on the step. |
| `showHasValue` | `boolean` | — | Colors the titles of tabs that have a value. |
| `noSwitchOnInvalid` | `boolean` | — | Stays on the current tab when another one gets an error. By default the first tab with an error is opened. |
| `wrap` | `boolean` | — | Wraps the tab buttons onto new lines instead of scrolling sideways. |
| `divider` | `boolean` | — | Draws a line under the row of tab buttons, which the open tab's underline covers. |
| `section` | `boolean` | — | The row of tab buttons is the top of a section on the page, and the open tab's section or page list joins it below. For tabs over the page's content, such as the lists of an item's page. Implies `divider`. |
| `statusIcon` | `boolean` | — | Shows a value and error status icon next to each title. |
| `flat` | `boolean` | — | Renders all tabs one after another without the buttons, each a section (WSection) under its title: a card of its own in a card theme, the groups of a settings page. Its sections stack as a page's do, with a line between them in flat. |
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
| `submit` | — | With `stepperControls`, the submit button was clicked on the last step and the step is valid. Not emitted inside a form with `api-method`, which is submitted instead. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | WTabsItem elements. Anything else is rendered among the tab buttons. |
| `content` | `{ current: string; }` | Content shared by all tabs, under the open tab's content, such as one list the tabs filter. It stays mounted when the tab changes, and with `section` a page list in it joins the frame as an open tab's list does. Tabs with only this give WTabsItem no content. |

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
| `count` | `number` | — | Number shown in a badge after the title, tinted while the tab is open. |
| `to` | `RouteLocationRaw` | — | Router location of the tab. The tab button becomes a link that replaces the history entry. While any tab has one, the route decides the open tab — the one whose location has the current route's path, whatever the query and hash — and the exposed methods navigate to the tab instead of opening it. |

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
| `count` | `number` | — | Number shown in a badge after the title, tinted while the tab is open. |
| `to` | `RouteLocationRaw` | — | Router location — renders a link that replaces the current history entry, unless `disabled`. |

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
