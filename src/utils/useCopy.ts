import {type MaybeRef, computed, markRaw, ref, unref} from 'vue'

import IconCopy from '@/assets/icons/IconCopy.svg?component'
import IconCopySuccess from '@/assets/icons/IconCopySuccess.svg?component'

import {Notify} from './Notify'

export const useCopy = (value: MaybeRef<string | number | undefined>) => {
  const copied = ref(false)
  let timeout: NodeJS.Timeout | undefined

  const iconCopy = computed(() => copied.value ? markRaw(IconCopySuccess) : markRaw(IconCopy))

  const checkPermission = async (): Promise<boolean> => {
    const result = await navigator.permissions.query({name: 'clipboard-write' as PermissionName})

    return result.state === 'granted' || result.state === 'prompt'
  }

  const _doCopy = () => {
    const text = unref(value)

    if (!text) {
      Notify.warn({
        title: 'Nothing to copy',
      })

      return Promise.resolve()
    }

    return navigator.clipboard.writeText(typeof text === 'number' ? `${ text }` : text)
      .then(() => {
        copied.value = true

        Notify.success({
          title: 'Copied',
        })

        if (timeout) clearTimeout(timeout)

        timeout = setTimeout(() => {
          timeout = undefined
          copied.value = false
        }, 1000)
      })
  }

  const doCopy = () => {
    try {
      _doCopy()
        .catch(async () => {
          await checkPermission()
          await _doCopy()
        })
    } catch {
      Notify.error({
        title: 'Copy failed',
        caption: `Please allow the clipboard actions in browser settings for current domain: ${ location.host }`,
      })
    }
    
  }

  return {
    copied,
    iconCopy,
    doCopy,
  }
}
