---
group: Controls
description: WTabs and WTabsItem — tabbed content with icons, counters and disabled tabs, closable and added tabs, a side layout, and status marks for forms.
---

# Tabs

`WTabs` takes `WTabsItem` children and renders a header of tab buttons above the active tab's content. Each item needs a unique `name`; `title`, `icon` and `count` go on its button. The first tab opens unless `initTab`, `initTabIndex` or an item's `init` says otherwise.

<!-- @example Tabs/Basic -->

<DocsDemo name="Tabs/Basic" />

```vue
<template>
  <WTabs @update:current="current = $event">
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

const current = ref<string>()
</script>
```

<!-- @example-end -->

Switching slides the content in from the side of the new tab, and the content area keeps the height of the tallest tab opened so far, so what's below it doesn't jump — `disableMinHeight` turns that off, `lessTransitions` fades instead of sliding. A header wider than its space scrolls sideways and keeps the active tab in view.

`update:current` and `update:current-index` emit the active tab, and `update:current-title` its title — for putting it in a page header when the tabs' own header is hidden with `noHeader`. To switch from code, call `updateCurrent(name)` or `updateIndex(index)` on a template ref.

## Closable and added tabs

A tab with a `close` listener gets a close button. Children that aren't `WTabsItem` render in the header after the tab buttons, which is where an add button goes; `switchToNew` opens a tab as soon as it is added. When the active tab is removed, the one before it opens.

<!-- @example Tabs/Closable -->

<DocsDemo name="Tabs/Closable" />

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

## Tabs in forms

An item's `hasError`, `hasChanges` and `hasValue` mark its button — `statusIcon` shows them as icons, `showHasValue` marks tabs with a value. When a tab gets an error while another is open, the tabs switch to it; `noSwitchOnInvalid` turns that off. Inside a Uniform form the tab items pick these states up from their fields on their own.

`stepper` turns the tabs into steps: the tabs after the first one with `hasValue` set to `false` are disabled, `validate` on an item runs before leaving it, and `next()`, `previous()` and `jump(name)` on a template ref move between steps. `update:progress`, `update:first` and `update:last` emit where the stepper is, for the buttons around it.

## API

<!-- @api WTabs -->

### WTabs

```ts
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `customSlots` | `VNode[]` | — | — |
| `lessTransitions` | `boolean` | — | — |
| `initTab` | `string` | — | — |
| `initTabIndex` | `number` | — | — |
| `side` | `boolean` | — | — |
| `disableMinHeight` | `boolean` | — | — |
| `noHeader` | `boolean` | — | — |
| `headerClass` | `string` | — | — |
| `switchToNew` | `boolean` | — | — |
| `stepper` | `boolean` | — | — |
| `showHasValue` | `boolean` | — | — |
| `noSwitchOnInvalid` | `boolean` | — | — |
| `wrap` | `boolean` | — | — |
| `statusIcon` | `boolean` | — | — |
| `flat` | `boolean` | — | — |
| `indicator` | `boolean` | — | — |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:current` | `(value: string)` | — |
| `update:current-index` | `(value: number)` | — |
| `update:has-changes` | `(value: boolean)` | — |
| `update:current-title` | `(value: string \| undefined)` | — |
| `update:tabs-length` | `(value: number)` | — |
| `update:progress` | `(value: number)` | — |
| `update:first` | `(value: boolean)` | — |
| `update:last` | `(value: boolean)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `any` | — |

<!-- @api-end -->

<!-- @api WTabsItem -->

### WTabsItem

```ts
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | — |
| `name` | `string` | **required** | — |
| `icon` | `SVGComponent` | — | — |
| `disabled` | `boolean` | — | — |
| `removable` | `boolean` | — | — |
| `divided` | `boolean` | — | — |
| `init` | `boolean` | — | — |
| `hasValue` | `boolean \| null` | — | — |
| `hasError` | `boolean` | — | — |
| `hasChanges` | `boolean` | — | — |
| `validate` | `(() => string \| undefined)` | — | — |
| `requireSave` | `boolean` | — | — |
| `count` | `number` | — | — |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `any` | — |
| `title` | `any` | — |
| `suffix` | `any` | — |
| `right` | `any` | — |

<!-- @api-end -->
