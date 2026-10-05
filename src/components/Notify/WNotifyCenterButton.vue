<template>
  <WButtonAction
    ref="button"
    :title="title ?? 'Notifications'"
    :icon="icon ?? IconNotification"
    :count="notifyCenterActionCount"
    :loading="notifyCenterPendingCount !== 0"
    :active="isOpen"
    :aria-expanded="isOpen"
    @click="buttonRef && toggle(buttonRef.$el)"
  />
</template>

<script lang="ts" setup>
import type {NotifyCenterProps} from './types'

import {type VNode, useTemplateRef} from 'vue'

import WButtonAction from '@/components/Button/WButtonAction.vue'

import IconNotification from '@/assets/icons/IconNotification.svg?component'

import {notifyCenterActionCount, notifyCenterPendingCount} from './models/notifyCenter'
import {useNotifyCenter} from './use/useNotifyCenter'

interface Props extends NotifyCenterProps {
  /** Tooltip of the button and heading of the notify center. Defaults to `Notifications`. */
  title?: string
  /** Icon of the button. Defaults to a bell. */
  icon?: SVGComponent
}

const props = defineProps<Props>()

const slots = defineSlots<{
  /** Footer of the notify center. Close the center from it with `closeNotifyCenter`. */
  footer?: () => VNode[]
}>()

const buttonRef = useTemplateRef('button')

const {isOpen, toggle} = useNotifyCenter({
  props: () => ({
    title: props.title,
    clearText: props.clearText,
    emptyText: props.emptyText,
    actionText: props.actionText,
    activityText: props.activityText,
  }),
  footer: slots.footer ? () => slots.footer?.() : undefined,
})
</script>
