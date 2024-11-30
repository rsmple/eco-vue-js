<template>
  <component
    :is="allowResize ? HeaderItemResizer : 'div'"
    v-bind="allowResize ? {hasStyles: widthStyle !== undefined} : (undefined as never)"
    class="text-description select-none pr-6"
    :style="widthStyle"
    @update:width="$emit('update:width', $event)"
  >
    <component
      :is="disabled ? 'div' : 'button'"
      class="group flex size-full gap-2" 
      :class="{
        'cursor-pointer': !disabled,
        [itemClass ?? '']: true,
        'items-center overflow-hidden whitespace-nowrap font-semibold': !itemClass,
      }"
      @click="setOrdering"
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
import {type StyleValue, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'

import IconBack from '@/assets/icons/default/IconBack.svg?component'

import {Order, type OrderItem, encodeOrdering} from '@/utils/order'

import HeaderItemResizer from './components/HeaderItemResizer.vue'

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

const route = useRoute()
const router = useRouter()

const index = computed(() => props.ordering.findIndex(item => item.field === props.field))

const updateQuery = (newOrdering: OrderItem<Field>[]): void => {
  const newOrderingValue = encodeOrdering(newOrdering)

  if (route.query.ordering === newOrderingValue) return

  router.replace({
    query: {
      ...route.query,
      ordering: newOrderingValue,
    },
  })
}

const setOrdering = (): void => {
  if (props.disabled) return

  const newOrdering: OrderItem<Field>[] = props.ordering.slice()

  if (index.value === -1) {
    newOrdering.push({field: props.field, order: Order.ASC})
  } else if (newOrdering[index.value].order === Order.ASC) {
    newOrdering[index.value].order = Order.DESC
  } else {
    newOrdering.splice(index.value, 1)
  }

  updateQuery(newOrdering)
}
</script>
