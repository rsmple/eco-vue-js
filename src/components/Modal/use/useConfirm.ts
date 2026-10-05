import type {ConfirmModalProps} from '../types'

import {type Ref, computed, ref} from 'vue'

/** State and handlers of a confirm, shared by the modal and the anchored variant. `close` runs once an action settles. */
export const useConfirm = (props: ConfirmModalProps, close: () => void) => {
  const disabledInner = ref(false)

  const loadingAccept = ref(false)
  const loadingIntermediate = ref(false)

  const loading = computed(() => loadingAccept.value || loadingIntermediate.value)

  const run = (action: (() => void | Promise<void>) | undefined, loadingRef: Ref<boolean>) => {
    if (loading.value) return

    const promise = action?.()

    if (promise) {
      loadingRef.value = true

      promise
        .then(() => {
          close()
        })
        .finally(() => {
          loadingRef.value = false
        })
    } else {
      close()
    }
  }

  const accept = () => run(props.onAccept, loadingAccept)

  const intermediate = () => run(props.onIntermediate, loadingIntermediate)

  const cancel = () => {
    props.onCancel?.()

    close()
  }

  return {
    disabledInner,
    loadingAccept,
    loadingIntermediate,
    loading,
    accept,
    intermediate,
    cancel,
  }
}
