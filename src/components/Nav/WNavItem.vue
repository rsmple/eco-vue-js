<template>
  <RouterLink
    :to="to"
    class="w-ripple w-ripple-hover relative block no-underline"
    :class="{
      'text-primary-default dark:text-primary-dark': isTextColor,
      'text-accent': !isTextColor,
      'pl-2': indent
    }"
  >
    <Transition
      enter-active-class="transition-transform duration-200"
      leave-active-class="transition-transform duration-200"
      enter-from-class="-translate-x-1"
      leave-to-class="-translate-x-1"
    >
      <div
        v-if="!indent && (isActive || hasActive)"
        class="bg-primary-default dark:bg-primary-dark absolute left-0 top-0 h-full w-1"
      />
    </Transition>

    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="indent && !expand && isActive"
        class="absolute left-7 top-0 flex h-full items-center"
      >
        <div class="square-1.5 rounded-full bg-[var(--w-nav-item-dot-color)]" />
      </div>
    </Transition>

    <div class="[overflow:inherit]">
      <div class="grid grid-cols-[1.5rem,1fr,auto] items-center px-4 py-2.5">
        <div class="flex items-center">
          <template v-if="icon ?? routeTo.meta.icon">
            <component
              :is="icon ?? routeTo.meta.icon"
              class="square-5"
            />
          </template>

          <slot
            v-else
            name="icon"
          />
        </div>

        <div class="last-not:pr-1 whitespace-nowrap font-normal tracking-wide">
          <span class="relative">
            <span>
              {{ titleLocal }}
            </span>&nbsp;<span v-if="!skeleton">
              {{ typeof count === 'number' ? `(${numberCompactFormatter.format(count)})` : '' }}

            </span>

            <WSkeleton
              v-else
              class="inline-flex max-w-10"
            />

            <WCounter
              v-if="!skeleton && counter !== undefined && counter !== 0"
              :count="counter"
              :trigger="1"
              class="text-2xs absolute -top-2.5 left-[calc(100%-1em)]"
            />
          </span>
        </div>

        <slot name="right" />
      </div>
    </div>
  </RouterLink>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {computed, onBeforeUnmount, watch} from 'vue'
import {RouterLink, useRoute, useRouter} from 'vue-router'

import WCounter from '@/components/Counter/WCounter.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {isEqualObj, numberCompactFormatter} from '@/utils/utils'

const EXCLUDE_QUERY_FIELDS = ['ordering', 'page']

interface Props extends LinkProps {
  icon?: SVGComponent
  title?: string
  count?: number
  counter?: number
  skeleton?: boolean
  hasActive?: boolean
  expand?: boolean
  indent?: boolean
  queryFields?: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:isActive', value: [string, boolean]): void
}>()

const route = useRoute()
const router = useRouter()

const routeTo = computed(() => router.resolve(props.to))

const titleLocal = computed<string>(() => props.title ?? (typeof routeTo.value.meta.titleShort === 'string' ? routeTo.value.meta.titleShort : typeof routeTo.value.meta.title === 'string' ? routeTo.value.meta.title : ''))

const isActive = computed<boolean>(() => {
  if (routeTo.value?.name !== route.name) return false

  return isEqualObj(route.query, routeTo.value.query, EXCLUDE_QUERY_FIELDS, props.queryFields)
})

const isTextColor = computed(() => props.hasActive ? !props.indent : isActive.value)

watch(isActive, value => emit('update:isActive', [titleLocal.value, value]), {immediate: true})

onBeforeUnmount(() => {
  emit('update:isActive', [titleLocal.value, false])
})
</script>
