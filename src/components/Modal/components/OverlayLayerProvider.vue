<template>
  <slot />
</template>

<script lang="ts" setup>
import {getCurrentInstance, provide} from 'vue'

import {BASE_ZINDEX_MODAL, wBaseZIndex} from '@/utils/utils'

import {wIsModal} from '../models/injection'
import {setInstanceProvides, wOverlayFrame, wOverlayLayer, wOverlayRegions} from '../models/overlayRegistry'

const props = defineProps<{
  /** Overlay layer the content belongs to. */
  layer: number
  /** Injections of the component that opened the layer, seen by the content instead of the host's, as if it rendered in place. */
  provides?: Record<string | symbol, unknown>
  /** The layer is a modal — content inside, such as a list, sees `wIsModal` even when opened from the page. */
  modal?: boolean
}>()

const instance = getCurrentInstance()

if (props.provides) setInstanceProvides(instance, Object.create(props.provides))

provide(wBaseZIndex, BASE_ZINDEX_MODAL)
provide(wOverlayLayer, () => props.layer)
// A dropdown layer's frame provides its own.
provide(wOverlayFrame, 'modal')
// The opener's areas, such as those of a dropdown it is in, belong to the opener's layer. A modal's content brings its own frame.
provide(wOverlayRegions, null)

if (props.modal) provide(wIsModal, true)
</script>
