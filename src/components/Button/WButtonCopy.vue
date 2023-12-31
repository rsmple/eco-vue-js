<template>
  <div
    class="relative inline-block text-description square-5 cursor-pointer select-none w-hover-circle"
    @click="doCopy()"
  >
    <IconCopySuccess
      v-if="copied"
      class="-mt-[1px] text-primary-default dark:text-primary-dark"
    />

    <IconCopy
      v-else
      class="-mt-[1px]"
    />

    <WTooltip
      class="pointer-events-none"
      text="Copy"
      no-touch
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import IconCopy from '@/assets/icons/sax/IconCopy.svg?component'
import IconCopySuccess from '@/assets/icons/sax/IconCopySuccess.svg?component'
import {Notify} from '@/utils/Notify'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

const props = defineProps<{
  value: string
}>()

const copied = ref(false)
let timeout: NodeJS.Timeout | undefined

const checkPermission = async (): Promise<boolean> => {
  const result = await navigator.permissions.query({name: 'clipboard-write' as PermissionName})

  return result.state === 'granted' || result.state === 'prompt'
}

const doCopy = async () => {
  if (!(await checkPermission())) {
    Notify.error({
      title: 'Copy failed',
      caption: 'Writing to clipboard is not permitted',
    })

    return
  }

  navigator.clipboard.writeText(props.value)
    .then(() => {
      copied.value = true

      Notify.success({
        title: 'Copied',
      })

      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        timeout = undefined
        copied.value = false
      }, 500)
    })
    .catch(() => {
      Notify.error({
        title: 'Copy failed',
      })
    })
}

</script>
