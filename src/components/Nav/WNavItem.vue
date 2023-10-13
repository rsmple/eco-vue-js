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
          <template v-if="!skeleton">
            {{ typeof count === 'number' ? numberCompactFormatter.format(count) : '' }}
          </template>

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

const props = defineProps<{
  icon?: SVGComponent
  to: RouteLocationRaw
  title: string
  count?: number
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

watch(isActive, value => emit('update:isActive', {[props.title]: value}), {immediate: true})

</script>
