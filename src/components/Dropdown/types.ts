import type {OriginX, OriginY} from './utils/DropdownStyle'
import type {HorizontalAlign} from '@/utils/HorizontalAlign'

export interface DropdownProps {
  maxHeight: number
  maxWidth: number
  horizontalAlign: HorizontalAlign
  top?: boolean
  bottom?: boolean
  parentElement: Pick<Element, 'getBoundingClientRect'>
  updateAlign?: boolean
  emitUpdate?: boolean
}

export type DropdownDefaultSlotScope = {
  x: number
  y: number
  originX: OriginX
  originY: OriginY
  isTop: boolean
  isLeft: boolean
  isRight: boolean
}
