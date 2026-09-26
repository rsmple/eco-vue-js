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
