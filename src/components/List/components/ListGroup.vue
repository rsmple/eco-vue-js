<template>
  <div
    role="group"
    :aria-label="title"
  >
    <div
      class="bg-surface border-line-subtle top-[calc(var(--header-height,0px)+var(--infinite-list-header-height,0px))] w-ripple-trigger-list relative z-2 flex h-12 items-center border-b sm:sticky"
      :class="{
        'sm:w---width-inner sm:left---left-inner': !card,
        'w-ripple-list w-ripple-hover-list': !skeleton,
        'w-ripple-opacity-5': !skeleton && !selected,
        'tone-primary before:text-tone w-ripple-opacity-15 before:opacity-10': !skeleton && selected,
      }"
    >
      <WCheckbox
        v-if="allowSelect"
        :model-value="selected"
        :disabled="skeleton"
        :readonly="false"
        label="Select group"
        class="h-full px-(--w-list-padding,1rem)"
        @update:model-value="$emit('toggle:selected', group.key)"
      />

      <button
        type="button"
        class="flex h-full min-w-0 flex-1 items-center gap-2 pr-4 text-left"
        :class="{
          'pl-(--w-list-padding,1rem)': !allowSelect,
          'cursor-pointer': !skeleton,
        }"
        :aria-expanded="isExpanded"
        :disabled="skeleton"
        @click="isExpanded = !isExpanded"
      >
        <IconArrow
          class="square-4 text-description shrink-0 transition-transform"
          :class="{'-rotate-90': !isExpanded}"
        />

        <WSkeleton
          v-if="skeleton"
          class="w-skeleton-w-48"
        />

        <div
          v-else
          class="flex min-w-0 items-center gap-2 font-semibold"
        >
          <slot
            name="title"
            :group="group"
          >
            <span
              class="truncate"
              :class="{'text-description italic': group.key === null}"
            >
              {{ title }}
            </span>
          </slot>
        </div>

        <span
          v-if="!skeleton"
          class="text-description bg-surface-subtle shrink-0 rounded-full px-2 text-xs"
        >
          {{ group.count }}
        </span>
      </button>
    </div>

    <template v-if="isExpanded && !skeleton">
      <InfiniteListPage
        v-for="(page, index) in pages"
        :key="page"
        :query-params="{...queryParams, group__in: JSON.stringify([group.key]), page, size: PAGE_LENGTH}"
        :use-query-fn="useQueryFn"
        :skeleton-length="Math.min(group.count - (page - 1) * PAGE_LENGTH, PAGE_LENGTH)"
        :first-page="index === 0"
        :last-page="index === pages.length - 1"
        :page-class="pageClass"
        :value-getter="getValue"
        @update:next-page="nextPage = $event"
      >
        <template #default="scope">
          <slot
            :item="scope.item"
            :skeleton="scope.skeleton"
            :setter="scope.setter"
            :refetch="scope.refetch"
            :index="scope.index"
            :position="(scope.page - 1) * PAGE_LENGTH + scope.index"
            :value="getValue(scope.item)"
            :results="scope.results"
            :intersecting="scope.intersecting"
          />
        </template>
      </InfiniteListPage>

      <div
        v-if="nextPage !== null && nextPage > pages[pages.length - 1]!"
        class="sm:left---left-inner flex justify-center py-2 sm:sticky"
        :class="{
          'sm:w---width-inner': !card,
        }"
      >
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="pages.push(nextPage)"
        >
          {{ getText('listGroupMore') }}
        </WButton>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams, Group extends ListGroup">
import type {ListGroup} from '../types'
import type {GroupKey} from '@/utils/useSelected'

import {computed, ref, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'

import InfiniteListPage from '@/components/InfiniteList/components/InfiniteListPage.vue'
import {SemanticType} from '@/utils/SemanticType'
import {getText} from '@/utils/texts'
import {PAGE_LENGTH} from '@/utils/useDefaultQuery'

const props = defineProps<{
  group: Group
  skeleton: boolean
  queryParams: QueryParams
  useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
  pageClass: string
  card: boolean
  allowSelect: boolean
  selected: boolean
  expanded: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle:selected', value: GroupKey): void
  (e: 'update:group', value: Group): void
}>()

defineSlots<{
  title?: (props: {group: Group}) => void
  default?: (props: {
    item: Data
    skeleton: boolean
    setter: (newItem?: Data) => void
    refetch: () => void
    index: number
    position: number
    value: number
    results: Data[] | undefined
    intersecting: boolean
  }) => void
}>()

const isExpanded = ref(props.expanded)

const pages = ref<number[]>([1])
const nextPage = ref<number | null>(null)

const title = computed(() => props.group.key === null ? getText('listGroupEmpty') : String(props.group.key))

const getValue = (item: Data): number => (item as unknown as {id: number}).id

watch(() => props.skeleton ? undefined : props.group, group => {
  if (group) emit('update:group', group)
}, {immediate: true})
</script>
