const MOTION = /^(?:transition(?:-(?!none$)[\w-[\]().,%/]+)?|animate-(?!none$)[\w-[\]().,%/]+|scroll-smooth)$/

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

export const findUngated = (value, allow) => {
  const tokens = value.split(/\s+/).filter(Boolean)

  if (tokens.some(token => splitVariants(token).includes('motion-reduce'))) return []

  return tokens.filter(token => {
    const parts = splitVariants(token)
    const utility = parts.pop().replace(/^!|!$/g, '')

    if (!MOTION.test(utility) || isFade(utility)) return false
    if (parts.includes('motion-safe')) return false

    return !allow.includes(utility)
  })
}
