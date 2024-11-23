import {supportsPassive} from './supportsPassive'

const wheelOpt = supportsPassive ? {passive: false} : false

const eventOptionsMap: Partial<Record<keyof GlobalEventHandlersEventMap | 'mousewheel', boolean | AddEventListenerOptions>> = {
  scroll: false,
  touchmove: wheelOpt,
  wheel: wheelOpt,
  mousewheel: wheelOpt,
  keydown: false,
}

export default class DOMListenerContainer {
  private unlisteners: Array<() => void> = []

  constructor(elements?: Array<Element | Window | Document>, types?: (keyof GlobalEventHandlersEventMap | 'mousewheel')[], listener?: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (!elements || !types || !listener) return

    this.addEventListeners(elements, types, listener, options)
  }

  addEventListener(element: Element | Window | Document, type: keyof GlobalEventHandlersEventMap | 'mousewheel', listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    if (!options) options = eventOptionsMap[type]

    element.addEventListener(type, listener, options)

    this.unlisteners.push((): void => {
      element.removeEventListener(type, listener, options)
    })
  }

  addEventListeners(elements: Array<Element | Window | Document>, types: (keyof GlobalEventHandlersEventMap | 'mousewheel')[], listener: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void {
    elements.forEach(element => {
      types.forEach(type => {
        this.addEventListener(element, type, listener, options)
      })
    })
  }

  destroy(): void {
    this.unlisteners.forEach(unlistener => unlistener())

    this.unlisteners = []
  }
}
