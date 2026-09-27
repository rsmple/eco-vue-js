import type {HorizontalAlign} from '@/utils/HorizontalAlign'

export interface DropdownProps {
  /** Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. */
  horizontalAlign: HorizontalAlign
  /** Prefers opening above the parent. */
  top?: boolean
  /** Always opens below the parent. */
  bottom?: boolean
  /** Element (or range) the dropdown is positioned against. */
  parentElement: Pick<Element, 'getBoundingClientRect'>
  /** Picks the placement again as the parent moves, instead of keeping the first one. */
  updateAlign?: boolean
  /** Emits `update:rect` on scroll and resize instead of following the parent. */
  emitUpdate?: boolean
  /** Classes for the dropdown's content box. Defaults to `w-max`. */
  innerClass?: string
}

export type DropdownDefaultSlotScope = {
  isTop: boolean
  isLeft: boolean
  isRight: boolean
  atBottom: boolean
}
