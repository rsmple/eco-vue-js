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
    const update = () => {
      document.documentElement.style.setProperty('--scroll-bar-width', getScrollbarWidth() + 'px')
      document.documentElement.style.setProperty('--vw-scroll-bar-width', getViewportScrollbarWidth() + 'px')
    }

    // The scrollbar comes and goes with the page's height, often after the app starts. A fixed box spans the viewport
    // without the scrollbar, so it resizes only when the scrollbar or the window does, not with every change of the
    // page's height as the root would.
    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.style.cssText = 'position:fixed;top:0;left:0;right:0;height:0;visibility:hidden;pointer-events:none'
    document.body.append(sentinel)

    new ResizeObserver(update).observe(sentinel)
  }, 10)
}
