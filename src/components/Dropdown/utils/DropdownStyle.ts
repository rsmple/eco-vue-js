import {markRaw} from 'vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {getIsClientSide} from '@/utils/utils'

type StyleGetter = {
  isEdge: ((parentRect: DOMRect) => boolean) | undefined
}

const EDGE_FACTOR = 0.66

export enum OriginY {
  TOP = 'content-start',
  BOTTOM = 'content-end',
  CENTER = 'content-center',
}

export type VerticalGetter = {
  isTop: boolean
  origin: OriginY
  style?: Record<string, string>
  y: (parentRect: DOMRect) => number
} & StyleGetter

const BOTTOM_EDGE = getIsClientSide() ? window.innerHeight * EDGE_FACTOR : 0

/**
 *   ↓
 *  [ ]
 */
const BottomInner: VerticalGetter = markRaw({
  isTop: false,
  origin: OriginY.TOP,
  style: {maxHeight: 'calc(100vh - var(--dropdown-y, 0px) - var(--w-bottom-inner, 0px) - var(--inner-margin, 0px))'},
  y: parentRect => Math.round(parentRect.top),
  isEdge: parentRect => parentRect.top > BOTTOM_EDGE,
})

/**
 *  [ ]
 *   ↓
 */
const BottomOuter: VerticalGetter = markRaw({
  ...BottomInner,
  y: parentRect => Math.round(parentRect.bottom),
  isEdge: parentRect => parentRect.bottom > BOTTOM_EDGE,
})

/**
 *  [x]
 */
const VerticalCenter: VerticalGetter = markRaw({
  isTop: false,
  origin: OriginY.CENTER,
  style: undefined,
  y: parentRect => Math.round(parentRect.top + parentRect.height / 2),
  isEdge: undefined,
})

const TOP_EDGE = getIsClientSide() ? window.innerHeight * (1 - EDGE_FACTOR) : 0

/**
 *   ↑
 *  [ ]
 */
const TopOuter: VerticalGetter = markRaw({
  isTop: true,
  origin: OriginY.BOTTOM,
  style: {maxHeight: 'calc(var(--dropdown-y, 0px) - var(--w-top-inner, 0px) - var(--inner-margin, 0px))'},
  y: parentRect => Math.round(parentRect.top),
  isEdge: parentRect => parentRect.top < TOP_EDGE,
})

/**
 *  [ ]
 *   ↑
 */
const TopInner: VerticalGetter = markRaw({
  ...TopOuter,
  y: parentRect => Math.round(parentRect.bottom),
  isEdge: parentRect => parentRect.bottom < TOP_EDGE,
})

export enum OriginX {
  LEFT = 'justify-start',
  RIGHT = 'justify-end',
  CENTER = 'justify-center',
}

export type HorizontalGetter = {
  verticalGetterOrder: [VerticalGetter, VerticalGetter] | [VerticalGetter]
  origin: OriginX
  style?: Record<string, string> | undefined
  styleGetter?: (parentRect: DOMRect) => Record<string, string>
  x: (parentRect: DOMRect) => number
} & StyleGetter

const RIGHT_EDGE = getIsClientSide() ? window.innerWidth * EDGE_FACTOR : 0

/**
 *    [ ] →
 */
export const RightOuter: HorizontalGetter = markRaw({
  verticalGetterOrder: [BottomInner, TopInner],
  origin: OriginX.LEFT,
  style: {maxWidth: 'calc(var(--w-dropdown-x-max, calc(100vw - var(--w-right-inner, 0px))) - var(--dropdown-x, 0px))'},
  x: parentRect => Math.round(parentRect.right),
  isEdge: parentRect => parentRect.right > RIGHT_EDGE,
})

/**
 *  → [ ]
 */
export const RightInner: HorizontalGetter = markRaw({
  ...RightOuter,
  verticalGetterOrder: [BottomOuter, TopOuter],
  x: parentRect => Math.round(parentRect.left),
  isEdge: parentRect => parentRect.left > RIGHT_EDGE,
})

/**
 *    [x] →
 */
const RightCenter: HorizontalGetter = markRaw({
  ...RightOuter,
  verticalGetterOrder: [VerticalCenter],
})

/**
 *  → [ ] ←
 */
const Fill: HorizontalGetter = markRaw({
  verticalGetterOrder: [BottomOuter, TopOuter],
  origin: OriginX.LEFT,
  style: {minWidth: 'var(--dropdown-width)', maxWidth: 'var(--dropdown-width)'},
  styleGetter: parentRect => ({'--dropdown-width': `${ Math.round(parentRect.right - parentRect.left) }px`}),
  x: parentRect => Math.round(parentRect.left),
  isEdge: undefined,
})

/**
 *    [x]
 */
const Center: HorizontalGetter = markRaw({
  verticalGetterOrder: [BottomOuter, TopOuter],
  origin: OriginX.CENTER,
  x: parentRect => Math.round(parentRect.left + parentRect.width / 2),
  isEdge: undefined,
})

const LEFT_EDGE = getIsClientSide() ? window.innerWidth * (1 - EDGE_FACTOR) : 0

/**
 *    [ ] ←
 */
export const LeftInner: HorizontalGetter = markRaw({
  verticalGetterOrder: [BottomOuter, TopOuter],
  origin: OriginX.RIGHT,
  style: {maxWidth: 'calc(var(--dropdown-x, 0px) - var(--w-dropdown-x-min, var(--w-left-inner, 0px)))'},
  x: parentRect => Math.round(parentRect.right),
  isEdge: parentRect => parentRect.right < LEFT_EDGE,
})

/**
 *  ← [ ]
 */
export const LeftOuter: HorizontalGetter = markRaw({
  ...LeftInner,
  verticalGetterOrder: [BottomInner, TopInner],
  x: parentRect => Math.round(parentRect.left),
  isEdge: parentRect => parentRect.left < LEFT_EDGE,
})

/**
 *  ← [x]
 */
export const LeftCenter: HorizontalGetter = markRaw({
  ...LeftOuter,
  verticalGetterOrder: [VerticalCenter],
})

export const horizontalGetterOrderMap: Record<HorizontalAlign, [HorizontalGetter, HorizontalGetter] | [HorizontalGetter]> = {
  [HorizontalAlign.RIGHT_OUTER]: [RightOuter, LeftOuter],
  [HorizontalAlign.RIGHT_CENTER]: [RightCenter, LeftCenter],
  [HorizontalAlign.RIGHT_INNER]: [RightInner, LeftInner],
  [HorizontalAlign.FILL]: [Fill],
  [HorizontalAlign.CENTER]: [Center],
  [HorizontalAlign.LEFT_INNER]: [LeftInner, RightInner],
  [HorizontalAlign.LEFT_CENTER]: [LeftCenter, RightCenter],
  [HorizontalAlign.LEFT_OUTER]: [LeftOuter, RightOuter],
}

export function searchStyleGetter<T extends HorizontalGetter | VerticalGetter>(order: Array<T>, parentRect: DOMRect): T {
  if (order[1] && order[0].isEdge?.(parentRect)) return order[1]
  
  return order[0]
}
