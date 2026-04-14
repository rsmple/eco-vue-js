<template>
  <div
    v-if="!removable || active || flat"
    v-show="active || flat"
    ref="element"
    :class="flat ? 'first-not:mt-12' : 'h-full'"
  >
    <div v-if="flat && title" class="text-accent mb-2 text-xl font-semibold">
      {{ title }}
    </div>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import {nextTick, toRef, useTemplateRef, watch} from 'vue'

import {useUniformState} from '@/components/Uniform/utils/injection'

import {useTabItemActiveListener} from '../use/useTabItemActiveListener'

const props = defineProps<{
  name: string
  title: string | undefined
  active: boolean
  removable: boolean
  enableStatus: boolean
  flat: boolean
}>()

const emit = defineEmits<{
  (e: 'update:height', value: number): void
  (e: 'update:active'): void
}>()

const {hasChanges, hasValue, hasError} = props.enableStatus ? useUniformState() : {}

const {callListeners} = useTabItemActiveListener()

const elementRef = useTemplateRef('element')

const emitHeight = (): void => {
  if (!elementRef.value) return

  emit('update:height', elementRef.value.offsetHeight)
}

watch(() => props.active, async value => {
  if (value) emit('update:active')

  if (value) await nextTick()

  emitHeight()

  if (value) callListeners()
}, {immediate: true})

defineExpose({
  emitHeight,
  name: toRef(props, 'name'),
  hasChanges,
  hasValue,
  hasError,
})
</script>