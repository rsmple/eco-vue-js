import {type Ref, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'

import {Order, type OrderItem, encodeOrdering} from '@/utils/order'

export const useOrdering = <Field>(ordering: Ref<OrderItem<Field>[]>, field: Ref<Field>) => {
  const route = useRoute()
  const router = useRouter()

  const index = computed(() => ordering.value.findIndex(item => item.field === field.value))

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
    const newOrdering: OrderItem<Field>[] = ordering.value.slice()
  
    if (index.value === -1) {
      newOrdering.push({field: field.value, order: Order.DESC})
    } else if (newOrdering[index.value].order === Order.DESC) {
      newOrdering[index.value].order = Order.ASC
    } else {
      newOrdering.splice(index.value, 1)
    }
  
    updateQuery(newOrdering)
  }

  return {
    index,
    setOrdering,
  }
}
