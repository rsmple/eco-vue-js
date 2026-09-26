<template>
  <WNavBar @update:is-open="$emit('update:isOpen', $event)">
    <div class="w-nav-bar-width no-scrollbar flex h-full flex-col overflow-y-auto overscroll-contain">
      <WNavItemTransition class="mb-auto pb-4">
        <WNavItemExpand
          v-for="group in groups"
          :key="group.text"
          :title="group.text"
          :icon="group.icon"
          :query-fields="[]"
        >
          <WNavItem
            v-for="item in group.items"
            :key="item.link"
            :to="item.link"
            :title="item.text"
            :query-fields="[]"
          />
        </WNavItemExpand>
      </WNavItemTransition>
    </div>
  </WNavBar>
</template>

<script lang="ts" setup>
import type {Group} from '../../sidebar'

import {type DefaultTheme, useData} from 'vitepress'
import {computed, markRaw} from 'vue'

import WNavBar from 'eco-vue-js/dist/components/Nav/WNavBar.vue'
import WNavItem from 'eco-vue-js/dist/components/Nav/WNavItem.vue'
import WNavItemExpand from 'eco-vue-js/dist/components/Nav/WNavItemExpand.vue'
import WNavItemTransition from 'eco-vue-js/dist/components/Nav/WNavItemTransition.vue'

import IconElement from 'eco-vue-js/dist/assets/icons/IconElement'
import IconGrid from 'eco-vue-js/dist/assets/icons/IconGrid'
import IconLayer from 'eco-vue-js/dist/assets/icons/IconLayer'
import IconNote from 'eco-vue-js/dist/assets/icons/IconNote'
import IconSettings from 'eco-vue-js/dist/assets/icons/IconSettings'

const ICONS: Record<Group, SVGComponent> = {
  Guide: markRaw(IconNote),
  Actions: markRaw(IconElement),
  Controls: markRaw(IconSettings),
  Assets: markRaw(IconGrid),
  Recipes: markRaw(IconLayer),
}

defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const {theme} = useData<DefaultTheme.Config>()

const groups = computed(() => (theme.value.sidebar as DefaultTheme.SidebarItem[]).map(group => ({
  text: group.text ?? '',
  icon: ICONS[group.text as Group],
  items: (group.items ?? []).filter((item): item is {text: string, link: string} => !!item.text && !!item.link),
})))
</script>
