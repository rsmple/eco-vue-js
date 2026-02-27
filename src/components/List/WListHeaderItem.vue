<template>
  <component
    :is="allowResize ? HeaderItemResizer : HeaderItem"
    ref="container"
    v-bind="allowResize ? {
      hasWidth,
      'onSave:width': () => $emit('save:width'),
    } : (undefined as never)"
    class="text-description last-not:pr-3 first-not:pl-3 shrink-0 select-none overflow-hidden"
    :style="[widthStyleInner, styleValue]"
    @update:width="$emit('update:width', $event)"
  >
    <component
      :is="disabled ? 'div' : 'button'"
      class="group flex size-full gap-2 overflow-clip" 
      :class="{
        'cursor-pointer': !disabled,
        [itemClass ?? '']: true,
        'items-center whitespace-nowrap font-semibold': !itemClass,
      }"
      @click="!disabled && setOrdering()"
    >
      <div
        :class="{
          'group-hover:underline': !disabled,
        }"
      >
        <slot>
          {{ title }}
        </slot>
      </div>

      <Transition
        v-if="!disabled"
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="index !== -1"
          class="flex items-center gap-1"
        >
          <IconBack
            class="square-3 transition-transform"
            :class="{
              'rotate-90': ordering[index]?.order === 'ASC',
              '-rotate-90': ordering[index]?.order === 'DESC',
            }"
          />

          <div v-if="ordering.length > 1">
            {{ index + 1 }}
          </div>
        </div>
      </Transition>
    </component>
  </component>
</template>

<script lang="ts" setup generic="Field">
import {type StyleValue, computed, onMounted, ref, useTemplateRef} from 'vue'

import IconBack from '@/assets/icons/IconBack.svg?component'

import {Order, type OrderItem} from '@/utils/order'

import HeaderItem from './components/HeaderItem.vue'
import HeaderItemResizer from './components/HeaderItemResizer.vue'

const props = defineProps<{
  title?: string
  field: Field
  ordering: OrderItem<Field>[]
  disabled?: boolean
  allowResize?: boolean
  itemClass?: string
  styleValue: Record<string, string | undefined>
  hasWidth: boolean
}>()

const emit = defineEmits<{
  (e: 'update:width', value: number): void
  (e: 'save:width'): void
  (e: 'update:ordering', value: OrderItem<Field>[]): void
}>()

const containerRef = useTemplateRef<ComponentInstance<typeof HeaderItemResizer> | HTMLDivElement>('container')

const index = computed(() => props.ordering.findIndex(item => item.field === props.field))

const setOrdering = (): void => {
  const newOrdering: OrderItem<Field>[] = props.ordering.slice()
  
  if (index.value === -1) {
    newOrdering.push({field: props.field, order: Order.DESC})
  } else if (newOrdering[index.value]!.order === Order.DESC) {
    newOrdering[index.value]!.order = Order.ASC
  } else {
    newOrdering.splice(index.value, 1)
  }
  
  emit('update:ordering', newOrdering)
}

const widthStyleInner = ref<StyleValue>()

onMounted(() => {
  if (!props.allowResize && containerRef.value instanceof HTMLDivElement) {
    widthStyleInner.value = {
      minWidth: containerRef.value.getBoundingClientRect().width + 'px',
    }
  }
})
</script>
