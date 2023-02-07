<template>
  <component
    :is="to !== undefined ? RouterLink : tag"
    v-bind="to !== undefined ? {to} : undefined"
    class="
      relative flex flex-col md:gap-2 p-2 items-center w-full select-none cursor-pointer no-underline outline-none border-none w-ripple
      hover:text-primary-default dark:hover:text-primary-dark
    "
    :class="{
      'text-description': !active,
      'text-primary-default dark:text-primary-dark': active,
    }"
    @click="$emit('click', $event)"
  >
    <WCounter
      v-if="count !== undefined"
      v-show="count > 0"
      class="absolute top-0 left-[calc(50%-20px)]"
      :count="count"
      :trigger="1"
    />

    <slot name="icon">
      <component
        :is="icon"
        v-if="icon"
        class="square-8"
      />
    </slot>

    <div class="font-normal whitespace-nowrap text-base md:text-base text-[10px]">
      {{ title }}
    </div>
  </component>
</template>

<script lang="ts" setup>
import {type RouteLocationRaw, RouterLink} from 'vue-router'
import WCounter from '@/components/Counter/WCounter.vue'

withDefaults(
  defineProps<{
    icon?: SVGComponent
    title: string
    active?: boolean
    tag?: 'button' | 'a'
    to?: RouteLocationRaw
    count?: number
  }>(),
  {
    icon: undefined,
    tag: 'button',
    to: undefined,
    count: undefined,
  },
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

</script>
