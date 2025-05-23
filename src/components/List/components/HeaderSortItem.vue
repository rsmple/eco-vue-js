<template>
  <WMenuItem
    :disabled="disabled"
    @click="setOrdering"
  >
    <div class="flex-1 truncate font-normal">
      {{ title }}
    </div>

    <div class="ml-auto flex w-8 items-center justify-between">
      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <IconBack
          v-if="index !== -1"
          class="square-4 transition-transform"
          :class="{
            'rotate-90': ordering[index]?.order === 'ASC',
            '-rotate-90': ordering[index]?.order === 'DESC'
          }"
        />
      </Transition>

      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="index !== -1 && ordering.length > 1"
          class="font-semibold"
        >
          {{ index + 1 }}
        </div>
      </Transition>
    </div>
  </WMenuItem>
</template>

<script lang="ts" setup generic="Field">
import {computed} from 'vue'

import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconBack from '@/assets/icons/default/IconBack.svg?component'

import {Order, type OrderItem} from '@/utils/order'

const props = defineProps<{
  ordering: OrderItem<Field>[]
  field: Field
  title: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:ordering', value: OrderItem<Field>[]): void
}>()

const index = computed(() => props.ordering.findIndex(item => item.field === props.field))

const setOrdering = (): void => {
  const newOrdering: OrderItem<Field>[] = props.ordering.slice()
  
  if (index.value === -1) {
    newOrdering.push({field: props.field, order: Order.DESC})
  } else if (newOrdering[index.value].order === Order.DESC) {
    newOrdering[index.value].order = Order.ASC
  } else {
    newOrdering.splice(index.value, 1)
  }
  
  emit('update:ordering', newOrdering)
}
</script>
