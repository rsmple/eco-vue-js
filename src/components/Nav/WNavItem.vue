<template>
  <RouterLink
    :to="to"
    class="relative no-underline block w-ripple w-ripple-hover"
    :class="{
      'text-primary-default dark:text-primary-dark': isActive || hasActive,
      'text-accent': !isActive && !hasActive,
    }"
  >
    <div class="[overflow:inherit]">
      <div class="flex items-center py-4 px-5">
        <div class="h-full w-10 flex items-center">
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

        <div class="h-6 text-base font-normal tracking-wide mr-auto whitespace-nowrap">
          {{ title }}
        </div>

        <div
          v-if="count !== undefined"
          class="h-6 text-base font-normal tracking-wide w-12 text-center flex justify-center"
        >
          <span
            v-if="!skeleton"
            class="relative"
          >
            {{ typeof count === 'number' ? numberCompactFormatter.format(count) : '' }}

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

          <WSkeleton v-else />
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script lang="ts" setup>
import {computed, watch} from 'vue'
import {RouterLink, useRoute, useRouter, type RouteLocationRaw} from 'vue-router'
import {isEqualObj, numberCompactFormatter} from '@/utils/utils'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WCounter from '@/components/Counter/WCounter.vue'

const props = defineProps<{
  icon?: SVGComponent
  to: RouteLocationRaw
  title: string
  count?: number
  counter?: number
  noQuery?: boolean
  skeleton?: boolean
  hasActive?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isActive', value: Record<string, boolean>): void
}>()

const route = useRoute()
const router = useRouter()

const routeTo = computed(() => router.resolve(props.to))

const isActive = computed<boolean>(() => {
  if (routeTo.value?.name !== route.name) return false

  return isEqualObj(route.query, routeTo.value.query, ['ordering', 'page'])
})

const isBigCount = computed<boolean>(() => props.counter !== undefined && props.counter >= 1000)

watch(isActive, value => emit('update:isActive', {[props.title]: value}), {immediate: true})

</script>
