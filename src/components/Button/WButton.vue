<template>
  <WSkeleton
    v-if="isSkeleton"
    class="w-skeleton-rounded-[--w-button-rounded,1rem] w-skeleton-w-max -w-skeleton-h--button-height"
  >
    <div class="flex gap-2 px-[--w-button-rounded,1rem] font-medium opacity-0">
      <slot />
    </div>
  </WSkeleton>

  <component
    v-bind="{
      class: $attrs.class,
      style: $attrs.style as StyleValue,
      ...(isDisabled
        ? {}
        : tag === 'a'
          ? {href, target}
          : to !== undefined
            ? {to, replace}
            : {})
    }"
    :is="to !== undefined ? isDisabled ? 'a' : WRouterLink : tag"
    v-else
    ref="container"
    class="
      w-ripple-rounded-[calc(var(--w-button-rounded,1rem)-var(--w-button-border,1px))] -min-h--button-height relative isolate
      flex select-none items-center
      justify-center whitespace-nowrap rounded-[--w-button-rounded,1rem]
      px-[--w-button-rounded,1rem] font-medium outline-none [border-width:--w-button-border,1px]
    "
    :class="{
      [semanticTypeButtonBackgroundMap[semanticType] ?? semanticTypeBackgroundMap[semanticType]]: !outline,
      [semanticTypeBorderMap[semanticType]]: true,
      'w-ripple w-ripple-hover before:text-black-default w-ripple-opacity-20 dark:w-ripple-opacity-30 cursor-pointer': !loading && !isDisabled,
      'cursor-progress': loading,
      'cursor-not-allowed opacity-70': isDisabled,
      'first-not:rounded-l-none first-not:border-l-0 first-not:before:rounded-l-none last-not:rounded-r-none last-not:border-r-0 last-not:before:rounded-r-none': join
    }"
    :disabled="!loading && isDisabled"
    :download="download"
    :type="type"
    @click="click"
    @keypress.enter.stop.prevent="click"
    @mousedown="mousedown"
  >
    <div
      class="z-10 flex flex-1 items-center justify-center gap-2"
      :class="{
        'opacity-0': loading,
      }"
    >
      <slot />
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <WSpinner
        v-if="loading"
        class="w-spinner-size-[--w-button-spinner-size,1.5rem] absolute z-10"
      />
    </Transition>

    <WTooltip
      v-if="tooltipText"
      :text="tooltipText"
    />

    <WShine v-if="!isDisabled && !loading" />

    <template v-if="!noBorderComponent && (borderComponent ?? semanticTypeBorderComponentMap[semanticType])">
      <component :is="borderComponent ?? semanticTypeBorderComponentMap[semanticType]" />
    </template>
  </component>
</template>

<script lang="ts" setup>
import type {ButtonProps} from './types'

import {type StyleValue, computed, nextTick, onMounted, useTemplateRef, watch} from 'vue'

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WShine from '@/components/Shine/WShine.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {SemanticType, useSemanticTypeBackgroundMap, useSemanticTypeBorderComponentMap, useSemanticTypeBorderMap, useSemanticTypeButtonBackgroundMap} from '@/utils/SemanticType'
import {useComponentStatesButton} from '@/utils/useComponentStates'

import WSkeleton from '../Skeleton/WSkeleton.vue'
import {useTabActiveListener} from '../Tabs/use/useTabActiveListener'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<ButtonProps>(),
  {
    semanticType: SemanticType.PRIMARY,
    tag: 'button',
    to: undefined,
    type: undefined,
    href: undefined,
    target: undefined,
    semanticTypeMap: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const containerRef = useTemplateRef<HTMLElement | ComponentInstance<typeof WRouterLink>>('container')

const {isDisabled, isSkeleton} = useComponentStatesButton(props)

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()
const semanticTypeButtonBackgroundMap = useSemanticTypeButtonBackgroundMap()
const semanticTypeBorderMap = useSemanticTypeBorderMap()
const semanticTypeBorderComponentMap = useSemanticTypeBorderComponentMap()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent | KeyboardEvent): void
  (e: 'mousedown', event: MouseEvent | KeyboardEvent): void
}>()

const click = (event: MouseEvent | KeyboardEvent): void => {
  if (isDisabled.value || props.loading) return

  emit('click', event)
}

const mousedown = (event: MouseEvent): void => {
  if (isDisabled.value || props.loading) return

  emit('mousedown', event)
}

const isNotEnabled = computed(() => isDisabled.value || isSkeleton.value)

const focus = () => {
  if (isNotEnabled.value || !containerRef.value) return

  if (containerRef.value instanceof HTMLElement) containerRef.value?.focus()
  else if ('$el' in containerRef.value && containerRef.value.$el instanceof HTMLElement) containerRef.value.$el.focus()
}

let timeout: NodeJS.Timeout | undefined

const autofocusDebounced = () => {
  if (timeout) clearTimeout(timeout)

  timeout = setTimeout(() => {
    if (props.autofocus) focus()

    timeout = undefined
  }, 250)
}

if (props.autofocus) {
  useTabActiveListener(autofocusDebounced)
}

watch(() => props.autofocus, value => {
  if (!value) return

  nextTick(autofocusDebounced)
})

watch(isNotEnabled, value => {
  if (!value) return

  nextTick(autofocusDebounced)
})

onMounted(() => {
  if (props.autofocus) autofocusDebounced()
})
</script>
