import {type Ref, computed, ref, watch} from 'vue'

import {debounce} from '@/utils/utils'

type PageComponent = {isFetching: boolean, pageNumber: number | null, refetch: () => void}

export const useRefetchNextPages = <C extends PageComponent>(pageComponent: Ref<C[] | null>) => {
  const isRefetchingAll = ref(false)
  const isFetching = computed(() => pageComponent.value?.some(item => item.isFetching) ?? false)
  let refetchLastPage: number | null = null

  const refetchNextPagesDebounced = debounce((index: number): void => {
    refetchLastPage = null

    for (const item of pageComponent.value ?? []) {
      if (item.pageNumber === null || item.pageNumber < index) continue
      item.refetch()
    }
  }, 50)

  const refetchNextPages = (index: number): void => {
    if (refetchLastPage !== null && index >= refetchLastPage) return

    refetchLastPage = index

    refetchNextPagesDebounced(index)
  }

  const refetchAll = () => {
    isRefetchingAll.value = true

    refetchNextPages(0)
  }

  watch(isFetching, value => {
    if (value) return

    isRefetchingAll.value = false
  }, {immediate: true})

  return {
    isFetching,
    isRefetchingAll,
    refetchNextPages,
    refetchAll,
  }
}
