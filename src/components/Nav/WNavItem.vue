<template>
  <RouterLink
    :to="to"
    class="relative no-underline block w-ripple w-ripple-hover"
    :class="{
      'text-primary-default dark:text-primary-dark': isActive || hasActive,
      'text-accent': !isActive && !hasActive,
      'pl-7': indent
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
        class="bg-primary-default dark:bg-primary-dark w-1 h-full absolute left-0 top-0"
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
        class="h-full absolute left-7 top-0 w-1.5 grid items-center"
      >
        <div class="bg-primary-default dark:bg-primary-dark aspect-square rounded-full" />
      </div>
    </Transition>

    <div class="[overflow:inherit]">
      <div class="grid grid-cols-[2rem,auto,1fr,1rem] items-center py-4 px-5">
        <div class="flex items-center">
          <template v-if="icon">
            <component
              :is="icon"
              class="square-6"
            />
          </template>

          <slot
            v-else
            name="icon"
          />
        </div>

        <div class="text-base font-normal tracking-wide whitespace-nowrap relative">
          {{ title }}
        </div>

        <div class="text-base font-normal tracking-wide text-center flex justify-start relative">
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
import {computed, onBeforeUnmount, watch} from 'vue'
import {RouterLink, useRoute, useRouter} from 'vue-router'
import {isEqualObj, numberCompactFormatter} from '@/utils/utils'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WCounter from '@/components/Counter/WCounter.vue'
import type {LinkProps} from '@/types/types'

const EXCLUDE_QUERY_FIELDS = ['ordering', 'page']

interface Props extends LinkProps {
  icon?: SVGComponent
  title: string
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

const isActive = computed<boolean>(() => {
  if (routeTo.value?.name !== route.name) return false

  return isEqualObj(route.query, routeTo.value.query, EXCLUDE_QUERY_FIELDS, props.queryFields)
})

const isBigCount = computed<boolean>(() => props.counter !== undefined && props.counter >= 1000)

watch(isActive, value => emit('update:isActive', [props.title, value]), {immediate: true})

onBeforeUnmount(() => {
  emit('update:isActive', [props.title, false])
})

</script>
