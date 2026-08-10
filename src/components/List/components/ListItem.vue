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
        v-bind="allowSelect ? {'onMouseover': () => $emit('hover:selected', position)} : undefined"
        ref="container"
        class="relative"
        :class="{
          [cardWrapperClass ?? '']: true,
          'w-ripple-trigger-list': isActionShown,
          'sm-not:dark:even:bg-primary-darkest/25 sm-not:even:bg-gray-50 grid grid-cols-1': card,
          'flex': !card,
          '-mb-px': !card && isOpen,
          'w-hover-checked': allowSelectHover,
        }"
        @contextmenu="toggleMenu"
      >
        <Transition
          enter-active-class="transition-transform duration-200"
          leave-active-class="transition-transform duration-200"
          enter-from-class="-translate-x-2"
          leave-to-class="-translate-x-2"
        >
          <div
            v-if="mobile && selected"
            class="bg-primary dark:bg-primary-dark @sm:hidden absolute left-0 top-0 h-full w-2"
          />
        </Transition>

        <div
          v-if="!card"
          class="left---left-inner bg-default dark:bg-default-dark @max-lg:hidden sticky z-1"
          :class="{
            'width-(--w-list-header-rounded,1rem)': !allowSelect,
          }"
        >
          <div class="bg-default dark:bg-default-dark w---left-inner absolute right-full top-0 -z-1 h-full" />

          <div
            class="h-full rounded-l-(--w-list-rounded,unset)"
            :class="{
              'border border-r-0': hasBorder,
              'border-gray-300 dark:border-gray-700': hasBorder && !selected,
              'border-primary dark:border-primary-dark': hasBorder && selected,
              'rounded-bl-[unset]!': isOpen,
              'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
              'pl-px': !hasBorder,
              ...beforeClass,
            }"
          >
            <WCheckbox
              v-if="allowSelect"
              :model-value="selected"
              :disabled="skeleton"
              :readonly="false"
              :align-top="alignTop"
              :less-transitions="allowSelectHover"
              class="h-full px-(--w-list-padding,1rem)"
              :class="{
                'opacity-50': allowSelectHover,
                'pt-4.5': alignTop,
              }"
              @update:model-value="$emit('toggle:selected', value, position)"
            />
          </div>
        </div>

        <div
          class="sm-not:px---inner-margin isolate"
          :class="{
            [cardClass ?? '']: true,
            '[contain-intrinsic-size:auto_3rem] [content-visibility:auto]': contentVisibility,
            'flex flex-1': !card,
            'grid grid-cols-(--w-list-grid-cols) [grid-template-areas:var(--w-list-grid-areas)] sm:rounded-(--w-list-rounded,unset)': card,
            'sm:border-y': hasBorder,
            'border-gray-300 dark:border-gray-700': hasBorder && !selected,
            'border-primary dark:border-primary-dark': hasBorder && selected,
            'sm:border': card && hasBorder,
            'border-b-transparent dark:border-b-transparent': !card && hasBorder && isOpen,
          }"
        >
          <WCheckbox
            v-if="allowSelect && card"
            :model-value="selected"
            :disabled="skeleton"
            :readonly="false"
            class="p---inner-margin -my---inner-margin -mr---inner-margin justify-end self-start"
            :class="{
              'opacity-50': allowSelectHover,
            }"
            :style="{gridArea: AREA_SELECT}"
            @update:model-value="$emit('toggle:selected', value, position)"
          />

          <ListCardFieldNested
            :fields="fields"
            :column-data-map="columnDataMap"
            :item="item"
            :skeleton="skeleton"
            :card="card"
            :readonly="isReadonly"
            :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
            :query-params="queryParams"
            :results="results"
            :intersecting="intersecting"
          >
            <template #default="defaultScope">
              <ListCardFieldItem
                :field="defaultScope.field"
                :item="defaultScope.item"
                :nested="defaultScope.nested"
                :column="defaultScope.column"
                :config="fieldConfigMap[defaultScope.field.meta.label]!"
                :readonly="readonly || (readonlyGetter?.(defaultScope.item as Data) ?? false)"
                :skeleton="skeleton"
                :card="card"
                :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
                :query-params="queryParams"
                :results="results"
                :intersecting="intersecting"
                :position="position"
                :before-class="defaultScope.column.sticky ? beforeClass : undefined"
                @update:item="setter"
                @delete:item="setter(); refetch()"
              />
            </template>
          </ListCardFieldNested>

          <ListCardAction
            v-if="isActionShown"
            v-bind="allowSelect && (allowSelectHover || alwaysSelect)
              ? {tag: 'button', card, onClick: () => $emit('toggle:selected', value, position)}
              : hasAction
                ? {tag: 'button', card, class: 'z-[-1]', onClick: () => $emit('click:action', {item, setter, scope: uniformField !== undefined ? innerScope : undefined})}
                : to
                  ? {tag: markRaw(WRouterLink), card, class: 'z-[-1]', props: {to}}
                  : allowOpen
                    ? {tag: 'button', card, class: 'z-[-1]', onClick: toggle}
                    : {tag: 'div', card, class: 'z-[-1]'}
            "
            :class="{
              'before:text-primary dark:before:text-primary-dark': allowSelectHover || selected || moreRef?.isOpen,
              'before:opacity-10': selected || moreRef?.isOpen,
            }"
            :opacity-class="allowSelectHover || selected || moreRef?.isOpen ? 'w-ripple-opacity-15' : undefined"
          />

          <WButtonMore
            v-if="card && hasMenu"
            ref="more"
            class="p---inner-margin -my---inner-margin -mr---inner-margin flex items-center"
            :disabled="skeleton || disableMore"
            :style="{gridArea: AREA_MORE}"
            :anchor="anchorRef ?? undefined"
            @close="positionMenu = null"
          >
            <WButtonMoreItem
              v-if="alwaysSelect && allowSelect && to"
              text="View"
              :icon="markRaw(IconTo)"
              :to="to"
              @click="$emit('toggle:selected', value, position)"
            />

            <ListMenuMarkdown
              v-if="toMarkdown && !skeleton"
              :item="item"
              :index="index"
              :to-markdown="toMarkdown"
            />

            <template
              v-for="(menuItem, menuIndex) in menu"
              :key="menuIndex"
            >
              <component
                :is="Array.isArray(menuItem) ? menuItem[0] : menuItem"
                v-bind="Array.isArray(menuItem) ? menuItem[1] : undefined"
                :item="item"
                :readonly="isReadonly"
                :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
                :update-item="setter"
                :delete-item="() => {
                  setter()
                  refetch()
                }"
                @update:item="setter"
                @delete:item="setter(); refetch()"
              />
            </template>
          </WButtonMore>
        </div>

        <div
          v-if="!card"
          class="right---right-inner bg-default dark:bg-default-dark sticky z-1"
          :class="{
            'width-[calc(var(--w-list-padding,1rem)*2+1.25em)]': hasMenu,
            'width-(--w-list-header-rounded,1rem)': !hasMenu,
          }"
        >
          <div class="bg-default dark:bg-default-dark w---right-inner absolute left-full top-0 -z-1 h-full" />

          <div
            class="h-full rounded-r-(--w-list-rounded,unset)"
            :class="{
              'rounded-tr-(--w-list-rounded,unset) border border-l-0': hasBorder,
              'border-gray-300 dark:border-gray-700': hasBorder && !selected,
              'border-primary dark:border-primary-dark': hasBorder && selected,
              'rounded-br-[unset]!': isOpen,
              'border-b-transparent dark:border-b-transparent': hasBorder && isOpen,
              ...beforeClass,
            }"
          >
            <WButtonMore
              v-if="hasMenu"
              ref="more"
              class="flex h-full px-(--w-list-padding,1rem)"
              :class="{
                'pt-4.5 items-start': alignTop,
                'items-center': !alignTop,
              }"
              :disabled="skeleton || disableMore"
              :anchor="anchorRef ?? undefined"
              @close="positionMenu = null"
            >
              <WButtonMoreItem
                v-if="alwaysSelect && allowSelect && to"
                text="View"
                :icon="markRaw(IconTo)"
                :to="to"
                @click="$emit('toggle:selected', value, position)"
              />

              <ListMenuMarkdown
                v-if="toMarkdown && !skeleton"
                :item="item"
                :index="index"
                :to-markdown="toMarkdown"
              />

              <template
                v-for="(menuItem, menuIndex) in menu"
                :key="menuIndex"
              >
                <component
                  :is="Array.isArray(menuItem) ? menuItem[0] : menuItem"
                  v-bind="Array.isArray(menuItem) ? menuItem[1] : undefined"
                  :item="item"
                  :readonly="isReadonly"
                  :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
                  :update-item="setter"
                  :delete-item="() => {
                    setter()
                    refetch()
                  }"
                  @update:item="setter"
                  @delete:item="setter(); refetch()"
                />
              </template>
            </WButtonMore>
          </div>
        </div>

        <div
          v-if="positionMenu"
          ref="anchor"
          class="absolute"
          :style="positionMenu"
        />
      </div>

      <div
        v-if="expansion && isOpen"
        class="list:w---width-inner list:left---left-inner list:sticky col-span-full"
        :class="{
          'border-gray-300 dark:border-gray-700': hasBorder && !selected,
          'border-primary dark:border-primary-dark': hasBorder && selected,
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
          :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
          :query-params="queryParams"
          :results="results"
          :intersecting="intersecting"
          @update:item="setter"
          @delete:item="setter(); refetch()"
        />
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {CardActionParams, ColumnData, ExpansionComponent, FieldConfig, ListFields, MenuComponent} from '../types'
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

import ListCardAction from './ListCardAction.vue'
import ListCardFieldItem from './ListCardFieldItem.vue'
import ListCardFieldNested from './ListCardFieldNested.vue'
import ListMenuMarkdown from './ListMenuMarkdown.vue'

import {AREA_MORE, AREA_SELECT} from '../types'

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

  card: boolean
  mobile: boolean
  cardClass: string | undefined
  cardWrapperClass: string | undefined
  hasBorder: boolean | undefined
  alignTop: boolean | undefined
  allowOpen: boolean
  disableMore: boolean | undefined
  hasAction: boolean | undefined
  cardTo: ((item: Data) => LinkProps['to'] | undefined) | undefined
  contentVisibility: boolean | undefined

  selected: boolean
  allowSelect: boolean
  allowSelectHover: boolean
  alwaysSelect: boolean
}>()

defineEmits<{
  (e: 'toggle:selected', value: number, position: number): void
  (e: 'hover:selected', position: number): void
  (e: 'click:action', value: CardActionParams<Data>): void
}>()

const containerRef = useTemplateRef('container')
const moreRef = useTemplateRef<ComponentInstance<typeof WButtonMore>>('more')

const isOpen = ref(false)
const positionMenu = ref<{left: string, top: string} | null>(null)
const anchorRef = useTemplateRef<HTMLDivElement>('anchor')

const uniformField = computed(() => props.formFieldGetter?.(props.item, props.index))

const isReadonly = computed(() => props.readonly || (props.readonlyGetter?.(props.item) ?? false))

const to = computed(() => props.skeleton ? undefined : props.cardTo?.(props.item))

const hasMenu = computed(() => props.menu !== undefined || (props.toMarkdown !== undefined && !props.skeleton))

const beforeClass = computed<Record<string, boolean | undefined>>(() => {
  if (!isActionShown.value) return {}

  return {
    'w-ripple-list w-ripple-hover-list': true,
    'w-ripple-opacity-5': !props.allowSelectHover && !props.selected && !moreRef.value?.isOpen,
    'before:text-primary dark:before:text-primary-dark w-ripple-opacity-15': props.allowSelectHover || props.selected || moreRef.value?.isOpen,
    'before:opacity-10': props.selected || moreRef.value?.isOpen,
  }
})

const toggle = () => {
  isOpen.value = !isOpen.value
}

const isActionShown = computed<boolean>(() => !props.skeleton && !(props.alwaysSelect && !props.allowSelect) && (props.allowOpen || to.value !== undefined || props.allowSelectHover || props.hasAction || props.selected || moreRef.value?.isOpen === true))

const toggleMenu = (event: MouseEvent) => {
  if (props.skeleton || props.disableMore || !containerRef.value || !moreRef.value || event.ctrlKey) return

  const containerRect = containerRef.value.getBoundingClientRect()

  positionMenu.value = {left: event.clientX - containerRect.x + 'px', top: event.clientY - containerRect.y + 'px'}

  moreRef.value.open()

  event.preventDefault()
}

watch(() => props.position, () => {
  isOpen.value = false
  positionMenu.value = null
  moreRef.value?.close()
})
</script>
