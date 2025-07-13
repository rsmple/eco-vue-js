import {type VNode, markRaw, ref} from 'vue'

export type TooltipMeta = {
  id: string
  parent: HTMLElement
  slot?: VNode
  text?: string
  maxHeight?: number
  left?: boolean
  right?: boolean
}

const tooltipMeta = ref<TooltipMeta | null>(null)

let timeout: NodeJS.Timeout | undefined

const clearTimeoutOnClose = () => {
  if (!timeout) return

  clearTimeout(timeout)
  timeout = undefined
}

export const useTooltipMeta = () => {
  const setTooltipMeta = (meta: TooltipMeta | null) => {
    clearTimeoutOnClose()

    if (!meta) {
      timeout = setTimeout(() => {
        tooltipMeta.value = null
        timeout = undefined
      }, 100)
    } else if (tooltipMeta.value !== meta) {
      if (tooltipMeta.value?.id === meta.id) {
        tooltipMeta.value = markRaw(meta)
      } else {
        timeout = setTimeout(() => {
          tooltipMeta.value = markRaw(meta)
          timeout = undefined
        }, 25)
      }
    }
  }

  const close = () => {
    clearTimeoutOnClose()

    tooltipMeta.value = null
  }

  return {
    tooltipMeta,
    setTooltipMeta,
    close,
  }
}