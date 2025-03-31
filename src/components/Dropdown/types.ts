import type {HorizontalAlign} from '@/utils/HorizontalAlign'

export interface DropdownProps {
  maxHeight: number
  maxWidth: number
  horizontalAlign: HorizontalAlign
  parentElement: Element
  updateAlign?: boolean
  emitUpdate?: boolean
}

export type DropdownDefaultSlotScope = {
  left: string
  right: string
  top: string
  bottom: string
  isTop: boolean
  isLeft: boolean
  isRight: boolean
}
