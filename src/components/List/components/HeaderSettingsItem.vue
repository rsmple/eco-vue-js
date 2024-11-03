<template>
  <div
    :draggable="isDraggable"
    class="grid grid-cols-[1.75rem,1fr,auto] text-description select-none bg-default dark:bg-default-dark"
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
      class="relative w-ripple w-ripple-hover flex items-center justify-center cursor-grab active:cursor-grabbing"
      @mousedown="initDrag"
    >
      <IconDrag class="rotate-90" />
    </button>

    <div class="px-2 py-1 self-center font-semibold col-start-2 truncate">
      {{ typeof field.title === 'string' ? field.title : field.title(queryParams) }}
    </div>

    <button
      class="relative w-ripple w-ripple-hover px-2 flex items-center"
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
import {ref} from 'vue'
import IconDrag from '@/assets/icons/sax/IconDrag.svg?component'
import type {FieldConfig, ListField} from '../types'
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