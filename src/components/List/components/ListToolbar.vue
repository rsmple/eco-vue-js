<template>
  <slot
    name="header"
    :count="count"
  />

  <WButtonSelection
    :title="selectionTitle"
    :disable-message="bulkDisableMessage"
    :selected-count="selectionCount"
    :style="{zIndex: BASE_ZINDEX_DROPDOWN}"
    @clear:selection="$emit('reset:selection')"
  >
    <template
      v-if="bulk || action || !disableExport"
      #default="{disableMessage, cssClass, visibleCount}"
    >
      <template v-if="selectionCount === 0 && action">
        <template
          v-for="(item, index) in action"
          :key="index"
        >
          <component
            :is="item"
            :query-params="queryParams"
            :readonly="readonly"
            :class="cssClass"
          />
        </template>
      </template>

      <template v-else>
        <HeaderExport
          v-if="!disableExport"
          :fields="fieldsVisible"
          :query-params-getter="selectionCount === 0 ? () => queryParams : getQueryParamsBulk"
          :use-query-fn="useQueryFnExport ?? useQueryFn"
          :api-method="apiMethodExport"
          :file-name="exportFileName"
          :to-markdown="toMarkdown"
          :class="cssClass"
        />

        <template
          v-for="(item, index) in bulk"
          :key="index"
        >
          <component
            :is="item"
            :selection-count="selectionCount"
            :query-params-getter="getQueryParamsBulk"
            :disable-message="disableMessage"
            :readonly="readonly"
            :clear-selection="resetSelection"
            :class="[cssClass, {hidden: bulkOffset + index >= visibleCount}]"
            @clear:selected="$emit('reset:selection')"
          />
        </template>
      </template>
    </template>

    <!-- The bulk actions that do not fit the bar, after the export. -->
    <template
      v-if="bulk?.length && !(selectionCount === 0 && action)"
      #more="scope"
    >
      <template
        v-for="(item, index) in bulk"
        :key="index"
      >
        <component
          :is="item"
          v-if="bulkOffset + index >= scope.visibleCount"
          :selection-count="selectionCount"
          :query-params-getter="getQueryParamsBulk"
          :disable-message="scope.disableMessage"
          :readonly="readonly"
          :clear-selection="resetSelection"
          @clear:selected="$emit('reset:selection')"
        />
      </template>
    </template>

    <template #settings>
      <slot
        v-if="$slots.selection"
        name="selection"
      />

      <div
        v-else
        class="flex"
      >
        <WButtonSelectionAction
          v-if="allowSelect"
          :icon="markRaw(IconRange)"
          :active="isShift"
          :aria-pressed="isShift"
          tooltip-text="Select range"
          class="last-not:border-r border-solid border-line"
          @click="$emit('set:is-selecting')"
        >
          <template #tooltip>
            <div class="grid grid-cols-[1fr_auto] gap-4">
              <div>
                Select range
              </div>

              <div class="text-description whitespace-nowrap">
                <IconShift class="square-4 mt-[-0.25em] inline" /> Shift
              </div>
            </div>
          </template>
        </WButtonSelectionAction>

        <WButtonSelectionAction
          v-if="!noRefetch"
          :icon="markRaw(IconRefresh)"
          :loading="isRefetchingAll"
          :active="isRefetchingAll"
          tooltip-text="Refetch"
          class="last-not:border-r border-solid border-line"
          @click="refetchAll"
        />

        <HeaderSort
          v-if="!noOrdering"
          :ordering="ordering"
          :fields="fieldsVisible"
          :query-params="queryParams"
          class="last-not:border-r border-solid border-line"
          @update:ordering="$emit('update:ordering', $event)"
        />

        <HeaderSettings
          v-if="!noHeaderSettings"
          :field-config-map="fieldConfigMap"
          :mode="mode"
          :fields="fieldsVisible"
          :query-params="queryParams"
          :has-saved="hasSaved"
          :mobile="mobile"
          :no-mode="noMode ?? false"
          @click:reset="$emit('click:reset')"
          @update:mode="$emit('update:mode', $event)"
          @update:field-config-map="$emit('update:field-config-map', $event)"
        />
      </div>
    </template>
  </WButtonSelection>

  <WListHeader
    v-if="!card"
    class="sm-not:hidden"
    :allow-select="allowSelect"
    :select-only="selectOnly"
    :tooltip-text="selectAllTextGetter(selectAllValue !== true, totalCount ?? 0)"
    :hide-more="!menu && !toMarkdown"

    :count="totalCount"
    :selection="selectAllValue"
    :style="{
      '--list-header-width': getFieldWidthSumStyles(fieldConfigMap),
    }"
    @toggle:selection="$emit('toggle:selection', $event)"
    @update:header="updateHeader"
  >
    <template #default>
      <HeaderFieldNested :fields="fieldsSorted">
        <template #default="{field}">
          <WListHeaderItem
            :title="typeof field.meta.title === 'string' ? field.meta.title : field.meta.title(queryParams)"
            :field="typeof field.meta.field === 'string' ? field.meta.field : (field.meta.field?.(queryParams) as keyof Data)"
            :ordering="ordering"
            :disabled="noOrdering"
            :allow-resize="field.meta.allowResize"
            :item-class="field.meta.cssClassHeader"
            :style-value="card ? {gridArea: field.meta.label} : {
              minWidth: field.meta.allowResize ? `var(${getFieldVariable('width', field.meta.label)})` : undefined,
              maxWidth: field.meta.allowResize ? `var(${getFieldVariable('width', field.meta.label)})` : undefined,
              left: fieldConfigMap[field.meta.label]?.sticky ? `var(${getFieldVariable('left', field.meta.label)})` : undefined,
              right: fieldConfigMap[field.meta.label]?.sticky ? `var(${getFieldVariable('right', field.meta.label)})` : undefined,
            }"
            :has-width="stylesWidth[getFieldVariable('width', field.meta.label)] !== undefined"
            :class="{
              [field.meta.cssClass ?? '']: true,
              'sticky z-1 bg-inherit': !card && fieldConfigMap[field.meta.label]?.sticky,
            }"
            @update:width="$emit('update:width', field.meta.label, $event)"
            @save:width="$emit('save:width')"
            @update:ordering="$emit('update:ordering', $event)"
          />
        </template>
      </HeaderFieldNested>
    </template>
  </WListHeader>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {ActionComponent, BulkComponent, FieldConfig, ListFields, MenuComponent} from '../types'
import type {OrderItem} from '@/utils/order'
import type {ListMode} from '@/utils/utils'

import {computed, markRaw} from 'vue'

import WButtonSelection from '@/components/Button/WButtonSelection.vue'
import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'

import IconRange from '@/assets/icons/IconRange.svg?component'
import IconRefresh from '@/assets/icons/IconRefresh.svg?component'
import IconShift from '@/assets/icons/IconShift.svg?component'

import {BASE_ZINDEX_DROPDOWN} from '@/utils/utils'

import HeaderExport from './HeaderExport.vue'
import HeaderFieldNested from './HeaderFieldNested.vue'
import HeaderSettings from './HeaderSettings.vue'
import HeaderSort from './HeaderSort.vue'

import WListHeader from '../WListHeader.vue'
import WListHeaderItem from '../WListHeaderItem.vue'
import {getFieldVariable, getFieldWidthSumStyles} from '../use/useListConfig'

const props = defineProps<{
  /** The count discovered by the list itself - what the `header` slot receives. */
  count: number | undefined
  /** The consumer-supplied count when there is one, falling back to `count`. */
  totalCount: number | undefined
  selectionTitle: string
  bulkDisableMessage: string | undefined
  selectionCount: number
  selectAllValue: boolean | null
  selectAllTextGetter: (isUnselect: boolean, count: number) => string
  isShift: boolean
  allowSelect: boolean
  selectOnly: boolean | undefined
  readonly: boolean

  queryParams: QueryParams
  useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
  useQueryFnExport: UseQueryDefault<PaginatedResponse<Data>, QueryParams> | undefined
  apiMethodExport: ((queryParams: QueryParams) => Promise<Data[]>) | undefined
  exportFileName: string | undefined
  getQueryParamsBulk: () => QueryParams
  toMarkdown: ((data: Data, index: number) => string) | undefined

  bulk: BulkComponent<QueryParams>[] | undefined
  action: ActionComponent<QueryParams>[] | undefined
  menu: MenuComponent<Data>[] | undefined

  fieldsVisible: ListFields<Data, QueryParams>
  fieldsFiltered: ListFields<Data, QueryParams>
  fieldsSorted: ListFields<Data, QueryParams>
  fieldConfigMap: Record<string, FieldConfig>
  stylesWidth: Record<string, string>
  ordering: OrderItem<keyof Data>[]
  mode: ListMode

  card: boolean
  mobile: boolean
  hasSaved: boolean
  noRefetch: boolean | undefined
  noOrdering: boolean | undefined
  noHeaderSettings: boolean | undefined
  noMode: boolean | undefined
  disableExport: boolean | undefined

  isRefetchingAll: boolean | undefined
  refetchAll: (() => void) | undefined
  updateHeader: (() => void) | undefined
}>()

const emit = defineEmits<{
  (e: 'reset:selection'): void
  (e: 'toggle:selection', value: boolean): void
  (e: 'set:is-selecting'): void
  (e: 'update:ordering', value: OrderItem<keyof Data>[]): void
  (e: 'update:mode', value: ListMode): void
  (e: 'update:field-config-map', value: Record<string, FieldConfig>): void
  (e: 'update:width', label: string, value: number): void
  (e: 'save:width'): void
  (e: 'click:reset'): void
}>()

// The export comes first in the bar, so the bulk actions start after it.
const bulkOffset = computed(() => props.disableExport ? 0 : 1)

// A bulk action in the More menu unmounts once its confirm takes the menu's place, so its own emits no longer arrive.
const resetSelection = () => emit('reset:selection')

defineSlots<{
  header?: (props: {count: number | undefined}) => void
  selection?: () => void
}>()
</script>
