import {HorizontalAlign} from '@/utils/HorizontalAlign'

const EDGE = 20

interface StyleGetter {
  styleGetter(parentRect: DOMRect): Record<string, string>
  marginGetter(parentRect: DOMRect, maxHeightOrWidth: number): number
}

export abstract class VerticalGetter implements StyleGetter {
  abstract isTop: boolean

  abstract styleGetter(parentRect: DOMRect): Record<string, string>

  abstract marginGetter(parentRect: DOMRect, maxHeight: number): number

  heightStyleGetter(parentRect: DOMRect, maxHeight: number): Record<string, string> {
    return {maxHeight: _maxHeightOrWidthGetter(this, parentRect, maxHeight) + 'px'}
  }
}

class BottomInner extends VerticalGetter {
  isTop = false

  styleGetter(parentRect: DOMRect) {
    return {top: parentRect.top + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return window.innerHeight - parentRect.top - maxHeight - EDGE
  }
}

class BottomOuter extends VerticalGetter {
  isTop = false

  styleGetter(parentRect: DOMRect) {
    return {top: parentRect.bottom + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return window.innerHeight - parentRect.bottom - maxHeight - EDGE
  }
}

class VerticalCenter extends VerticalGetter {
  isTop = false

  styleGetter(parentRect: DOMRect) {
    return {top: parentRect.top + parentRect.height / 2 + 'px'}
  }

  marginGetter() {
    return 0
  }

  heightStyleGetter() {
    return {
      height: '0px',
    }
  }
}

class TopOuter extends VerticalGetter {
  isTop = true

  styleGetter(parentRect: DOMRect) {
    return {bottom: window.innerHeight - parentRect.top + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return parentRect.top - maxHeight - EDGE
  }
}

class TopInner extends VerticalGetter {
  isTop = true

  styleGetter(parentRect: DOMRect) {
    return {bottom: window.innerHeight - parentRect.bottom + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return parentRect.bottom - maxHeight - EDGE
  }
}

export abstract class HorizontalGetter implements StyleGetter {
  abstract verticalGetterOrder: Array<VerticalGetter>

  abstract styleGetter(parentRect: DOMRect): Record<string, string>

  abstract marginGetter(parentRect: DOMRect, maxWidth: number): number

  widthStyleGetter(parentRect: DOMRect, maxWidth: number): Record<string, string> {
    return {maxWidth: _maxHeightOrWidthGetter(this, parentRect, maxWidth) + 'px'}
  }
}

export class RightOuter extends HorizontalGetter {
  verticalGetterOrder = [new BottomInner(), new TopInner()]

  styleGetter(parentRect: DOMRect) {
    return {left: parentRect.right + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return document.documentElement.clientWidth - parentRect.right - maxWidth - EDGE
  }
}

export class RightInner extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]

  styleGetter(parentRect: DOMRect) {
    return {left: parentRect.left + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return document.documentElement.clientWidth - parentRect.left - maxWidth - EDGE
  }
}

class RightCenter extends RightOuter {
  verticalGetterOrder = [new VerticalCenter()]
}

class Fill extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]

  styleGetter(parentRect: DOMRect) {
    return {
      left: parentRect.left + 'px',
      right: document.documentElement.clientWidth - parentRect.right + 'px',
    }
  }

  marginGetter() {
    return 0
  }

  widthStyleGetter() {
    return {}
  }
}

class Center extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]

  styleGetter(parentRect: DOMRect) {
    return {
      left: parentRect.left + parentRect.width / 2 + 'px',
    }
  }

  marginGetter() {
    return 0
  }

  widthStyleGetter() {
    return {
      width: '0px',
    }
  }
}

export class LeftInner extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]

  styleGetter(parentRect: DOMRect) {
    return {right: document.documentElement.clientWidth - parentRect.right + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return parentRect.right - maxWidth - EDGE
  }
}

export class LeftOuter extends HorizontalGetter {
  verticalGetterOrder = [new BottomInner(), new TopInner()]

  styleGetter(parentRect: DOMRect) {
    return {right: document.documentElement.clientWidth - parentRect.left + 'px'}
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return parentRect.left - maxWidth - EDGE
  }
}

export class LeftCenter extends LeftOuter {
  verticalGetterOrder = [new VerticalCenter()]
}

export const horizontalGetterOrderMap: Record<HorizontalAlign, HorizontalGetter[]> = {
  [HorizontalAlign.RIGHT_OUTER]: [new RightOuter(), new LeftOuter(), new RightInner(), new LeftInner()],
  [HorizontalAlign.RIGHT_CENTER]: [new RightCenter(), new LeftCenter()],
  [HorizontalAlign.RIGHT_INNER]: [new RightInner(), new LeftInner()],
  [HorizontalAlign.FILL]: [new Fill()],
  [HorizontalAlign.CENTER]: [new Center()],
  [HorizontalAlign.LEFT_INNER]: [new LeftInner(), new RightInner()],
  [HorizontalAlign.LEFT_CENTER]: [new LeftCenter(), new RightCenter()],
  [HorizontalAlign.LEFT_OUTER]: [new LeftOuter(), new RightOuter(), new LeftInner(), new RightInner()],
}

export function searchStyleGetter<T extends StyleGetter>(order: Array<T>, parentRect: DOMRect, maxHeightOrWidth: number): T {
  const margins: Array<number> = []

  return order
    .find(item => {
      const margin = item.marginGetter(parentRect, maxHeightOrWidth)

      margins.push(margin)

      return margin >= 0
    }) ||
    order[margins.indexOf(Math.max(...margins))]
}

function _maxHeightOrWidthGetter(getter: StyleGetter, parentRect: DOMRect, maxHeightOrWidth: number): number {
  const margin = getter.marginGetter(parentRect, maxHeightOrWidth)

  if (margin > 0) return maxHeightOrWidth
  else return maxHeightOrWidth + margin
}
