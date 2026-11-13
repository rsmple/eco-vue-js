<template>
  <component
    :is="uniformField !== undefined ? WUniform : WEmptyComponent"
    v-bind="formFieldGetter ? {
      ...uniformScope ?? {},
      field: uniformField,
    } : undefined"
  >
    <template #default="innerScope">
      <div
        ref="container"
        :role="skeleton ? undefined : 'listitem'"
        class="w-list-item w-skeleton-static group/row relative"
        :class="{
          [cardWrapperClass ?? '']: true,
          'w-ripple-trigger-list': isActionShown,
          'w-list-item-highlighted': allowSelectHover || isAccented,
          'w-list-item-accented': isAccented,
          'sm-not:even:bg-(--w-list-stripe,var(--w-surface-subtle)) grid grid-cols-1': card,
          'col-span-full grid grid-cols-subgrid': !card,
          '-mb-px': !card && isOpen,
          'w-hover-checked': allowSelectHover,
        }"
        @mouseover="hoverSelected"
        @contextmenu="toggleMenu"
      >
        <div
          v-if="mobile"
          class="tone-primary bg-tone-fill @sm:hidden pointer-events-none absolute left-0 top-0 h-full w-2 motion-safe:transition-[translate,opacity] motion-safe:duration-200"
          :class="{'-translate-x-2 opacity-0': !selected}"
        />

        <div
          v-if="!card"
          class="w-list-item-sticky left---left-inner bg-surface @max-lg:hidden sticky z-1"
          :class="{
            'width-(--w-list-header-rounded,1rem)': !allowSelect,
          }"
        >
          <div class="w-list-mask bg-surface w---left-inner absolute right-full top-0 -z-1 h-full" />

          <div
            class="h-full rounded-l-(--w-list-rounded,unset)"
            :class="{
              'border border-r-0': hasBorder,
              'border-line': hasBorder && !selected,
              'tone-primary border-tone-line': hasBorder && selected,
              'rounded-bl-[unset]!': isOpen,
              'border-b-transparent': hasBorder && isOpen,
              'pl-px': !hasBorder,
              [RIPPLE_CLASS]: isActionShown,
            }"
          >
            <!-- A loading row draws the box alone: the checkbox would only be disabled, and is the larger part of the row. -->
            <div
              v-if="allowSelect && skeleton"
              class="flex h-full px-(--w-list-padding,1rem)"
              :class="{
                'pt-(--w-list-align-top,1.125rem) items-start': alignTop,
                'items-center': !alignTop,
              }"
            >
              <div class="square-[1.5em] border-line rounded-md border border-solid opacity-70 [font-size:var(--w-checkbox-size)]" />
            </div>

            <WCheckbox
              v-else-if="allowSelect"
              :model-value="selected"
              :readonly="false"
              label="Select row"
              :align-top="alignTop"
              :less-transitions="allowSelectHover"
              class="h-full px-(--w-list-padding,1rem)"
              :class="{
                'opacity-50': allowSelectHover,
                'pt-(--w-list-align-top,1.125rem)': alignTop,
              }"
              @update:model-value="$emit('toggle:selected', value, position)"
            />
          </div>
        </div>

        <div
          class="w-list-item-middle sm-not:px---inner-margin isolate"
          :class="{
            [cardClass ?? '']: true,
            '[contain-intrinsic-size:auto_3rem] [content-visibility:auto]': contentVisibility,
            'col-[2/-2] grid grid-cols-subgrid': !card,
            'w-list-card-surface card:p-(--w-list-card-padding,1rem) grid grid-cols-(--w-list-grid-cols) [grid-template-areas:var(--w-list-grid-areas)]': card,
            'sm:border-y': hasBorder,
            'border-line': hasBorder && !selected,
            'tone-primary border-tone-line': hasBorder && selected,
            'sm:border': card && hasBorder,
            'border-b-transparent': !card && hasBorder && isOpen,
          }"
        >
          <WCheckbox
            v-if="allowSelect && card && !skeleton"
            :model-value="selected"
            :readonly="false"
            label="Select row"
            class="p---inner-margin -my---inner-margin -mr---inner-margin justify-end self-start"
            :class="{
              'opacity-50': allowSelectHover,
            }"
            :style="{gridArea: AREA_SELECT}"
            @update:model-value="$emit('toggle:selected', value, position)"
          />

          <template v-if="skeleton && skeletonFields">
            <div
              v-for="field in skeletonFields"
              :key="field.meta.label"
              class="list:pr-3 list:first-not:pl-3 grid grid-cols-1"
              :class="[field.meta.cssClass, columnDataMap[field.meta.label]!.baseClass]"
              :style="columnDataMap[field.meta.label]!.style"
            >
              <div
                class="tone-primary bg-tone-soft w-skeleton w-option-has-bg"
                :style="{'--skeleton-width-internal': getSkeletonWidth(field.meta.label, position) + '%'}"
              />
            </div>
          </template>

          <ListCardFieldNested
            v-else
            :fields="fields"
            :column-data-map="columnDataMap"
            :item="item"
            :skeleton="skeleton"
            :card="card"
            :readonly="isReadonly"
            :uniform-scope="uniformField !== undefined ? innerScope : undefined"
            :query-params="queryParams"
            :results="results"
            :intersecting="intersecting"
          >
            <template #default="{field, item: fieldItem, nested, column}">
              <div
                v-if="skeleton && !field.meta.customSkeleton"
                class="list:pr-3 list:first-not:pl-3 grid grid-cols-1"
                :class="[field.meta.cssClass, column.baseClass]"
                :style="card && nested ? undefined : column.style"
              >
                <div
                  class="tone-primary bg-tone-soft w-skeleton w-option-has-bg"
                  :style="{'--skeleton-width-internal': getSkeletonWidth(field.meta.label, position) + '%'}"
                />
              </div>

              <component
                :is="field.default"
                v-else
                :item="fieldItem"
                :readonly="nested ? readonly || (readonlyGetter?.(fieldItem as Data) ?? false) : isReadonly"
                :skeleton="skeleton"
                :card="card"
                :config="fieldConfigMap[field.meta.label]!"
                :uniform-scope="uniformField !== undefined ? innerScope : undefined"
                :query-params="queryParams"
                :results="results"
                :intersecting="intersecting"
                :class="[field.meta.cssClass, column.baseClass, column.sticky && isActionShown ? RIPPLE_CLASS : undefined]"
                :style="card && nested ? undefined : column.style"
                @update:item="setter"
                @delete:item="deleteItem"
              />
            </template>
          </ListCardFieldNested>

          <!-- `onClick` as a prop: it stays `undefined` for a link, so a row re-rendering does not re-render the link. -->
          <!-- eslint-disable vue/attribute-hyphenation -->
          <component
            :is="action === 'link' ? WRouterLinkRaw : action === 'none' ? 'div' : 'button'"
            v-if="isActionShown"
            :aria-label="ACTION_LABEL[action]"
            :aria-expanded="action === 'open' ? isOpen : undefined"
            :to="action === 'link' ? to : undefined"
            class="absolute inset-0 cursor-pointer select-none"
            :class="{
              [RIPPLE_CLASS]: true,
              'sm:w-ripple-rounded-(--w-list-rounded,var(--radius-xl)) sm:rounded-(--w-list-rounded,var(--radius-xl))': card,
              'z-[-1]': action !== 'select',
            }"
            :onClick="action === 'action'
              ? () => $emit('click:action', {item, setter, scope: uniformField !== undefined ? innerScope : undefined})
              : action === 'select' || action === 'open' ? onAction : undefined"
          />
          <!-- eslint-enable vue/attribute-hyphenation -->

          <WButtonMore
            v-if="card && hasMenu && !skeleton"
            ref="more"
            class="p---inner-margin -my---inner-margin -mr---inner-margin flex items-center"
            :disabled="disableMore"
            :style="{gridArea: AREA_MORE}"
          >
            <WButtonMoreItem
              v-if="alwaysSelect && allowSelect && to"
              text="View"
              :icon="IconToRaw"
              :to="to"
              @click="$emit('toggle:selected', value, position)"
            />

            <ListMenuMarkdown
              v-if="toMarkdown"
              :item="item"
              :index="index"
              :to-markdown="toMarkdown"
            />

            <component
              :is="Array.isArray(menuItem) ? menuItem[0] : menuItem"
              v-for="(menuItem, menuIndex) in menu"
              :key="menuIndex"
              v-bind="Array.isArray(menuItem) ? menuItem[1] : undefined"
              :item="item"
              :readonly="isReadonly"
              :uniform-scope="uniformField !== undefined ? innerScope : undefined"
              :update-item="setter"
              :delete-item="deleteItem"
              @update:item="setter"
              @delete:item="deleteItem"
            />
          </WButtonMore>
        </div>

        <div
          v-if="!card"
          class="w-list-item-sticky right---right-inner bg-surface sticky z-1"
          :class="{
            'width-[calc(var(--w-list-padding,1rem)*2+1.25em)]': hasMenu,
            'width-(--w-list-header-rounded,1rem)': !hasMenu,
          }"
        >
          <div class="w-list-mask bg-surface w---right-inner absolute left-full top-0 -z-1 h-full" />

          <div
            class="h-full rounded-r-(--w-list-rounded,unset)"
            :class="{
              'rounded-tr-(--w-list-rounded,unset) border border-l-0': hasBorder,
              'border-line': hasBorder && !selected,
              'tone-primary border-tone-line': hasBorder && selected,
              'rounded-br-[unset]!': isOpen,
              'border-b-transparent': hasBorder && isOpen,
              [RIPPLE_CLASS]: isActionShown,
            }"
          >
            <WButtonMore
              v-if="hasMenu && !skeleton"
              ref="more"
              class="flex h-full px-(--w-list-padding,1rem)"
              :class="{
                'pt-(--w-list-align-top,1.125rem) items-start': alignTop,
                'items-center': !alignTop,
              }"
              :disabled="disableMore"
            >
              <WButtonMoreItem
                v-if="alwaysSelect && allowSelect && to"
                text="View"
                :icon="IconToRaw"
                :to="to"
                @click="$emit('toggle:selected', value, position)"
              />

              <ListMenuMarkdown
                v-if="toMarkdown"
                :item="item"
                :index="index"
                :to-markdown="toMarkdown"
              />

              <component
                :is="Array.isArray(menuItem) ? menuItem[0] : menuItem"
                v-for="(menuItem, menuIndex) in menu"
                :key="menuIndex"
                v-bind="Array.isArray(menuItem) ? menuItem[1] : undefined"
                :item="item"
                :readonly="isReadonly"
                :uniform-scope="uniformField !== undefined ? innerScope : undefined"
                :update-item="setter"
                :delete-item="deleteItem"
                @update:item="setter"
                @delete:item="deleteItem"
              />
            </WButtonMore>
          </div>
        </div>
      </div>

      <div
        v-if="expansion && isOpen"
        v-bind="{[INFINITE_LIST_UNMEASURED_ATTRIBUTE]: ''}"
        class="w-list-item-expansion list:w---width-inner list:left---left-inner list:sticky col-span-full"
        :class="{
          'border-line': hasBorder && !selected,
          'tone-primary border-tone-line': hasBorder && selected,
          '-mt-(--w-list-gap,1rem) border border-t-0 px-5': !card && hasBorder,
          'rounded-b-(--w-list-rounded,unset)': !card,
        }"
      >
        <component
          :is="expansion"
          :item="item"
          :readonly="isReadonly"
          :skeleton="skeleton"
          :card="card"
          :uniform-scope="uniformField !== undefined ? innerScope : undefined"
          :query-params="queryParams"
          :results="results"
          :intersecting="intersecting"
          @update:item="setter"
          @delete:item="deleteItem"
        />
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {CardActionParams, ColumnData, ExpansionComponent, FieldComponent, FieldConfig, ListActionMode, ListField, ListFieldExport, ListFields, MenuComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'
import type {LinkProps} from '@/types/types'

import {computed, markRaw, ref, useTemplateRef, watch} from 'vue'

import WButtonMore from '@/components/Button/WButtonMore.vue'
import WButtonMoreItem from '@/components/Button/WButtonMoreItem.vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'
import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WUniform from '@/components/Uniform/WUniform.vue'

import IconTo from '@/assets/icons/IconTo.svg?component'

import {INFINITE_LIST_UNMEASURED_ATTRIBUTE} from '@/components/InfiniteList/models/utils'
import {createPointAnchor} from '@/utils/Overlay'

import ListCardFieldNested from './ListCardFieldNested.vue'
import ListMenuMarkdown from './ListMenuMarkdown.vue'

import {getSkeletonWidth} from '../models/utils'
import {AREA_MORE, AREA_SELECT} from '../types'

const ACTION_LABEL: Record<ListActionMode, string | undefined> = {
  select: 'Select row',
  action: 'Open row',
  link: 'Open row',
  open: 'Expand row',
  none: undefined,
}

// The row's skeletons stay still (`w-skeleton-static` on the row): a shimmer in every cell repaints each of them every
// frame while the rows are inserted, and costs more than the rows themselves.

// The ripple of the row's action, and of the sticky cells and edges that cover it. The same classes whatever the row's
// state: the state is on the row (`w-list-item-highlighted`, `w-list-item-accented`), so a selection restyles the cells
// without re-rendering them.
const RIPPLE_CLASS = 'w-ripple-list w-ripple-hover-list w-ripple-opacity-5 group-[.w-list-item-highlighted]/row:tone-primary group-[.w-list-item-highlighted]/row:before:text-tone group-[.w-list-item-highlighted]/row:w-ripple-opacity-15 group-[.w-list-item-accented]/row:before:opacity-10'

const props = defineProps<{
  item: Data
  skeleton: boolean
  setter: (newItem?: Data | undefined) => void
  refetch: () => void
  index: number
  position: number
  value: number
  results: Data[] | undefined
  intersecting: boolean

  fields: ListFields<Data, QueryParams>
  /** The fields, when a loading row can draw all of them as plain placeholders without mounting a component per field. */
  skeletonFields: ListFieldExport<FieldComponent<Data, QueryParams>, ListField<Data, QueryParams>>[] | undefined
  fieldConfigMap: Record<string, FieldConfig>
  columnDataMap: Record<string, ColumnData>
  queryParams: QueryParams
  readonly: boolean
  readonlyGetter: ((item: Data) => boolean) | undefined
  formFieldGetter: ((data: Data, index: number) => string | undefined) | undefined
  uniformScope: UniformScope<Data[]> | undefined
  expansion: ExpansionComponent<Data, QueryParams> | undefined
  menu: MenuComponent<Data>[] | undefined
  toMarkdown: ((data: Data, index: number) => string) | undefined
  hasMenu: boolean

  card: boolean
  mobile: boolean
  cardClass: string | undefined
  cardWrapperClass: string | undefined
  hasBorder: boolean | undefined
  alignTop: boolean | undefined
  allowOpen: boolean
  disableMore: boolean | undefined
  actionMode: ListActionMode
  cardTo: ((item: Data) => LinkProps['to'] | undefined) | undefined
  contentVisibility: boolean | undefined

  selected: boolean
  allowSelect: boolean
  allowSelectHover: boolean
  alwaysSelect: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle:selected', value: number, position: number): void
  (e: 'hover:selected', position: number): void
  (e: 'click:action', value: CardActionParams<Data>): void
}>()

const WRouterLinkRaw = markRaw(WRouterLink)
const IconToRaw = markRaw(IconTo)

const containerRef = useTemplateRef('container')
const moreRef = useTemplateRef<ComponentInstance<typeof WButtonMore>>('more')

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const uniformField = computed(() => props.formFieldGetter?.(props.item, props.index))

const isReadonly = computed(() => props.readonly || (props.readonlyGetter?.(props.item) ?? false))

const to = computed(() => props.skeleton ? undefined : props.cardTo?.(props.item))

// Stays on while the menu, or a confirm opened from it, is open.
const isAccented = computed(() => props.selected || moreRef.value?.isActive === true)

const action = computed<ListActionMode>(() => {
  if (props.actionMode !== 'link' || to.value !== undefined) return props.actionMode

  return props.allowOpen ? 'open' : 'none'
})

const isActionShown = computed<boolean>(() => !props.skeleton && (action.value !== 'none' || isAccented.value))

// Stable, so the row re-rendering does not re-render the action or the menu items. `action` mode needs the row's
// form scope, so its handler is bound in the template.
const onAction = () => {
  if (action.value === 'select') emit('toggle:selected', props.value, props.position)
  else if (action.value === 'open') toggle()
}

const deleteItem = () => {
  props.setter()
  props.refetch()
}

const hoverSelected = () => {
  if (props.allowSelect) emit('hover:selected', props.position)
}

const toggleMenu = (event: MouseEvent) => {
  if (props.skeleton || props.disableMore || !containerRef.value || !moreRef.value || event.ctrlKey) return

  moreRef.value.open(createPointAnchor(containerRef.value, event.clientX, event.clientY))

  event.preventDefault()
}

watch(() => props.position, () => {
  isOpen.value = false
  moreRef.value?.close()
})
</script>
