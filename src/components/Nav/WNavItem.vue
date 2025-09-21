<template>
  <WRouterLink
    :to="to"
    class="w-ripple-trigger relative block py-1 no-underline"
    :class="{
      'text-primary dark:text-primary-dark': isTextColor,
      'text-accent': !isTextColor,
      'px-1': even,
      'xl-not:pr-1 pl-2': !even,
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
        class="bg-primary dark:bg-primary-dark absolute left-0 top-0 h-full w-1"
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
      <div
        class="w-ripple w-ripple-hover relative grid grid-cols-[1.5rem,1fr,auto] items-center rounded-lg pr-2"
        :class="{
          'before:opacity-10': hovered,
          'pl-4': indent,
          'pl-2': !indent,
        }"
      >
        <div class="flex items-center">
          <template v-if="icon ?? routeTo?.meta?.icon">
            <component
              :is="icon ?? routeTo?.meta?.icon"
              class="square-[1.25em]"
            />
          </template>

          <slot
            v-else
            name="icon"
          />
        </div>

        <div class="last-not:pr-1 whitespace-nowrap font-normal">
          <span class="relative">
            <span class="tracking-wide">
              <span class="leading-loose">
                {{ titleLocal }}
              </span>&nbsp;<span v-if="!skeleton">
                {{ typeof count === 'number' ? `(${numberCompactFormatter.format(count)})` : '' }}
              </span>

              <WSkeleton
                v-else
                class="inline-flex max-w-10"
              />
            </span>

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
  </WRouterLink>
</template>

<script lang="ts" setup>
import type {NavItemProps} from './types'

import {computed} from 'vue'
import {useRoute} from 'vue-router'

import WCounter from '@/components/Counter/WCounter.vue'
import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {useOptionalRouter} from '@/composables/useOptionalRouter'
import {isEqualObj, numberCompactFormatter} from '@/utils/utils'

const EXCLUDE_QUERY_FIELDS = ['ordering', 'page']

const props = defineProps<NavItemProps>()

const route = useRoute()
const router = useOptionalRouter()

const routeTo = computed(() => router.resolve(props.to))

const isActive = computed<boolean>(() => {
  if (!route) return false
  if (routeTo.value?.name !== route?.name) return false

  return isEqualObj(route.query, routeTo.value.query ?? {}, EXCLUDE_QUERY_FIELDS, props.queryFields)
})

const titleLocal = computed<string>(() => props.title ?? (typeof routeTo.value?.meta?.titleShort === 'string' ? routeTo.value.meta.titleShort : typeof routeTo.value?.meta?.title === 'string' ? routeTo.value.meta.title : ''))

const isTextColor = computed(() => props.hasActive ? !props.indent : isActive.value)

defineExpose({
  isActive,
})
</script>
