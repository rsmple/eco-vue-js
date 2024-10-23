<template>
  <div
    :draggable="isDraggable"
    class="grid grid-cols-[auto,1fr,auto] text-description select-none bg-default dark:bg-default-dark"
    :class="{
      'opacity-[0.001]': isDragging,
      'opacity-50': !fieldConfig.visible && !isDragging,
    }"
    @dragstart="startDrag"
    @dragend="endDrag"
    @dragenter="!isDraggable && $emit('drag:enter')"
    @dragover.stop.prevent=""
  >
    <button
      class="relative w-ripple w-ripple-hover px-2 flex items-center"
      @mousedown="initDrag"
    >
      <IconDrag class="rotate-90" />
    </button>

    <div class="px-2 py-1 self-center font-semibold">
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

defineProps<{
  field: ListField<Data, QueryParams>
  fieldConfig: FieldConfig
  queryParams: QueryParams
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:fields-config-map', value: Record<string, FieldConfig>): void
  (e: 'drag:start'): void
  (e: 'drag:enter'): void
  (e: 'drag:end'): void
}>()

const isDraggable = ref(false)
const isDragging = ref(false)

const initDrag = () => {
  isDraggable.value = true
}

const startDrag = () => {
  isDragging.value = true

  emit('drag:start')
}

const endDrag = () => {
  isDraggable.value = false
  isDragging.value = false

  emit('drag:end')
}

</script>