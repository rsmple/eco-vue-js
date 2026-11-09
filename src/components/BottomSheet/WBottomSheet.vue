<template>
  <slot
    name="toggle"
    :unclickable="true"
  />

  <Teleport to="body">
    <WDismissable
      ref="dismissable"
      :is-open="isOpen"
      class="fixed inset-0"
      :class="noOverlay ? '' : 'bg-backdrop backdrop-blur'"
      :content-class="contentClass"
      :style="{zIndex: baseZIndex + BASE_ZINDEX_BOTTOM_SHEET}"
      @close="$emit('close')"
    >
      <div class="px-3">
        <div class="flex h-9 items-center justify-center">
          <div class="h-1 w-12 rounded-sm bg-track" />
        </div>

        <div>
          <slot
            name="toggle"
            :unclickable="false"
            v-bind="{isTop: false}"
          />
        </div>
      </div>

      <div class="overflow-y-auto overflow-x-hidden overscroll-contain">
        <slot name="content" />
      </div>

      <slot name="footer" />

      <!--
        Under the sheet when it is pulled up past its end, for it to read as pulled from below the screen. Opaque, as is the sheet over the backdrop.
        Without the backdrop the sheet floats, so pulling it up only lifts it off the bottom edge.
      -->
      <div
        v-if="!noOverlay"
        class="bg-surface absolute top-full h-screen w-full"
      />

      <!-- Clicks inside the sheet stop at its content, so any click that reaches the document landed outside. -->
      <WClickOutside
        v-if="noOverlay"
        no-filter
        class="hidden"
        @click="$emit('close')"
      />
    </WDismissable>
  </Teleport>
</template>

<script lang="ts" setup>
import {computed, inject, useTemplateRef} from 'vue'

import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDismissable from '@/components/Dismissable/WDismissable.vue'

import {useLensGlass} from '@/utils/useLensGlass'
import {BASE_ZINDEX_BOTTOM_SHEET, wBaseZIndex} from '@/utils/utils'

const props = defineProps<{
  /** Opens the sheet. */
  isOpen: boolean
  /** Sizes the sheet to its content, up to 90% of the screen, instead of always taking 90%. */
  compact?: boolean
  /** Leaves the page in view without the dimmed backdrop. A tap outside the sheet still closes it, and also reaches the page. */
  noOverlay?: boolean
}>()

defineEmits<{
  /** The sheet was swiped down, or the backdrop — with `noOverlay`, the page — was tapped. Set `isOpen` to `false` on it. */
  (e: 'close'): void
}>()

defineSlots<{
  /** Element that opens the sheet, rendered in place and again at the top of the sheet — `unclickable` is `true` for the one in place and `false` for the copy. */
  toggle?: (props: {unclickable: boolean, isTop?: boolean}) => void
  /** Content of the sheet, which scrolls under the toggle. */
  content?: () => void
  /** Pinned at the bottom of the sheet, under the content that scrolls, such as a form's buttons. */
  footer?: () => void
}>()

const baseZIndex = inject(wBaseZIndex, 0)

const dismissableRef = useTemplateRef('dismissable')

defineExpose({
  /** Slides the sheet down. Resolves once it is out of view — then set `isOpen` to `false` for no visible jump. */
  hide: (): Promise<void> => dismissableRef.value?.hide() ?? Promise.resolve(),
})

// Without the backdrop the page stays in view, as around a dropdown, and the sheet stands in for one: it takes a dropdown's paint, glass in a glass
// theme and lens glass where the theme turns it on, and floats off the screen's edges as a dropdown would, rounded all round.
// Over the dimmed backdrop it stays opaque and docked: that already blurs the page, and the sheet would only show its tint.
const contentClass = computed(() => [
  'grid-cols-[1fr] grid-rows-[auto_1fr_auto] shadow-md relative grid',
  props.compact ? 'max-h-[90%]' : 'height-[90%]',
  props.noOverlay
    ? 'surface-dropdown pointer-events-auto rounded-[2rem] border border-solid border-line-raised mx-2 mb-[max(0.5rem,env(safe-area-inset-bottom))] scroll-mb-[max(0.5rem,env(safe-area-inset-bottom))]'
    : 'bg-surface rounded-t-3xl',
].join(' '))

useLensGlass(() => props.noOverlay ? dismissableRef.value?.content : null)
</script>
