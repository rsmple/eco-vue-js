<template>
  <div
    ref="root"
    class="w-button-rounded-xl flex items-center gap-2 text-sm"
    :class="inToolbar ? 'max-w-full' : 'flex-wrap py-2'"
    :style="inToolbar && naturalWidth ? {width: `${ naturalWidth }px`} : undefined"
  >
    <div
      v-if="searchComponent"
      :class="inToolbar ? 'w-60 shrink-0' : 'min-w-52 max-w-full'"
    >
      <component
        :is="searchComponent[0].default"
        v-if="Array.isArray(searchComponent)"
        v-bind="searchComponent[1]"
        :scope="scope"
        :readonly="readonly"
        :global="true"
      />

      <component
        :is="searchComponent.default"
        v-else
        :scope="scope"
        :readonly="readonly"
        :global="true"
      />
    </div>

    <ListFilterLocalItem
      v-for="item in shownList"
      :key="item.id"
      :scope="scope"
      :item="item.item"
      :is-open="openId === item.id"
      :pinned="pinnedIds.includes(item.id)"
      :readonly="readonly"
      :class="{hidden: hiddenIds.includes(item.id)}"
      v-bind="{'data-filter-chip': ''}"
      @toggle="openId = openId === item.id ? null : item.id"
      @close="closeFilterItem(item)"
      @remove="removeFilterItem(item)"
    />

    <WDropdownAdaptive
      v-if="inToolbar"
      :is-open="isOverflowOpen"
      dialog
      @close="isOverflowOpen = false"
    >
      <template #toggle>
        <ListFilterChip
          :title="`${ hiddenList.length } more`"
          :icon="markRaw(IconFilter)"
          :values="undefined"
          :count="hiddenActiveCount"
          :is-open="isOverflowOpen"
          :remove-label="undefined"
          :class="{hidden: !hiddenList.length}"
          v-bind="{'data-filter-overflow': ''}"
          @toggle="isOverflowOpen = !isOverflowOpen"
        />
      </template>

      <template #header>
        <IconFilter class="square-[1.25em]" />

        <span>Filters</span>
      </template>

      <template #content>
        <div class="grid min-w-80 text-start font-normal">
          <ListFilterGlobalItem
            v-for="item in hiddenList"
            :key="item.id"
            :scope="scope"
            :item="item.item"
            :is-open="overflowOpenId === item.id"
            :disabled-filter-fields="disabledFilterFields"
            :readonly="readonly"
            @toggle="overflowOpenId = overflowOpenId === item.id ? null : item.id"
          />
        </div>
      </template>
    </WDropdownAdaptive>

    <ListFilterSelect
      v-if="!readonly && availableList.length"
      :filter="availableList"
      :query-params="scope.modelValue"
      @select="selected.push($event); openId = $event"
    />
  </div>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {computed, inject, markRaw, onBeforeUnmount, onMounted, onUpdated, provide, ref, useId, useTemplateRef} from 'vue'

import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'

import IconFilter from '@/assets/icons/IconFilter.svg?component'

import {BASE_ZINDEX_ACTIONS_BAR, wBaseZIndex} from '@/utils/utils.ts'

import ListFilterChip from './ListFilterChip.vue'
import ListFilterGlobalItem from './ListFilterGlobalItem.vue'
import ListFilterLocalItem from './ListFilterLocalItem.vue'
import * as ListFilterSearch from './ListFilterSearch.vue'
import ListFilterSelect from './ListFilterSelect.vue'

import {wListToolbar} from '../models/toolbar'
import {getMetaValue} from '../models/utils'

const props = defineProps<{
  scope: UniformScope<QueryParams>
  filter: FilterComponent<QueryParams>[] | undefined
  filterSearch: FilterComponent<QueryParams> | undefined
  pinned: FilterComponent<QueryParams>[]
  search: boolean
  disabledFilterFields: Array<keyof QueryParams>
  readonly: boolean
}>()

provide(wBaseZIndex, inject(wBaseZIndex, 0) + BASE_ZINDEX_ACTIONS_BAR)

const inToolbar = inject(wListToolbar, false)

const searchComponent: FilterComponent<QueryParams> | undefined = props.search ? props.filterSearch ?? ListFilterSearch : undefined

const getModule = (item: FilterComponent<QueryParams>) => Array.isArray(item) ? item[0] : item

const getMeta = (item: FilterComponent<QueryParams>) => getModule(item).meta

const filterAll = (props.filter ?? []).map(item => ({id: useId(), item}))

const pinnedModules = props.pinned.map(getModule)

const pinnedIds = filterAll.filter(item => pinnedModules.includes(getModule(item.item))).map(item => item.id)

const openId = ref<string | null>(null)

const filterList = computed(() => {
  return filterAll.filter(item => {
    const meta = getMeta(item.item)

    if (getMetaValue(meta.hidden, props.scope.modelValue)) return false

    const fields = meta.fields ?? []
    return !fields.some(field => props.disabledFilterFields.includes(field))
  })
})

const hasValue = (item: FilterComponent<QueryParams>) => getMeta(item).fields
  ?.some(field => field in (props.scope.modelValue as Record<string, unknown>) && props.scope.modelValue[field] !== undefined) ?? false

const shown = computed(() => filterList.value.filter(item => hasValue(item.item)).map(item => item.id))

const selected = ref<string[]>(shown.value.slice())

const allShown = computed(() => [...pinnedIds, ...selected.value, ...shown.value].filter((item, index, array) => array.indexOf(item) === index))

const shownList = computed(() => [
  ...filterList.value.filter(item => pinnedIds.includes(item.id)),
  ...filterList.value.filter(item => !pinnedIds.includes(item.id) && allShown.value.includes(item.id)),
])

const availableList = computed(() => filterList.value.filter(item => !allShown.value.includes(item.id)))

const closeFilterItem = (item: {id: string}) => {
  if (openId.value === item.id) openId.value = null
}

const removeFilterItem = (item: {id: string, item: FilterComponent<QueryParams>}) => {
  const result: QueryParams = {...props.scope.modelValue} as QueryParams

  getMeta(item.item).fields?.forEach(field => {
    result[field as keyof QueryParams] = undefined as never
  })

  const selectedIndex = selected.value.indexOf(item.id)

  if (selectedIndex !== -1) selected.value.splice(selectedIndex, 1)

  closeFilterItem(item)

  props.scope.updateModelValue(result)
}

const isOverflowOpen = ref(false)
const overflowOpenId = ref<string | null>(null)

const hiddenIds = ref<string[]>([])

const hiddenList = computed(() => shownList.value.filter(item => hiddenIds.value.includes(item.id)))

const hiddenActiveCount = computed(() => hiddenList.value.filter(item => hasValue(item.item)).length)

const rootRef = useTemplateRef('root')

const naturalWidth = ref(0)

const widths = new WeakMap<Element, number>()

const OVERFLOW_WIDTH_FALLBACK = 112

const isShown = (element: Element) => element.getClientRects().length > 0

const measure = (element: Element) => {
  if (isShown(element)) widths.set(element, element.getBoundingClientRect().width)

  return widths.get(element)
}

const update = () => {
  const root = rootRef.value

  if (!inToolbar || !root) return

  const children = Array.from(root.children)
  const chips = children.filter(element => element.hasAttribute('data-filter-chip'))
  const overflow = children.find(element => element.hasAttribute('data-filter-overflow'))
  const fixed = children.filter(element => !chips.includes(element) && element !== overflow)

  const chipWidths = chips.map(measure)
  const fixedWidth = fixed.reduce((sum, element) => sum + (measure(element) ?? 0), 0)
  const overflowWidth = (overflow && measure(overflow)) ?? OVERFLOW_WIDTH_FALLBACK

  if (chipWidths.some(width => width === undefined)) {
    hiddenIds.value = []
    return
  }

  const gap = parseFloat(getComputedStyle(root).columnGap) || 0
  const chipsWidth = (chipWidths as number[]).reduce((sum, width) => sum + width, 0)
  const itemCount = fixed.length + chips.length

  naturalWidth.value = Math.ceil(fixedWidth + chipsWidth + gap * Math.max(itemCount - 1, 0))

  const available = root.clientWidth

  if (naturalWidth.value <= available) {
    hiddenIds.value = []
    return
  }

  const ids = shownList.value.map(item => item.id)
  const openIndex = openId.value === null ? -1 : ids.indexOf(openId.value)
  const order = openIndex === -1 ? ids.map((_, index) => index) : [openIndex, ...ids.map((_, index) => index).filter(index => index !== openIndex)]

  let used = fixedWidth + overflowWidth + gap * fixed.length
  const visible = new Set<number>()

  for (const index of order) {
    const width = chipWidths[index]!

    if (used + gap + width > available) break

    used += gap + width
    visible.add(index)
  }

  hiddenIds.value = ids.filter((_, index) => !visible.has(index))
}

let observer: ResizeObserver | null = null

const observe = () => {
  if (!observer || !rootRef.value) return

  observer.disconnect()
  observer.observe(rootRef.value)
  Array.from(rootRef.value.children).forEach(element => observer?.observe(element))
}

onMounted(() => {
  if (!inToolbar) return

  observer = new ResizeObserver(update)
  observe()
})

onUpdated(observe)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>
