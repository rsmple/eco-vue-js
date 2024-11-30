import type InfiniteListPage from './components/InfiniteListPage.vue'

import {ref} from 'vue'

import {debounce} from '@/utils/utils'

export const useRefetchNextPages = () => {
  const pageComponent = ref<ComponentInstance<typeof InfiniteListPage>[]>([])
  let refetchLastPage: number | null = null

  const refetchNextPagesDebounced = debounce((index: number): void => {
    refetchLastPage = null

    let pageList

    if (index === 0) {
      pageList = pageComponent.value
    } else {
      pageList = pageComponent.value?.slice(index - 1).reverse()
    }

    pageList?.forEach(item => {
      item.refetch()
    })
  }, 50)

  const refetchNextPages = (index: number): void => {
    if (refetchLastPage !== null && index >= refetchLastPage) return

    refetchLastPage = index

    refetchNextPagesDebounced(index)
  }

  return {
    pageComponent,
    refetchNextPages,
  }
}
