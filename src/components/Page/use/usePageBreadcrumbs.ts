import {readonly, ref} from 'vue'

const breadcrumbs = ref<Record<string, number>>({})
const breadcrumbsUpdateMap = ref<Record<string, () => void>>({})
const breadcrumbsScrollToMap = ref<Record<string, () => void>>({})
const active = ref<number | null>(null)

export const usePageBreadcrumbs = () => {
  const resetBreadcrumbs = () => {
    breadcrumbs.value = {}
    breadcrumbsUpdateMap.value = {}
    active.value = null
  }

  const scrollTo = (title: string) => {
    breadcrumbsScrollToMap.value[title]?.()
  }

  return {
    resetBreadcrumbs,
    scrollTo,
    breadcrumbs: readonly(breadcrumbs),
    active: readonly(active),
  }
}

export const usePageBreadcrumb = () => {
  const setBreadcrumb = (title: string, index: number, update: () => void, scrollTo: () => void) => {
    breadcrumbs.value[title] = index
    breadcrumbsUpdateMap.value[title] = update
    breadcrumbsScrollToMap.value[title] = scrollTo
  }

  const resetBreadcrumb = (title: string) => {
    delete breadcrumbs.value[title]
    delete breadcrumbsUpdateMap.value[title]
    delete breadcrumbsScrollToMap.value[title]
  }

  const updateBreadcrumbs = () => {
    Object.values(breadcrumbsUpdateMap.value).forEach(item => item())
  }

  const setActive = (value: number) => {
    active.value = value
  }

  return {
    setBreadcrumb,
    resetBreadcrumb,
    updateBreadcrumbs,
    setActive,
  }
}
