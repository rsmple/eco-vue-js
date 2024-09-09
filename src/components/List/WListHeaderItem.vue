<template>
  <div
    class="w-list-header-item flex gap-2 select-none items-center text-description font-semibold h-11"
    :class="{
      'cursor-pointer': !disabled,
    }"
    @click="setOrdering"
  >
    <div
      class="whitespace-nowrap"
      :class="{
        'hover:underline': !disabled,
      }"
    >
      <slot>
        {{ title }}
      </slot>
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="index !== -1"
        class="flex gap-1 w-7 items-center"
      >
        <IconBack
          class="w-4 h-4 transition-transform"
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
  </div>
</template>

<script lang="ts" setup generic="Field">
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import IconBack from '@/assets/icons/default/IconBack.svg?component'
import {encodeOrdering, Order, type OrderItem} from '@/utils/order'

const props = defineProps<{
  title?: string
  field: Field
  ordering: OrderItem<Field>[]
  disabled?: boolean
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
