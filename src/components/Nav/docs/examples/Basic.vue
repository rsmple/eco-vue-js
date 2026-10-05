<template>
  <div class="grid max-w-xs gap-4">
    <WToggle
      v-model="showRecent"
      title="Show the recent page"
    />

    <div class="rounded-xl border border-solid border-line-subtle py-2">
      <WNavItemTransition>
        <WNavItemExpand
          title="Layout"
          :icon="markRaw(IconMenu)"
          :query-fields="[]"
          even
        >
          <WNavItem
            :to="{path: '/components/nav-bar'}"
            title="Nav bar"
            :icon="markRaw(IconList)"
            :query-fields="[]"
          />

          <WNavItem
            :to="{path: '/components/header-bar'}"
            title="Header bar"
            :icon="markRaw(IconHeading)"
            :count="2"
            :query-fields="[]"
          />

          <WNavItem
            :to="{path: '/components/actions-bar'}"
            title="Actions bar"
            :icon="markRaw(IconElement)"
            :counter="3"
            :query-fields="[]"
          />

          <WNavItem
            v-if="showRecent"
            :to="{path: '/components/report-pages'}"
            title="Report pages"
            :icon="markRaw(IconNote)"
            :query-fields="[]"
          />
        </WNavItemExpand>
      </WNavItemTransition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WNavItem from 'eco-vue-js/dist/components/Nav/WNavItem.vue'
import WNavItemExpand from 'eco-vue-js/dist/components/Nav/WNavItemExpand.vue'
import WNavItemTransition from 'eco-vue-js/dist/components/Nav/WNavItemTransition.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import IconElement from 'eco-vue-js/dist/assets/icons/IconElement'
import IconHeading from 'eco-vue-js/dist/assets/icons/IconHeading'
import IconList from 'eco-vue-js/dist/assets/icons/IconList'
import IconMenu from 'eco-vue-js/dist/assets/icons/IconMenu'
import IconNote from 'eco-vue-js/dist/assets/icons/IconNote'

const showRecent = ref(false)
</script>
