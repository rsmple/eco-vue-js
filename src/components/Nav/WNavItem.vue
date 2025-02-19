<template>
  <RouterLink
    :to="to"
    class="w-ripple w-ripple-hover relative block no-underline"
    :class="{
      'text-primary-default dark:text-primary-dark': isTextColor,
      'text-accent': !isTextColor,
      'pl-3': indent
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
      <div class="grid grid-cols-[2rem,auto,1fr,1rem] items-center px-5 py-3">
        <div class="flex items-center">
          <template v-if="icon ?? routeTo.meta.icon">
            <component
              :is="icon ?? routeTo.meta.icon"
              class="square-6"
            />
          </template>

          <slot
            v-else
            name="icon"
          />
        </div>

        <div class="relative whitespace-nowrap text-base font-normal tracking-wide">
          {{ titleLocal }}
        </div>

        <div class="relative flex justify-start text-center text-base font-normal tracking-wide">
          &nbsp;
          <span
            v-if="!skeleton"
            class="relative"
          >
            {{ typeof count === 'number' ? `(${numberCompactFormatter.format(count)})` : '' }}

            <WCounter
              v-if="counter !== undefined && counter !== 0"
              :count="counter"
              :trigger="1"
              small
              class="absolute -top-3"
              :class="{
                'left-[calc(100%-0.25rem)]': !isBigCount,
                'left-[calc(100%-1rem)]': isBigCount,
              }"
            />
          </span>

          <WSkeleton
            v-else
            class="max-w-10"
          />
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

const isBigCount = computed<boolean>(() => props.counter !== undefined && props.counter >= 1000)

watch(isActive, value => emit('update:isActive', [titleLocal.value, value]), {immediate: true})

onBeforeUnmount(() => {
  emit('update:isActive', [titleLocal.value, false])
})
</script>
