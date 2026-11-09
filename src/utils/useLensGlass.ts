import {type ComponentPublicInstance, type MaybeRefOrGetter, onScopeDispose, toValue, watch} from 'vue'

/**
 * Lens glass on an overlay: the backdrop bends along the element's rounded edge, as through a curved rim, and is left
 * a little magnified inside. A theme turns it on with `--w-lens-refraction`, how far the edge
 * shifts what is behind it (in px), and tunes it with `--w-lens-bezel`, how wide the bending rim is (px),
 * `--w-lens-magnify`, how much larger the middle shows it (0.05 for 5%), and `--w-lens-dispersion`, how far the
 * colors split along the rim (px). The element keeps its own `backdrop-filter`, such as the blur of a dropdown, and the
 * refraction is added after it.
 *
 * Only Chromium applies an SVG filter to the backdrop. Elsewhere, or with the refraction at 0, nothing is changed and
 * the element stays frosted.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

/** The map is drawn at this share of the element's size and stretched over it: it is smooth, so the detail is not lost. */
const MAP_SCALE = 0.5

const MAP_CACHE_SIZE = 24

const DEFAULT_BEZEL = 16

type Settings = {refraction: number, bezel: number, magnify: number, dispersion: number}

const isChromium = (): boolean => {
  if (typeof navigator === 'undefined') return false

  const brands = (navigator as Navigator & {userAgentData?: {brands: {brand: string}[]}}).userAgentData?.brands

  // Without client hints, outside a secure context, by the user agent: WebKit on iOS calls itself CriOS, not Chrome.
  return brands ? brands.some(item => item.brand === 'Chromium') : /\bChrome\//.test(navigator.userAgent)
}

let supported: boolean | undefined

const getIsSupported = () => supported ??= typeof document !== 'undefined' && isChromium()

const readNumber = (style: CSSStyleDeclaration, name: string, fallback: number) => {
  const value = Number.parseFloat(style.getPropertyValue(name))

  return Number.isFinite(value) ? value : fallback
}

const readSettings = (style: CSSStyleDeclaration): Settings => ({
  refraction: readNumber(style, '--w-lens-refraction', 0),
  bezel: Math.max(1, readNumber(style, '--w-lens-bezel', DEFAULT_BEZEL)),
  magnify: Math.max(0, readNumber(style, '--w-lens-magnify', 0)),
  dispersion: Math.max(0, readNumber(style, '--w-lens-dispersion', 0)),
})

/**
 * The displacement map of a rounded rectangle, in red across and green down, as shares of `refraction`: inside, each
 * point samples nearer the center by `magnify`, which enlarges the backdrop; along the rim the shift toward the center
 * grows to the full refraction at the edge. It samples from inside the element only, since the backdrop past its edge
 * is not there to sample.
 */
const drawMap = (width: number, height: number, radius: number, bezel: number, refraction: number, magnify: number): string => {
  const mapWidth = Math.max(1, Math.ceil(width * MAP_SCALE))
  const mapHeight = Math.max(1, Math.ceil(height * MAP_SCALE))
  const canvas = document.createElement('canvas')

  canvas.width = mapWidth
  canvas.height = mapHeight

  const context = canvas.getContext('2d')

  if (!context) return ''

  const image = context.createImageData(mapWidth, mapHeight)
  const data = image.data
  const halfWidth = width / 2
  const halfHeight = height / 2
  const r = Math.min(radius, halfWidth, halfHeight)
  const band = Math.min(bezel, halfWidth, halfHeight)
  // The rim bends along a rounding at least as wide as itself, so its direction turns smoothly round the corner: along
  // the element's own, tighter one it would flip from across to down on the diagonal, and tear the backdrop there.
  const normalRadius = Math.max(r, band)
  // A point sampled at `p / (1 + magnify)` shows the backdrop enlarged by it, about the center.
  const zoom = magnify / (1 + magnify) / refraction

  for (let y = 0; y < mapHeight; y++) {
    const py = (y + 0.5) / MAP_SCALE - halfHeight
    const qy = Math.abs(py) - (halfHeight - r)

    for (let x = 0; x < mapWidth; x++) {
      const px = (x + 0.5) / MAP_SCALE - halfWidth
      const qx = Math.abs(px) - (halfWidth - r)
      const ox = Math.max(qx, 0)
      const oy = Math.max(qy, 0)
      const corner = Math.hypot(ox, oy)
      // How far in from the edge: the signed distance to the rounded rectangle, turned positive inside.
      const depth = r - corner - Math.min(Math.max(qx, qy), 0)
      const index = (y * mapWidth + x) * 4

      let dx = -px * zoom
      let dy = -py * zoom

      if (depth < band) {
        const t = 1 - Math.max(depth, 0) / band
        // Steepest at the edge, as on a curved rim, and fading out smoothly toward the flat middle.
        const strength = t * t
        const nqx = Math.max(Math.abs(px) - (halfWidth - normalRadius), 0)
        const nqy = Math.max(Math.abs(py) - (halfHeight - normalRadius), 0)
        const length = Math.hypot(nqx, nqy)
        let nx = 0
        let ny = 0

        if (length > 0) {
          nx = nqx / length
          ny = nqy / length
        } else if (qx > qy) {
          nx = 1
        } else {
          ny = 1
        }

        dx -= Math.sign(px) * nx * strength
        dy -= Math.sign(py) * ny * strength
      }

      data[index] = Math.round(128 + 127 * Math.min(Math.max(dx, -1), 1))
      data[index + 1] = Math.round(128 + 127 * Math.min(Math.max(dy, -1), 1))
      data[index + 2] = 128
      data[index + 3] = 255
    }
  }

  context.putImageData(image, 0, 0)

  return canvas.toDataURL()
}

const mapCache = new Map<string, string>()

const CORNERS = [['Top', 'Left'], ['Top', 'Right'], ['Bottom', 'Right'], ['Bottom', 'Left']] as const

// The padding box's corners, as `border-radius` takes them: each corner's radius less the borders beside it.
const getInnerRadius = (style: CSSStyleDeclaration): string => {
  const horizontal: string[] = []
  const vertical: string[] = []

  for (const [y, x] of CORNERS) {
    const [rx = 0, ry = rx] = style.getPropertyValue(`border-${ y.toLowerCase() }-${ x.toLowerCase() }-radius`).split(' ').map(value => Number.parseFloat(value) || 0)

    horizontal.push(`${ Math.max(0, rx - (Number.parseFloat(style.getPropertyValue(`border-${ x.toLowerCase() }-width`)) || 0)) }px`)
    vertical.push(`${ Math.max(0, ry - (Number.parseFloat(style.getPropertyValue(`border-${ y.toLowerCase() }-width`)) || 0)) }px`)
  }

  return `${ horizontal.join(' ') } / ${ vertical.join(' ') }`
}

const getMap = (width: number, height: number, radius: number, settings: Settings) => {
  const {bezel, refraction, magnify} = settings
  const key = `${ width }x${ height }r${ radius }b${ bezel }f${ refraction }m${ magnify }`
  let map = mapCache.get(key)

  if (map === undefined) {
    map = drawMap(width, height, radius, bezel, refraction, magnify)

    if (mapCache.size >= MAP_CACHE_SIZE) mapCache.delete(mapCache.keys().next().value as string)
  } else {
    mapCache.delete(key)
  }

  // Most recently used last, so the oldest is the first to go.
  mapCache.set(key, map)

  return map
}

let host: SVGSVGElement | null = null

const getHost = () => {
  if (host?.isConnected) return host

  host = document.createElementNS(SVG_NS, 'svg')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  document.body.appendChild(host)

  return host
}

const createNode = (name: string, attributes: Record<string, string | number>) => {
  const node = document.createElementNS(SVG_NS, name)

  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value))

  return node
}

/** Keeps one color channel of a displaced backdrop, for the colors to split along the rim. */
const CHANNEL_MATRICES = [
  '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
  '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
  '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
]

const fillFilter = (filter: SVGFilterElement, width: number, height: number, map: string, settings: Settings) => {
  filter.replaceChildren()

  for (const [key, value] of Object.entries({x: 0, y: 0, width, height})) filter.setAttribute(key, String(value))

  filter.append(createNode('feImage', {href: map, x: 0, y: 0, width, height, preserveAspectRatio: 'none', result: 'map'}))

  const displace = (scale: number, result: string) => createNode('feDisplacementMap', {
    in: 'SourceGraphic',
    in2: 'map',
    scale,
    xChannelSelector: 'R',
    yChannelSelector: 'G',
    result,
  })

  // A map value of 1 shifts by half the scale: the scale is twice the refraction.
  const scale = settings.refraction * 2

  if (!settings.dispersion) {
    filter.append(displace(scale, 'out'))

    return
  }

  // Red bends least and blue most, as through glass.
  const scales = [scale - settings.dispersion * 2, scale, scale + settings.dispersion * 2]

  scales.forEach((value, index) => {
    filter.append(displace(value, `d${ index }`))
    filter.append(createNode('feColorMatrix', {in: `d${ index }`, type: 'matrix', values: CHANNEL_MATRICES[index], result: `c${ index }`}))
  })

  // The three channels added back together: each keeps the full alpha, which the sum clamps to.
  filter.append(createNode('feComposite', {in: 'c0', in2: 'c1', operator: 'arithmetic', k2: 1, k3: 1, result: 'c01'}))
  filter.append(createNode('feComposite', {in: 'c01', in2: 'c2', operator: 'arithmetic', k2: 1, k3: 1}))
}

type Instance = {refresh: () => void}

const instances = new Set<Instance>()

let themeObserver: MutationObserver | null = null

let refreshFrame = 0

/** A theme is swapped in a style element or a class on the root: the glass already open picks it up. */
const observeTheme = () => {
  if (themeObserver) return

  themeObserver = new MutationObserver(() => {
    if (refreshFrame) return

    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0
      instances.forEach(instance => instance.refresh())
    })
  })

  themeObserver.observe(document.head, {childList: true, subtree: true, characterData: true})
  themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['class', 'style']})
  themeObserver.observe(document.body, {attributes: true, attributeFilter: ['class', 'style']})
}

const unobserveTheme = () => {
  if (instances.size || !themeObserver) return

  themeObserver.disconnect()
  themeObserver = null
}

let filterCount = 0

/** Lens glass on `target`, a frame or a bar over the page; see the top of this file. */
export const useLensGlass = (target: MaybeRefOrGetter<Element | ComponentPublicInstance | null | undefined>) => {
  if (!getIsSupported()) return

  const id = `w-lens-glass-${ ++filterCount }`

  let element: HTMLElement | null = null
  let filter: SVGFilterElement | null = null
  let resizeObserver: ResizeObserver | null = null
  let frame = 0
  let applied = ''

  const clear = () => {
    if (!element) return

    element.style.removeProperty('backdrop-filter')
    element.style.removeProperty('--w-lens-radius')
    element.removeAttribute('data-w-lens-glass')
    applied = ''
  }

  const apply = () => {
    frame = 0

    if (!element?.isConnected) return

    // Its own backdrop, without the refraction set here: what a theme or the class gives it.
    element.style.removeProperty('backdrop-filter')

    const style = getComputedStyle(element)
    const settings = readSettings(style)
    const width = Math.round(element.offsetWidth)
    const height = Math.round(element.offsetHeight)

    if (settings.refraction <= 0 || !width || !height) {
      clear()

      return
    }

    const radius = Math.round(Number.parseFloat(style.borderTopLeftRadius) || 0)
    const key = `${ width }x${ height }r${ radius }:${ settings.refraction }:${ settings.bezel }:${ settings.magnify }:${ settings.dispersion }`

    if (key !== applied) {
      filter ??= createNode('filter', {id, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB'}) as SVGFilterElement

      if (!filter.isConnected) getHost().appendChild(filter)

      fillFilter(filter, width, height, getMap(width, height, radius, settings), settings)
      applied = key
    }

    const own = style.backdropFilter === 'none' ? '' : style.backdropFilter

    element.style.setProperty('backdrop-filter', `${ own } url(#${ id })`.trim())
    // A frame with a border of its own keeps it as its edge, for the rim not to draw a second one inside it.
    element.setAttribute('data-w-lens-glass', Number.parseFloat(style.borderTopWidth) > 0 ? 'bordered' : '')
    // The rim lies inside the border, so it follows the inner curve: the radius less the border on each side, such as a card's thicker left edge.
    element.style.setProperty('--w-lens-radius', getInnerRadius(style))
  }

  const instance: Instance = {
    refresh: () => {
      applied = ''
      apply()
    },
  }

  const schedule = () => {
    frame ||= requestAnimationFrame(apply)
  }

  const stop = () => {
    if (frame) cancelAnimationFrame(frame)

    frame = 0
    resizeObserver?.disconnect()
    resizeObserver = null
    clear()
    element = null
  }

  watch(() => {
    const value = toValue(target)

    return value instanceof Element ? value : value?.$el
  }, value => {
    stop()

    if (!(value instanceof HTMLElement)) return

    element = value
    resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(value)
    instances.add(instance)
    observeTheme()
    apply()
  }, {immediate: true, flush: 'post'})

  onScopeDispose(() => {
    stop()
    filter?.remove()
    filter = null
    instances.delete(instance)
    unobserveTheme()
  })
}
