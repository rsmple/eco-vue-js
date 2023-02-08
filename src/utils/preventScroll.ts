import DOMListenerContainer from './DOMListenerContainer'
import {supportsPassive} from './supportsPassive'
import {getAllScrollParents} from './utils'

let excludeElementList: Element[] = []

const preventDefault = (event: Event) => {
  if (!event.cancelable) return

  const element = excludeElementList.length && excludeElementList[excludeElementList.length - 1]
  if (element && event.target) {
    if (getAllScrollParents(event.target as Element).includes(element)) {
      return
    }
  }

  event.preventDefault()
}

const keys = {37: 1, 38: 1, 39: 1, 40: 1}

const preventDefaultForKeys = (event: Event) => {
  if (keys[(event as KeyboardEvent).keyCode as keyof typeof keys]) {
    if (excludeElementList.length && event.target) {
      if (excludeElementList[excludeElementList.length - 1] === (event.target as Element)) {
        return
      }
    }

    preventDefault(event)
    return false
  }
}

const listenerContainer = new DOMListenerContainer()
let isEnabledPreventScroll = false

export const enablePreventScroll = (excludeElement: Element[] = []): (() => void) | undefined => {
  let unexclude

  if (excludeElement.length) {
    excludeElementList.push(...excludeElement.filter(element => element.scrollHeight > element.getBoundingClientRect().height))

    unexclude = () => {
      excludeElement.forEach(element => {
        const index = excludeElementList.indexOf(element)
        if (index !== -1) excludeElementList.splice(index, 1)
      })

      if (!excludeElementList.length) disablePreventScroll()
    }
  }

  if (isEnabledPreventScroll) return unexclude

  if (document.scrollingElement) document.body.className = 'no-scrollbar'

  const wheelOpt = supportsPassive ? {passive: false} : false

  listenerContainer.addEventListener(window, 'scroll', preventDefault, false)
  listenerContainer.addEventListener(window, 'touchmove', preventDefault, wheelOpt)
  listenerContainer.addEventListener(window, 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel', preventDefault, wheelOpt)
  listenerContainer.addEventListener(window, 'keydown', preventDefaultForKeys, false)

  isEnabledPreventScroll = true

  return unexclude
}

export const disablePreventScroll = () => {
  if (document.scrollingElement) document.body.className = ''

  excludeElementList = []

  listenerContainer.destroy()

  isEnabledPreventScroll = false
}
