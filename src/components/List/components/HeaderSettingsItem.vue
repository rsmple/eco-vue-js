<template>
  <div
    :draggable="isDraggable"
    class="text-description bg-default dark:bg-default-dark grid select-none grid-cols-[1.75rem,1fr,auto]"
    :class="{
      'opacity-[0.001]': isDragging,
      'opacity-50': !fieldConfig.visible && !isDragging,
    }"
    :style="{order}"
    @dragstart="!disabledDrag && startDrag()"
    @dragend="!disabledDrag && endDrag()"
    @dragenter="!isDraggable && $emit('drag:enter', order)"
    @dragover.stop.prevent=""
  >
    <button
      v-if="!disabledDrag"
      class="w-ripple w-ripple-hover relative flex cursor-grab items-center justify-center active:cursor-grabbing"
      @mousedown="initDrag"
    >
      <IconDrag class="rotate-90" />
    </button>

    <div class="col-start-2 self-center truncate px-2 py-1 font-semibold">
      {{ typeof field.title === 'string' ? field.title : field.title(queryParams) }}
    </div>

    <button
      class="w-ripple w-ripple-hover relative flex items-center px-2"
      @click="$emit('update:fields-config-map', {[field.label]: {...fieldConfig, visible: !fieldConfig.visible}})"
    >
      <component
        :is="fieldConfig.visible ? IconEye : IconEyeSlash"
        class="pointer-events-none"
      />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {FieldConfig, ListField} from '../types'

import {ref} from 'vue'

import IconDrag from '@/assets/icons/sax/IconDrag.svg?component'
import IconEye from '@/assets/icons/sax/IconEye.svg?component'
import IconEyeSlash from '@/assets/icons/sax/IconEyeSlash.svg?component'

const props = defineProps<{
  field: ListField<Data, QueryParams>
  fieldConfig: FieldConfig
  queryParams: QueryParams
  disabled?: boolean
  disabledDrag?: boolean
  order: number
}>()

const emit = defineEmits<{
  (e: 'update:fields-config-map', value: Record<string, FieldConfig>): void
  (e: 'drag:start', order: number): void
  (e: 'drag:enter', order: number): void
  (e: 'drag:end'): void
}>()

const isDraggable = ref(false)
const isDragging = ref(false)

const initDrag = () => {
  isDraggable.value = true
}

const startDrag = () => {
  isDragging.value = true

  emit('drag:start', props.order)
}

const endDrag = () => {
  isDraggable.value = false
  isDragging.value = false

  emit('drag:end')
}
</script>