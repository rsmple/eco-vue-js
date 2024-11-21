<template>
  <div ref="indicator" />

  <div
    ref="header"
    class="sticky top-[var(--header-height)]"
    :class="{
      'z-20': !isIntersecting,
    }"
  >
    <slot name="header" />
  </div>

  <slot v-bind="{headerTop, headerHeight}" />
</template>

<script lang="ts" setup>
import {onBeforeUnmount, watch} from 'vue'
import {useInfiniteListHeader} from './use/useInfiniteListHeader'

const props = withDefaults(
  defineProps<{
    headerMargin?: number
    scrollingElement?: Element | null
    initIsIntersecting?: boolean
  }>(),
  {
    headerMargin: 0,
    scrollingElement: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:header-padding', value: number): void
}>()

const updateHeaderPadding = (value: number): void => {
  emit('update:header-padding', value)
}

const {indicator, header, headerTop, headerHeight, isIntersecting} = useInfiniteListHeader(props.scrollingElement, props.initIsIntersecting)

watch(isIntersecting, value => {
  if (!value && headerHeight.value) {
    updateHeaderPadding(headerHeight.value - props.headerMargin)
  } else {
    updateHeaderPadding(0)
  }
})

onBeforeUnmount(() => {
  updateHeaderPadding(0)
})

</script>
