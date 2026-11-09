<template>
  <div class="docs-api">
    <div class="docs-api-header">
      <div
        role="tablist"
        class="docs-api-tabs"
        :aria-label="`${ name } API`"
      >
        <button
          v-for="tab in tabs"
          :id="`${ id }-${ tab.key }`"
          :key="tab.key"
          type="button"
          role="tab"
          class="docs-api-tab"
          :class="{'docs-api-tab-active': tab.key === activeTab.key}"
          :aria-selected="tab.key === activeTab.key"
          :aria-controls="`${ id }-${ tab.key }-panel`"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
          <span class="docs-api-count">{{ tabCount(tab) }}</span>
        </button>
      </div>

      <WInput
        v-model="query"
        type="search"
        placeholder="Filter…"
        :icon="markRaw(IconSearch)"
        allow-clear
        no-margin
        class="docs-api-filter vp-raw"
      />
    </div>

    <div
      v-if="activeTab.groups.length > 1"
      class="docs-api-groups"
    >
      <button
        v-for="(group, index) in activeTab.groups"
        :key="index"
        type="button"
        class="docs-api-group"
        :class="{'docs-api-group-active': index === activeGroup}"
        :aria-pressed="index === activeGroup"
        :title="group.source ? `Inherited from ${ group.source }` : undefined"
        @click="selectGroup(index)"
      >
        {{ group.label }}
        <span class="docs-api-count">{{ groupCount(activeTab, index) }}</span>
      </button>
    </div>

    <div
      :id="`${ id }-${ activeTab.key }-panel`"
      ref="panel"
      role="tabpanel"
      class="docs-api-panel"
      :style="filterMinHeight ? {minHeight: `${ filterMinHeight }px`} : undefined"
      :aria-labelledby="`${ id }-${ activeTab.key }`"
    >
      <template
        v-for="tab in tabs"
        :key="tab.key"
      >
        <div
          v-for="(group, index) in tab.groups"
          v-show="isGroupShown(tab, index)"
          :key="index"
          :ref="element => setGroupElement(`${ tab.key }-${ index }`, element)"
          class="docs-api-group-content"
        >
          <p
            v-if="group.source"
            class="docs-api-source"
          >
            Inherited from <code>{{ group.source }}</code>
          </p>

          <slot :name="`${ tab.key }-${ index }`" />
        </div>
      </template>

      <p
        v-if="filtering && !groupCount(activeTab, activeGroup)"
        class="docs-api-empty"
      >
        Nothing in {{ activeTab.groups.length > 1 ? activeTab.groups[activeGroup].label : activeTab.label }} matches “{{ query }}”.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ApiTab} from '../../markdownApi'

import {computed, markRaw, onMounted, ref, shallowRef, useId, useTemplateRef, watch} from 'vue'

import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

const props = defineProps<{
  /** The component the tables document. */
  name: string
  /** Tabs and their groups, in the order of the slots `<tab>-<group>` that hold each group's table. */
  tabs: ApiTab[]
}>()

const id = useId()
const panelRef = useTemplateRef('panel')

const activeTabKey = ref(props.tabs[0]?.key)
const activeGroup = ref(0)
const query = ref<string | undefined>('')

const activeTab = computed(() => props.tabs.find(tab => tab.key === activeTabKey.value) ?? props.tabs[0])

const selectTab = (key: string) => {
  activeTabKey.value = key
  activeGroup.value = 0
  panelRef.value?.scrollTo({top: 0})
}

/** `update:model-value`, `modelValue` and `model value` all match one another. */
const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]+/g, '')

const needle = computed(() => normalize(query.value ?? ''))
const filtering = computed(() => needle.value.length > 0)

type Row = {element: HTMLElement, text: string}

/** Each group's table rows, read once the slots render: the tables are Markdown, so the rows are only in the DOM. */
const rows = shallowRef(new Map<string, Row[]>())

const groupElements = new Map<string, HTMLElement>()

const setGroupElement = (key: string, element: unknown) => {
  if (element instanceof HTMLElement) groupElements.set(key, element)
}

onMounted(() => {
  const map = new Map<string, Row[]>()

  for (const [key, group] of groupElements) {
    map.set(key, [...group.querySelectorAll<HTMLTableRowElement>('tbody tr')].map(element => ({
      element,
      text: normalize(element.textContent ?? ''),
    })))
  }

  rows.value = map
})

/** The whole row, not only the name: `error` also finds the props whose description is about errors. */
const matches = (row: Row) => row.text.includes(needle.value)

const matchCount = (key: string) => rows.value.get(key)?.filter(matches).length ?? 0

const groupCount = (tab: ApiTab, index: number) => filtering.value ? matchCount(`${ tab.key }-${ index }`) : tab.groups[index].count

const tabCount = (tab: ApiTab) => tab.groups.reduce((sum, _, index) => sum + groupCount(tab, index), 0)

const isGroupShown = (tab: ApiTab, index: number) => tab.key === activeTab.value.key && index === activeGroup.value

const selectGroup = (index: number) => {
  activeGroup.value = index
  panelRef.value?.scrollTo({top: 0})
}

/** Caps how far the box shrinks while filtering: to its height when the filter started, at most `FILTER_MIN_HEIGHT`. */
const FILTER_MIN_HEIGHT = 320

const filterMinHeight = ref<number>()

watch(filtering, value => {
  filterMinHeight.value = value ? Math.min(panelRef.value?.offsetHeight ?? 0, FILTER_MIN_HEIGHT) : undefined
}, {flush: 'sync'})

watch(needle, value => {
  for (const list of rows.value.values()) {
    for (const row of list) row.element.hidden = value ? !matches(row) : false
  }

  // Stay on the group, unless it has nothing left and another has: one of its tab first, then of another tab.
  if (value && !groupCount(activeTab.value, activeGroup.value)) {
    const sameTab = activeTab.value.groups.findIndex((_, index) => groupCount(activeTab.value, index))

    if (sameTab !== -1) {
      activeGroup.value = sameTab
    } else {
      const next = props.tabs.find(tab => tabCount(tab))

      if (next) {
        activeTabKey.value = next.key
        activeGroup.value = next.groups.findIndex((_, index) => groupCount(next, index))
      }
    }
  }

  panelRef.value?.scrollTo({top: 0})
})
</script>
