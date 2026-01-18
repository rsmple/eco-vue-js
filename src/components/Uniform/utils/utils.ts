import {throttle} from '@/utils/utils'

export const scrollToValidator = throttle((element: HTMLElement): void => {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}, 300)