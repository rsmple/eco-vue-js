import type {HorizontalAlign} from '@/utils/HorizontalAlign'

export interface DropdownProps {
  horizontalAlign: HorizontalAlign
  top?: boolean
  bottom?: boolean
  parentElement: Pick<Element, 'getBoundingClientRect'>
  updateAlign?: boolean
  emitUpdate?: boolean
}

export type DropdownDefaultSlotScope = {
  isTop: boolean
  isLeft: boolean
  isRight: boolean
}
