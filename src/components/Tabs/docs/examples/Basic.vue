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
