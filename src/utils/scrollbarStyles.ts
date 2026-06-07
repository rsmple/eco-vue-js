import {getIsClientSide} from './utils'

export function getScrollbarWidth(): number {
  if (!getIsClientSide()) return 0
  return window.innerWidth - document.documentElement.clientWidth
}

export const appendScrollbarStyles = (): void => {
  if (!getIsClientSide()) return

  setTimeout(() => {
    document.documentElement.style.setProperty('--scroll-bar-width', getScrollbarWidth() + 'px')
  }, 10)
}
