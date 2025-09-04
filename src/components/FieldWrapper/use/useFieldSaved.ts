import {type InjectionKey, provide} from 'vue'

export type ShowMessage = (value: string, durationMs?: number) => void

export const wFieldSetShowMessage = Symbol('wFieldSaved') as InjectionKey<(showMessage: ShowMessage | null) => void>

export const useFieldMessage = () => {
  let showMessageFn: ShowMessage | null = null

  const setShowMessage = (value: ShowMessage | null) => {
    showMessageFn = value
  }

  provide(wFieldSetShowMessage, setShowMessage)

  const showMessage: ShowMessage = (value, durationMs) => showMessageFn?.(value, durationMs)

  return showMessage
}
