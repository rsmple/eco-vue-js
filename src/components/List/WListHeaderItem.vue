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
      :is="allowSort ? 'button' : 'div'"
      class="group flex size-full gap-2 overflow-clip" 
      :class="{
        'cursor-pointer': allowSort,
        [itemClass ?? '']: true,
        'items-center whitespace-nowrap font-semibold': !itemClass,
      }"
      @click="allowSort && setOrdering()"
    >
      <div
        :class="allowSort ? 'group-hover:underline' : undefined"
        class="overflow-hidden"
      >
        <slot>
          {{ title }}
        </slot>
      </div>

      <Transition
        v-if="allowSort"
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
import {type StyleValue, computed, onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

import IconBack from '@/assets/icons/IconBack.svg?component'

import {Order, type OrderItem} from '@/utils/order'

import HeaderItem from './components/HeaderItem.vue'
import HeaderItemResizer from './components/HeaderItemResizer.vue'

const props = defineProps<{
  /** Title of the column. The default slot replaces it. */
  title?: string
  /** Ordering field of the column. Without it, the title isn't a sort button. */
  field: Field
  /** Current ordering, to show the column's direction and position in it. */
  ordering: OrderItem<Field>[]
  /** Turns sorting off. */
  disabled?: boolean
  /** Adds a handle to resize the column. */
  allowResize?: boolean
  /** Class of the title, replacing the default bold one-line style. */
  itemClass?: string
  /** Style of the column, such as its width. */
  styleValue: Record<string, string | undefined>
  /** Whether the column has a width set, for the resize handle. */
  hasWidth: boolean
}>()

const emit = defineEmits<{
  /** The column is being resized to this width. */
  (e: 'update:width', value: number): void
  /** Resizing ended, to save the width. */
  (e: 'save:width'): void
  /** The title was clicked: descending, then ascending, then off. Other columns stay in the ordering after it. */
  (e: 'update:ordering', value: OrderItem<Field>[]): void
}>()

defineSlots<{
  /** Title of the column, replacing `title`. */
  default?: () => void
}>()

const allowSort = computed(() => !props.disabled && !!props.field)

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

let observer: ResizeObserver | null = null

onMounted(() => {
  if (props.allowResize || !(containerRef.value instanceof HTMLDivElement)) return

  const target = containerRef.value

  observer = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return

    const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
    widthStyleInner.value = {minWidth: width + 'px'}
    observer?.disconnect()
    observer = null
  })

  observer.observe(target)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>
