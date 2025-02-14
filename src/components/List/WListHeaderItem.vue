<template>
  <component
    :is="allowResize ? HeaderItemResizer : 'div'"
    ref="container"
    v-bind="allowResize ? {hasStyles: widthStyle !== undefined} : (undefined as never)"
    class="text-description shrink-0 select-none overflow-hidden pr-6"
    :style="widthStyle ?? widthStyleInner"
    @update:width="$emit('update:width', $event)"
  >
    <component
      :is="disabled ? 'div' : 'button'"
      class="group flex size-full gap-2" 
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
import {type StyleValue, onMounted, ref, toRef, useTemplateRef} from 'vue'

import IconBack from '@/assets/icons/default/IconBack.svg?component'

import {type OrderItem} from '@/utils/order'

import HeaderItemResizer from './components/HeaderItemResizer.vue'
import {useOrdering} from './use/useOrdering'

const props = defineProps<{
  title?: string
  field: Field
  ordering: OrderItem<Field>[]
  disabled?: boolean
  allowResize?: boolean
  itemClass?: string
  widthStyle: StyleValue | undefined
}>()

defineEmits<{
  (e: 'update:width', value: number): void
}>()

const containerRef = useTemplateRef<ComponentInstance<typeof HeaderItemResizer> | HTMLDivElement>('container')

const {index, setOrdering} = useOrdering(toRef(props, 'ordering'), toRef(props, 'field'))

const widthStyleInner = ref<StyleValue>()

onMounted(() => {
  if (!props.allowResize && containerRef.value instanceof HTMLDivElement) {
    widthStyleInner.value = {
      minWidth: containerRef.value.getBoundingClientRect().width + 'px',
    }
  }
})
</script>
