import {getCurrentInstance} from 'vue'

// Vue resolves an explicit `undefined` prop to its default, so the raw vnode props
// are checked to tell `:clear-value="undefined"` apart from an omitted prop
export const useClearValue = <ClearValue extends null | undefined | ''>(props: {clearValue?: ClearValue}, defaultValue: null | undefined | '' = null) => {
  const instance = getCurrentInstance()

  return (): ClearValue => {
    const rawProps = instance?.vnode.props

    if (rawProps && ('clearValue' in rawProps || 'clear-value' in rawProps)) return props.clearValue as ClearValue

    return defaultValue as ClearValue
  }
}
