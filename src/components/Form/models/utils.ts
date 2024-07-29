import {throttle} from '@/main'

export const removeKey = <T extends Record<string, unknown>>(entity: T, key: string): T => {
  const result = {...entity}

  delete result[key]

  return result
}

const fieldMessageStart = ' - '
const subformMessageStart = ' '

export const compileMessage = (title: string | undefined, message: string | undefined): string | undefined => {
  if (message === undefined) return undefined
  if (title === undefined) return message

  if (message.startsWith(subformMessageStart)) {
    return `${ subformMessageStart }${ title }\n${ message }`
  } else {
    return `${ fieldMessageStart }${ title }: ${ message }`
  }
}

export const scrollToValidator = throttle((element: HTMLElement): void => {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}, 300)
