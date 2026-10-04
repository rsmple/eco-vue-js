<template>
  <!-- Holds the page still while an action runs, so the selection or the filters it was confirmed for cannot change under it. -->
  <Teleport
    v-if="loading"
    to="body"
  >
    <div
      class="fixed inset-0 cursor-progress"
      :style="{zIndex: zIndex - 1}"
    />
  </Teleport>

  <div
    ref="dialog"
    role="alertdialog"
    :aria-labelledby="titleId"
    :aria-describedby="descriptionId"
    tabindex="-1"
    class="outline-none"
    :class="isSheet ? 'px---inner-margin pb-4' : 'w-96 max-w-[calc(100vw-2rem)] p-4'"
  >
    <h2
      :id="titleId"
      class="text-accent font-semibold"
      :class="isSheet ? 'pb-2 text-center text-lg' : 'mb-1 text-base'"
    >
      <template v-if="typeof title === 'string'">
        {{ title }}
      </template>

      <component
        :is="title"
        v-else
      />
    </h2>

    <div
      :id="descriptionId"
      :class="isSheet ? 'text-accent mb-6 text-balance text-center' : 'text-description mb-4 text-sm'"
    >
      <template v-if="typeof description === 'string'">
        {{ description }}
      </template>

      <component
        :is="description"
        v-else
        @update:disabled="disabledInner = $event"
      />
    </div>

    <div
      :class="isSheet ? 'gap---inner-margin flex flex-col' : ['flex gap-2', {'flex-col': actionsCol}]"
    >
      <ConfirmActions
        v-bind="props"
        :loading-accept="loadingAccept"
        :loading-intermediate="loadingIntermediate"
        :disabled="disabledInner"
        @accept="accept"
        @intermediate="intermediate"
        @cancel="cancel"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {ConfirmModalProps} from '../../types'

import {inject, nextTick, onBeforeUnmount, onMounted, useId, useTemplateRef} from 'vue'

import {useLayerBusy, useOverlayFrame} from '@/utils/Overlay'
import {BASE_ZINDEX_BOTTOM_SHEET, BASE_ZINDEX_DROPDOWN, wBaseZIndex} from '@/utils/utils'

import ConfirmActions from './ConfirmActions.vue'

import {useConfirm} from '../../use/useConfirm'

// Content of a confirm the overlay host shows in a dropdown at its anchor, or in a bottom sheet on phones.
const props = defineProps<ConfirmModalProps>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const titleId = useId()
const descriptionId = useId()

const dialogRef = useTemplateRef<HTMLElement>('dialog')

const isSheet = useOverlayFrame() === 'sheet'

const zIndex = inject(wBaseZIndex, 0) + (isSheet ? BASE_ZINDEX_BOTTOM_SHEET : BASE_ZINDEX_DROPDOWN)

let settled = false

const {disabledInner, loadingAccept, loadingIntermediate, loading, accept, intermediate, cancel} = useConfirm(props, () => {
  settled = true

  emit('close:modal')
})

// The confirm stays open while its action runs, even on Escape, a click outside or its anchor leaving the page.
useLayerBusy(() => loading.value)

onMounted(() => {
  nextTick(() => dialogRef.value?.focus({preventScroll: true}))
})

// Closing without a choice — a click outside, Escape, a swipe, or another confirm taking its place — cancels.
onBeforeUnmount(() => {
  if (!settled) props.onCancel?.()

  if (props.anchor instanceof HTMLElement && dialogRef.value?.contains(document.activeElement)) props.anchor.focus({preventScroll: true})
})
</script>
