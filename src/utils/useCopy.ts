import {type MaybeRefOrGetter, computed, markRaw, ref, toValue} from 'vue'

import IconCopy from '@/assets/icons/IconCopy.svg?component'
import IconCopySuccess from '@/assets/icons/IconCopySuccess.svg?component'

import {Notify} from './Notify'

export const checkPermissionPaste = async (): Promise<boolean> => {
  const result = await navigator.permissions.query({name: 'clipboard-read' as PermissionName})
  return result.state === 'granted' || result.state === 'prompt'
}

const checkPermissionCopy = async (): Promise<boolean> => {
  const result = await navigator.permissions.query({name: 'clipboard-write' as PermissionName})
  return result.state === 'granted' || result.state === 'prompt'
}

const _doCopy = (text: string | number | undefined | null) => {
  if (!text) {
    Notify.warn({
      title: 'Nothing to copy',
    })

    return Promise.resolve()
  }

  return navigator.clipboard.writeText(typeof text === 'number' ? `${ text }` : text)
    .then(() => {
      Notify.success({
        title: 'Copied',
      })
    })
}

export const doCopy = async (text: string | number | undefined | null) => {
  try {
    await _doCopy(text)
      .catch(async () => {
        await checkPermissionCopy()
        await _doCopy(text)
      })
    return true
  } catch {
    Notify.error({
      title: 'Copy failed',
      caption: `Please allow the clipboard actions in browser settings for current domain: ${ location.host }`,
    })
    return false
  }
}

export const useCopy = (value: MaybeRefOrGetter<string | number | undefined | null>) => {
  const copied = ref(false)
  let timeout: NodeJS.Timeout | undefined

  const iconCopy = computed(() => copied.value ? markRaw(IconCopySuccess) : markRaw(IconCopy))

  const doCopyFn = async () => {
    const result = await doCopy(toValue(value))

    if (result) {
      copied.value = true

      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        timeout = undefined
        copied.value = false
      }, 1000)
    }
  }

  return {
    copied,
    iconCopy,
    doCopy: doCopyFn,
  }
}
