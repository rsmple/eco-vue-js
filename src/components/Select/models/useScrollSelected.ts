import {ref, watch} from 'vue'

/**
 * Scrolls a select's menu to the first option that shows as selected, once the menu opens without a search —
 * until a search is typed or an option is picked, which sets `isScrollSelected` to `false`.
 * Options report with `scroll:selected` while `isScrollSelected` is set, and only the first one is taken.
 */
export const useScrollSelected = (isOpen: () => boolean, search: () => string | undefined) => {
  const isScrollSelected = ref(false)

  watch(isOpen, value => {
    isScrollSelected.value = value && !search()
  }, {immediate: true})

  watch(search, value => {
    if (value) isScrollSelected.value = false
  })

  /** Scrolls to the option that reported, if it is the first one. Returns whether it was. */
  const takeSelected = (scroll: () => void): boolean => {
    if (!isScrollSelected.value) return false

    isScrollSelected.value = false

    scroll()

    return true
  }

  return {isScrollSelected, takeSelected}
}
