<template>
  <component
    v-bind="
      tag === 'a' ? {href, target} : to !== undefined ? {to, replace} : undefined
    "
    :is="to !== undefined ? RouterLink : tag"
    class="
      relative rounded-2xl outline-none isolate
      text-base font-medium cursor-pointer select-none whitespace-nowrap
      flex justify-center items-center disabled:cursor-not-allowed disabled:opacity-70
    "
    :class="{
      'p-1.5': minimize,
      'py-2.5 px-6': !minimize,
      [semanticTypeButtonStylesMap[semanticType]]: true,
      'st-outline': outline,
      'w-ripple w-ripple-hover before:text-black-default': !loading && !disabled,
    }"
    :disabled="!loading && disabled"
    :type="type"
    @click="click"
    @keypress.enter.stop.prevent="click"
  >
    <span
      class="transition-opacity flex items-center z-10"
      :class="{'opacity-0': loading}"
    >
      <slot />
    </span>

    <Transition
      enter-active-class="fade-enter-active"
      leave-active-class="fade-leave-active"
      enter-from-class="fade-enter-from"
      leave-to-class="fade-leave-to"
    >
      <WSpinner
        v-if="loading"
        class="absolute z-10"
        :style="{'--spinner-size': minimize ? '1.25rem' : '1.5rem'}"
      />
    </Transition>
  </component>
</template>

<script lang="ts" setup>
import WSpinner from '@/components/Spinner/WSpinner.vue'
import {SemanticType} from '@/utils/SemanticType'
import {type RouteLocationRaw, RouterLink} from 'vue-router'
import {semanticTypeButtonStylesMap} from './models/semanticTypeStylesMap'

const props = withDefaults(
  defineProps<{
    semanticType?: SemanticType
    disabled?: boolean
    loading?: boolean
    tag?: 'a' | 'button'
    type?: string
    to?: RouteLocationRaw
    replace?: boolean
    href?: string
    target?: '_self' | '_blank' | '_parent' | '_top'
    minimize?: boolean
    outline?: boolean
  }>(),
  {
    semanticType: SemanticType.PRIMARY,
    tag: 'button',
    to: undefined,
    type: undefined,
    href: undefined,
    target: undefined,
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent | KeyboardEvent): void
}>()

const click = (event: MouseEvent | KeyboardEvent): void => {
  if (props.disabled || props.loading) return

  emit('click', event)
}

</script>
