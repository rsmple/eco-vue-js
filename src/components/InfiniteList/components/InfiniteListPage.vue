<template>
  <div
    ref="element"
    class="relative"
  >
    <template v-if="queryParams.page && data?.results?.length !== 0">
      <RouterLink
        v-if="!hidePageTitle"
        class="block text-description text-base font-normal no-underline hover:underline"
        :to="{query: queryParams, hash: $route.hash}"
        :class="{
          'py-2': !pageLabelWithMargin,
          'ml-16 pb-4 pt-6': pageLabelWithMargin
        }"
        replace
        @click="copyRoute"
      >
        Page: {{ queryParams.page }}
      </RouterLink>

      <component
        :is="contentComponent || 'div'"
        v-bind="contentComponent ? {items: data?.results ?? [], skeleton: !data?.results} : undefined"
        @update:items="updateItems($event)"
      >
        <TransitionGroup
          v-if="data?.results"
          v-bind="{
            leaveActiveClass: 'slide-leave-active',
            leaveToClass: 'slide-leave-to',
          }"
        >
          <slot
            v-for="(item, index) in data.results"
            :key="keyGetter?.(item, index) ?? index"
            :item="item"
            :setter="getItemSetter(index)"
            :refetch="emitRefetch"
            :skeleton="false"
          />
        </TransitionGroup>

        <template v-else>
          <slot
            v-for="(item, index) in Array(skeletonLength ?? 0).fill(undefined).map((_, i) => ({id: i}))"
            :key="index"
            :item="item"
            :setter="getItemSetter(index)"
            :refetch="emitRefetch"
            :skeleton="true"
          />
        </template>
      </component>
    </template>

    <div
      v-else
      class="py-16 px-8 text-accent text-base font-normal text-center"
    >
      Nothing to show
    </div>
  </div>
</template>

<script lang="ts" setup>
import {toRef, computed, watch, ref, onMounted, nextTick} from 'vue'
import {RouterLink, useRoute, useRouter} from 'vue-router'
import {Notify} from '@/utils/Notify'
import type {QueryParams, UseDefaultQueryFn} from '../models/types'

const props = defineProps<{
  queryParams: QueryParams
  useQueryFn: UseDefaultQueryFn
  isInvalidPage: (error: unknown) => boolean
  isEnabled?: boolean
  contentComponent?: VueComponent
  keyGetter?: (data: unknown, index: number) => string | number
  skeletonLength?: number
  firstPage: boolean
  lastPage: boolean
  hidePageTitle?: boolean
  pageLabelWithMargin?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:count', value: number): void
  (e: 'update:pagesCount', value: number): void
  (e: 'update:nextPage', value: number | null): void
  (e: 'update:previousPage', value: number | null): void
  (e: 'update:scroll', value: number): void
  (e: 'error:invalidPage', value: number): void
  (e: 'refetch'): void
  (e: 'update-from-header:scroll'): void
}>()

const route = useRoute()
const router = useRouter()

const queryParams = toRef(props, 'queryParams')
const element = ref<HTMLElement>()
const isEnabled = computed(() => props.isEnabled ?? true)

const {data, error, setData, refetch} = props.useQueryFn(queryParams, {enabled: isEnabled})

const count = computed(() => data.value?.count)
const pagesCount = computed(() => data.value?.pages_count)
const nextPage = computed(() => data.value?.next)
const previousPage = computed(() => data.value?.previous)

const copyRoute = (): void => {
  navigator.clipboard
    .writeText(location.origin + router.resolve({query: queryParams.value, hash: route.hash}).href)
    .then(() => Notify.success({title: 'Page url copied'}))
}

const getItemSetter = <Item = unknown>(index: number) => {
  return (newItem?: Item): void => {
    if (!data.value) return

    const newData: PaginatedResponse = {
      ...data.value,
      results: [...data.value.results],
    }

    if (newItem) newData.results.splice(index, 1, newItem)
    else newData.results.splice(index, 1)

    setData(newData)
  }
}

const updateItems = <Item = unknown>(items: Item[]): void => {
  if (!data.value) return

  setData({
    ...data.value,
    results: [...items],
  })
}

const emitRefetch = () => {
  emit('refetch')
}

const refetchPage = async () => {
  await refetch.value()

  if (props.lastPage && nextPage.value !== undefined) emit('update:nextPage', nextPage.value)
  if (props.firstPage && previousPage.value !== undefined) emit('update:previousPage', previousPage.value)
}

watch(count, value => {
  if (value !== undefined) emit('update:count', value)
}, {immediate: true})

watch(pagesCount, value => {
  if (value) emit('update:pagesCount', value)
}, {immediate: true})

watch(nextPage, value => {
  if (props.lastPage && value !== undefined) emit('update:nextPage', value)
}, {immediate: true})

watch(previousPage, value => {
  if (props.firstPage && value !== undefined) emit('update:previousPage', value)
}, {immediate: true})

watch(error, (error: unknown): void => {
  if (props.isInvalidPage(error)) emit('error:invalidPage', props.queryParams.page)
}, {immediate: true})

let height = 0

onMounted(async () => {
  height = element.value?.getBoundingClientRect()?.height ?? 0

  if (height === 0) return
  if (!props.firstPage) return
  if (props.lastPage) {
    if (props.queryParams.page !== 1) nextTick().then(() => emit('update-from-header:scroll'))

    return
  }

  emit('update:scroll', height)
})

watch(data, async (_, oldValue) => {
  if (oldValue) return

  await nextTick()

  const newHeight = (element.value?.getBoundingClientRect().height ?? 0) - height

  if (newHeight === 0) return
  if (!props.firstPage) return
  if (props.lastPage) return

  emit('update:scroll', newHeight)
})

defineExpose({
  refetch: refetchPage,
})

</script>
