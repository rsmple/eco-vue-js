import type {InjectionKey, Ref} from 'vue'

export const wInfiniteListSelection = Symbol('wInfiniteListSelection') as InjectionKey<{
  allowSelect?: Ref<boolean>
  allowSelectRange?: Ref<boolean>
  allowSelectHover?: Ref<boolean>
  selectedCount?: Ref<number>

  clearSelected?(): void
}>

export const wInfiniteListSelectionItem = Symbol('wInfiniteListSelectionItem') as InjectionKey<{
  selected?: Ref<boolean>
  selectedBetween?: Ref<boolean>

  updateSelected?(value: boolean): void
  updateSelectedRange?(): void
  updateSelectedRangeHover?(): void
}>
