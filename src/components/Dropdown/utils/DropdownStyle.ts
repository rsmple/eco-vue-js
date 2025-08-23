import {HorizontalAlign} from '@/utils/HorizontalAlign'

const EDGE = 20

interface StyleGetter {
  styleGetter(parentRect: DOMRect): number
  marginGetter(parentRect: DOMRect, maxHeightOrWidth: number): number
}

export enum OriginY {
  TOP = 'content-start',
  BOTTOM = 'content-end',
  CENTER = 'content-center',
}

export abstract class VerticalGetter implements StyleGetter {
  abstract isTop: boolean
  abstract origin: OriginY

  abstract styleGetter(parentRect: DOMRect): number

  abstract marginGetter(parentRect: DOMRect, maxHeight: number): number

  heightStyleGetter(parentRect: DOMRect, maxHeight: number): number | undefined {
    return _maxHeightOrWidthGetter(this, parentRect, maxHeight)
  }
}

class BottomInner extends VerticalGetter {
  isTop = false
  origin = OriginY.TOP

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.top)
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return Math.round(window.innerHeight - parentRect.top - maxHeight - EDGE)
  }
}

class BottomOuter extends VerticalGetter {
  isTop = false
  origin = OriginY.TOP

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.bottom)
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return Math.round(window.innerHeight - parentRect.bottom - maxHeight - EDGE)
  }
}

class VerticalCenter extends VerticalGetter {
  isTop = false
  origin = OriginY.CENTER

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.top + parentRect.height / 2)
  }

  marginGetter() {
    return 0
  }

  heightStyleGetter() {
    return undefined
  }
}

class TopOuter extends VerticalGetter {
  isTop = true
  origin = OriginY.BOTTOM

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.top)
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return Math.round(parentRect.top - maxHeight - EDGE)
  }
}

class TopInner extends VerticalGetter {
  isTop = true
  origin = OriginY.BOTTOM

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.bottom)
  }

  marginGetter(parentRect: DOMRect, maxHeight: number) {
    return Math.round(parentRect.bottom - maxHeight - EDGE)
  }
}

export enum OriginX {
  LEFT = 'justify-start',
  RIGHT = 'justify-end',
  CENTER = 'justify-center',
}

export abstract class HorizontalGetter implements StyleGetter {
  abstract origin: OriginX

  abstract verticalGetterOrder: Array<VerticalGetter>

  abstract styleGetter(parentRect: DOMRect): number

  abstract marginGetter(parentRect: DOMRect, maxWidth: number): number

  widthStyleGetter(parentRect: DOMRect, maxWidth: number): number | undefined {
    return _maxHeightOrWidthGetter(this, parentRect, maxWidth)
  }
}

export class RightOuter extends HorizontalGetter {
  verticalGetterOrder = [new BottomInner(), new TopInner()]
  origin = OriginX.LEFT

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.right)
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return Math.round(document.documentElement.clientWidth - parentRect.right - maxWidth - EDGE)
  }
}

export class RightInner extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]
  origin = OriginX.LEFT

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.left)
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return Math.round(document.documentElement.clientWidth - parentRect.left - maxWidth - EDGE)
  }
}

class RightCenter extends RightOuter {
  verticalGetterOrder = [new VerticalCenter()]
}

class Fill extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]
  origin = OriginX.LEFT

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.left)
  }

  marginGetter() {
    return 0
  }

  widthStyleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.right - parentRect.left)
  }
}

class Center extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]
  origin = OriginX.CENTER

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.left + parentRect.width / 2)
  }

  marginGetter() {
    return 0
  }

  widthStyleGetter() {
    return undefined
  }
}

export class LeftInner extends HorizontalGetter {
  verticalGetterOrder = [new BottomOuter(), new TopOuter()]
  origin = OriginX.RIGHT

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.right)
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return Math.round(parentRect.right - maxWidth - EDGE)
  }
}

export class LeftOuter extends HorizontalGetter {
  verticalGetterOrder = [new BottomInner(), new TopInner()]
  origin = OriginX.RIGHT

  styleGetter(parentRect: DOMRect) {
    return Math.round(parentRect.left)
  }

  marginGetter(parentRect: DOMRect, maxWidth: number) {
    return Math.round(parentRect.left - maxWidth - EDGE)
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

  if (margin > 0) return Math.round(maxHeightOrWidth)
  else return Math.round(maxHeightOrWidth + margin)
}
