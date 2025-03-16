import type {VNode} from 'vue'

export type TooltipMeta = {
  parent: HTMLElement
  slot?: VNode
  text?: string
  key: number
  maxHeight?: number
  left?: boolean
  right?: boolean
}

export type SetTooltipMeta = (meta: TooltipMeta | null) => void

let addTooltip: SetTooltipMeta | undefined

export const initTooltip = (value: SetTooltipMeta | undefined) => {
  addTooltip = value
}

export const Tooltip = {
  add(meta: TooltipMeta): void {
    addTooltip?.(meta)
  },
  close(): void {
    addTooltip?.(null)
  },
}
