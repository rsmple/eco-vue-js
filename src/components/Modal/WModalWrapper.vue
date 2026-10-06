<template>
  <!-- In an overlay, the frame — a modal, a dropdown or a bottom sheet — shows the title and the buttons around the content, so only the body renders here. -->
  <template v-if="!pageRegions">
    <OverlayRegionPart
      v-if="$slots.title"
      region="title"
    >
      <slot name="title" />
    </OverlayRegionPart>

    <OverlayRegionPart
      v-if="$slots.subtitle"
      region="subtitle"
    >
      <slot name="subtitle" />
    </OverlayRegionPart>

    <div
      v-if="frame === 'dropdown'"
      class="w-[min(24rem,calc(100vw-2rem))]"
    >
      <slot />
    </div>

    <slot v-else />

    <OverlayRegionPart
      v-if="$slots.actions"
      region="actions"
    >
      <slot name="actions" />
    </OverlayRegionPart>
  </template>

  <!-- On a page, such as a form that is also opened in overlays elsewhere, it is laid out in the flow of the page, with what the content inside hands over. -->
  <section
    v-else
    v-bind="$attrs"
    :aria-labelledby="pageRegions.title.length ? titleId : undefined"
  >
    <h2
      v-if="pageRegions.title.length"
      :id="titleId"
      class="text-accent mb-4 flex items-center text-xl font-semibold"
    >
      <OverlayRegion :parts="pageRegions.title" />
    </h2>

    <OverlayRegion :parts="pageRegions.subtitle" />

    <OverlayRegionPart
      v-if="$slots.title"
      region="title"
    >
      <slot name="title" />
    </OverlayRegionPart>

    <OverlayRegionPart
      v-if="$slots.subtitle"
      region="subtitle"
    >
      <slot name="subtitle" />
    </OverlayRegionPart>

    <slot />

    <OverlayRegionPart
      v-if="$slots.actions"
      region="actions"
    >
      <slot name="actions" />
    </OverlayRegionPart>

    <div
      v-if="pageRegions.actions.length"
      class="gap---inner-margin mt-4 flex justify-end"
      :class="{'flex-col': actionsCol}"
    >
      <OverlayRegion :parts="pageRegions.actions" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import {inject, useAttrs, useId} from 'vue'

import {useOverlayFrame, useOverlayFrameOptions} from '@/utils/Overlay'

import OverlayRegion from './components/OverlayRegion.vue'
import OverlayRegionPart from './components/OverlayRegionPart.vue'
import {wOverlayRegions} from './models/overlayRegistry'
import {useOverlayRegions} from './use/useOverlayRegions'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  /** Fills the whole screen on small screens instead of floating with a margin. */
  maximized?: boolean
  /** Stacks the `actions` buttons vertically on every screen size, not only on small ones. */
  actionsCol?: boolean
}>()

defineSlots<{
  /** Heading of the dialog, also used as its accessible name. Stays pinned at the top while the content scrolls. */
  title?: () => void
  /** Content under the heading, pinned with it. */
  subtitle?: () => void
  /** Body of the modal. */
  default?: () => void
  /** Buttons pinned at the bottom. */
  actions?: () => void
}>()

const attrs = useAttrs()

const frame = useOverlayFrame()

const outerRegions = inject(wOverlayRegions, null)

// In an overlay it hands its parts and its look to the frame. On a page it is the frame, for itself and for what the content inside hands over.
const pageRegions = outerRegions ? null : useOverlayRegions(['title', 'subtitle', 'actions']).regions

useOverlayFrameOptions(() => ({
  padded: true,
  class: attrs.class,
  maximized: props.maximized,
  actionsCol: props.actionsCol,
}))

const titleId = useId()
</script>
