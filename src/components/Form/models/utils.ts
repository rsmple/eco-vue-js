
export const removeKey = <T extends Record<string, unknown>>(entity: T, key: string): T => {
  const result = {...entity}

  delete result[key]

  return result
}

const fieldMessageStart = '- '
const subformMessageStart = ''

export const compileMessage = (title: string, message: string | undefined): string | undefined => {
  if (message === undefined) return undefined

  if (message.startsWith(fieldMessageStart)) {
    return `${subformMessageStart}${title}:\n${message}`
  } else {
    return `${fieldMessageStart}${title}: ${message}`
  }
}
