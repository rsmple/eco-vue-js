import {getIsClientSide} from './utils'

export let supportsPassive = false

try {
  if (getIsClientSide()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('test', null as any, Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true
      },
    }))
  }
} catch (e) {}
