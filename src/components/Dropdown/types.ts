import type {HorizontalAlign} from '@/utils/HorizontalAlign'

export interface DropdownProps {
  maxHeight: number
  maxWidth: number
  horizontalAlign: HorizontalAlign
  parentElement: Element
  updateAlign?: boolean
  emitUpdate?: boolean
}
