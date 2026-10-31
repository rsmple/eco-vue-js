import {getIsClientSide} from './utils'

export function getScrollbarWidth(): number {
  if (!getIsClientSide()) return 0
  return window.innerWidth - document.documentElement.clientWidth
}

export function getViewportScrollbarWidth(): number {
  if (!getIsClientSide()) return 0

  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;width:100vw;height:0'
  document.body.append(probe)

  const width = probe.getBoundingClientRect().width - document.documentElement.getBoundingClientRect().width
  probe.remove()

  return Math.max(width, 0)
}

export const appendScrollbarStyles = (): void => {
  if (!getIsClientSide()) return

  setTimeout(() => {
    document.documentElement.style.setProperty('--scroll-bar-width', getScrollbarWidth() + 'px')
    document.documentElement.style.setProperty('--vw-scroll-bar-width', getViewportScrollbarWidth() + 'px')
  }, 10)
}
