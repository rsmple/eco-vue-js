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
      <div class="grid grid-cols-[2.5rem,1fr,3rem] items-center py-4 px-5">
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
          
          <WCounter
            v-if="counter !== undefined && counter !== 0 && count === undefined"
            :count="counter"
            :trigger="1"
            small
            class="absolute -top-3"
            :class="{
              'left-[calc(100%-0.25rem)]': !isBigCount,
              'left-[calc(100%-1rem)]': isBigCount,
            }"
          />
        </div>

        <div class="text-base font-normal tracking-wide text-center flex justify-center">
          <span
            v-if="!skeleton"
            class="relative"
          >
            {{ typeof count === 'number' ? numberCompactFormatter.format(count) : '' }}

            <WCounter
              v-if="counter !== undefined && counter !== 0 && count !== undefined"
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
import {computed, onUnmounted, watch} from 'vue'
import {RouterLink, useRoute, useRouter} from 'vue-router'
import {isEqualObj, numberCompactFormatter} from '@/utils/utils'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WCounter from '@/components/Counter/WCounter.vue'
import type {LinkProps} from '@/types/types'

interface Props extends LinkProps {
  icon?: SVGComponent
  title: string
  count?: number
  counter?: number
  noQuery?: boolean
  skeleton?: boolean
  hasActive?: boolean
}

const props = defineProps<Props>()

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

onUnmounted(() => {
  emit('update:isActive', {[props.title]: false})
})

</script>
