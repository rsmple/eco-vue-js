<template>
  <component
    :is="to !== undefined ? RouterLink : tag"
    v-bind="to !== undefined ? {to} : undefined"
    class="
      relative flex flex-col md:gap-2 p-2 items-center w-full select-none cursor-pointer no-underline outline-none border-none w-ripple w-ripple-hover
    "
    :class="{
      'text-primary-default dark:text-primary-dark': active && semanticType === SemanticType.SECONDARY,
      [outline ? semanticTypeOutlineStylesMap[semanticType] : semanticTypeStylesMap[semanticType]]: true,
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
      <template v-if="icon">
        <component
          :is="icon"
          class="square-8"
        />
      </template>
    </slot>

    <div class="font-normal text-center md:text-base text-[0.625rem] whitespace-nowrap">
      {{ title }}
    </div>
  </component>
</template>

<script lang="ts" setup>
import {RouterLink} from 'vue-router'
import WCounter from '@/components/Counter/WCounter.vue'
import {SemanticType} from '@/utils/SemanticType'
import type {LinkProps} from '@/types/types'

const semanticTypeStylesMap: Record<SemanticType, string> = {
  [SemanticType.SECONDARY]: 'text-description bg-default dark:bg-default-dark hover:text-primary-default dark:hover:text-primary-dark',
  [SemanticType.PRIMARY]: 'text-default dark:text-default-dark bg-primary-default dark:bg-primary-dark',
  [SemanticType.POSITIVE]: 'text-default dark:text-default-dark bg-positive dark:bg-positive-dark',
  [SemanticType.WARNING]: 'text-default dark:text-default-dark bg-warning dark:bg-warning-dark',
  [SemanticType.NEGARIVE]: 'text-default dark:text-default-dark bg-negative dark:bg-negative-dark',
  [SemanticType.INFO]: 'text-default dark:text-default-dark bg-info dark:bg-info-dark',
}

const semanticTypeOutlineStylesMap: Record<SemanticType, string> = {
  [SemanticType.SECONDARY]: 'text-description bg-default dark:bg-default-dark hover:text-primary-default dark:hover:text-primary-dark',
  [SemanticType.PRIMARY]: 'text-primary-default text-primary-dark',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.NEGARIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}

interface Props extends LinkProps {
  icon?: SVGComponent
  title: string
  active?: boolean
  tag?: 'button' | 'a'
  count?: number
  semanticType?: SemanticType
  outline?: boolean
}

withDefaults(
  defineProps<Props>(),
  {
    icon: undefined,
    tag: 'button',
    to: undefined,
    count: undefined,
    semanticType: SemanticType.SECONDARY,
  },
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

</script>
