const MOTION = /^(?:transition(?:-(?:all|colors|opacity|shadow|transform|\[.+\]|\(.+\)))?|animate-(?!none$)[\w-[\]().,%/]+|scroll-smooth)$/
// Class lists never hold sentence punctuation; UI copy such as "Status transition failed." does.
const PROSE = /[`;?]|[.,:](?:\s|$)/
const DURATION = /^duration-(?!0$|initial$)(?:\d+|\[.+\]|\(.+\))$/

// Fading or recolouring is not motion, so it may still play when the OS asks for reduced motion.
export const FADE_UTILITIES = ['transition-opacity', 'transition-colors', 'transition-shadow']
export const FADE_PROPERTIES = [
  'opacity',
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'text-decoration-color',
  'fill',
  'stroke',
  'box-shadow',
]

const isFade = utility => {
  if (FADE_UTILITIES.includes(utility)) return true

  const properties = utility.match(/^transition-\[(.+)\]$/)?.[1].split(',')

  return !!properties && properties.every(property => FADE_PROPERTIES.includes(property.trim()))
}

const splitVariants = token => {
  const parts = []
  let depth = 0
  let start = 0

  for (let i = 0; i < token.length; i++) {
    const char = token[i]
    if (char === '[' || char === '(') depth++
    else if (char === ']' || char === ')') depth--
    else if (char === ':' && depth === 0) {
      parts.push(token.slice(start, i))
      start = i + 1
    }
  }

  parts.push(token.slice(start))

  return parts
}

/**
 * Returns `{token, duration}` for each class that would still animate under reduced motion. `duration` marks a
 * `duration-*` class with no ungated transition property beside it: `transition-property` defaults to `all`, so on
 * its own it transitions every property.
 */
export const findUngated = (value, allow) => {
  if (PROSE.test(value)) return []

  const tokens = value.split(/\s+/).filter(Boolean).map(token => {
    const parts = splitVariants(token)
    return {token, utility: parts.pop().replace(/^!|!$/g, ''), gated: parts.includes('motion-safe')}
  })

  if (tokens.some(({token}) => splitVariants(token).includes('motion-reduce'))) return []

  const hasStillProperty = tokens.some(({utility, gated}) => !gated && (utility === 'transition-none' || isFade(utility)))
  const found = []

  for (const {token, utility, gated} of tokens) {
    if (gated || allow.includes(utility)) continue

    if (MOTION.test(utility) && !isFade(utility)) found.push({token, duration: false})
    else if (DURATION.test(utility) && !hasStillProperty) found.push({token, duration: true})
  }

  return found
}
