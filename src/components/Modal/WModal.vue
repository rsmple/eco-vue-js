<template>
  <div :style="{zIndex: BASE_ZINDEX_MODAL}">
    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isBackdrop"
        :style="{zIndex: 99 + modalLayers.length * 2}"
        class="bg-backdrop fixed inset-0 backdrop-blur"
      />
    </Transition>

    <TransitionGroup
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="translate-y-8 opacity-0"
      leave-to-class="-translate-y-5 opacity-0"
    >
      <div
        v-for="(layer, index) in modalLayers"
        :key="layer.id"
        :style="{zIndex: 102 + index * 2}"
        class="no-scrollbar w-modal fixed inset-0 isolate flex items-center justify-center overflow-y-auto overscroll-none"
      >
        <div class="h-[calc(100%+1px)]" />

        <ModalCloseButton @click.stop.prevent="closeModalWithConfirm(layer)" />

        <OverlayLayerProvider
          :layer="layer.id"
          :provides="layer.provides"
          modal
        >
          <component
            :is="layer.content"
            :ref="(value: unknown) => setModalComponent(layer.id, value)"
            v-bind="layer.props"
            @close:modal="closeLayer(layer.id)"
          />
        </OverlayLayerProvider>
      </div>
    </TransitionGroup>

    <!--
      Dropdown layers, such as menus and confirms, sit beside the page without the backdrop — or in a bottom sheet on phones.
      A closed one stays with `closing` until it emits `closed`, so a bottom sheet can slide down first.
    -->
    <OverlayLayerProvider
      v-for="layer in renderedDropdownLayers"
      :key="layer.id"
      :layer="layer.id"
      :provides="layer.provides"
    >
      <OverlayDropdown
        v-bind="layer.dropdown"
        :anchor="layer.anchor!"
        :closing="leavingLayers.includes(layer)"
        :detached="detachedLayers.includes(layer)"
        :busy="isLayerBusy(layer.id)"
        @close="closeLayer(layer.id)"
        @closed="removeLeaving(layer)"
      >
        <component
          :is="layer.content"
          v-bind="layer.props"
          @close:modal="closeLayer(layer.id)"
        />
      </OverlayDropdown>
    </OverlayLayerProvider>
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, onBeforeUnmount, onMounted, provide, shallowRef, watch} from 'vue'

import {SemanticType} from '@/utils/SemanticType'
import {BASE_ZINDEX_MODAL, getIsClientSide, isAnchorConnected, wBaseZIndex} from '@/utils/utils'

import ModalCloseButton from './components/ModalCloseButton.vue'
import OverlayDropdown from './components/OverlayDropdown.vue'
import OverlayLayerProvider from './components/OverlayLayerProvider.vue'
import {wIsModal} from './models/injection'
import {type OverlayLayer, closeChildLayers, closeLayer, isLayerBusy, isTopLayer, openConfirm, setOverlayHost, toClose, useOverlayLayers} from './models/overlayRegistry'
import {useIsBackdrop} from './use/useIsBackdrop'

// Renders every overlay layer in the frame it asks for: modals, and dropdowns such as menus and confirms.
provide(wBaseZIndex, BASE_ZINDEX_MODAL)
provide(wIsModal, true)

const layers = useOverlayLayers()

const modalLayers = computed(() => layers.value.filter(layer => layer.present === 'modal'))
const dropdownLayers = computed(() => layers.value.filter(layer => layer.present === 'dropdown'))

const leavingLayers = shallowRef<OverlayLayer[]>([])

const renderedDropdownLayers = computed(() => [...dropdownLayers.value, ...leavingLayers.value])

const leavingTimeouts = new Map<OverlayLayer, ReturnType<typeof setTimeout>>()

const removeLeaving = (layer: OverlayLayer) => {
  clearTimeout(leavingTimeouts.get(layer))
  leavingTimeouts.delete(layer)

  leavingLayers.value = leavingLayers.value.filter(item => item !== layer)
}

// Anchors taken off the page — the row removed, or the page left, e.g. by a swipe back — leave nothing to stick to.
// The layer gets `detached` and dismisses itself, unless it is busy, such as a confirm with a pending action. A layer stays detached once it is.
const detachedLayers = shallowRef<OverlayLayer[]>([])

const addDetached = (layers: OverlayLayer[]) => {
  const added = layers.filter(layer => !detachedLayers.value.includes(layer))

  if (added.length) detachedLayers.value = [...detachedLayers.value.filter(layer => dropdownLayers.value.includes(layer)), ...added]
}

// Going back or forward restores the scroll before the old page is gone, which would carry a dropdown along with its anchor,
// so every dropdown layer counts as detached as soon as the history entry changes.
const onPopstate = () => {
  addDetached(dropdownLayers.value)
}

let mutationObserver: MutationObserver | null = null
let mutationFrame: number | null = null

const checkAnchors = () => {
  mutationFrame = null

  addDetached(dropdownLayers.value.filter(layer => layer.anchor && !isAnchorConnected(layer.anchor)))
}

watch(() => dropdownLayers.value.length > 0, value => {
  if (!getIsClientSide()) return

  if (value && !mutationObserver) {
    mutationObserver = new MutationObserver(() => {
      if (mutationFrame === null) mutationFrame = requestAnimationFrame(checkAnchors)
    })

    mutationObserver.observe(document.body, {childList: true, subtree: true})
  } else if (!value && mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null

    if (mutationFrame !== null) cancelAnimationFrame(mutationFrame)
    mutationFrame = null

    detachedLayers.value = []
  }
})

watch(dropdownLayers, (value, oldValue) => {
  const closed = oldValue.filter(layer => !value.includes(layer))

  if (!closed.length) return

  leavingLayers.value = [...leavingLayers.value, ...closed]

  // Drops a layer that never emits `closed`, such as a component without an exit.
  closed.forEach(layer => leavingTimeouts.set(layer, setTimeout(() => removeLeaving(layer), 1000)))
})

const isBackdrop = useIsBackdrop()
const modalComponentMap: Record<number, {formRef?: {hasChanges?: boolean}} | undefined> = {}

const setModalComponent = (id: number, value: unknown) => {
  if (value) modalComponentMap[id] = value as {formRef?: {hasChanges?: boolean}}
  else delete modalComponentMap[id]
}

let closeConfirm: (() => void) | null = null

const closeModalWithConfirm = (layer: OverlayLayer): void => {
  // A click beside the modal closes what was opened from it first, such as a menu or a confirm.
  if (closeChildLayers(layer.id)) return

  if (layer.autoclose || !modalComponentMap[layer.id]?.formRef?.hasChanges) {
    closeLayer(layer.id)
    return
  }

  closeConfirm?.()

  closeConfirm = toClose(openConfirm({
    title: 'Are you sure want to close modal?',
    description: 'Closing the modal will undo any changes',
    acceptSemanticType: SemanticType.WARNING,
    acceptText: 'Close',
    onAccept() {
      closeLayer(layer.id)
    },
  }, () => closeConfirm = null, {parent: layer.id}))
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return

  const top = layers.value[layers.value.length - 1]

  if (top?.escape && isTopLayer(top.id) && !isLayerBusy(top.id)) closeLayer(top.id)
}

let timeout: ReturnType<typeof setTimeout> | undefined

watch(() => modalLayers.value.length, value => {
  if (timeout) clearTimeout(timeout)

  if (value) {
    isBackdrop.value = true
  } else {
    timeout = setTimeout(() => {
      timeout = undefined
      isBackdrop.value = false
    }, 100)
  }
})

onBeforeMount(() => {
  setOverlayHost(true)
})

onMounted(() => {
  if (!getIsClientSide()) return

  document.addEventListener('keydown', onKeydown)
  // Capture, to run before the router's own listener.
  window.addEventListener('popstate', onPopstate, true)
})

onBeforeUnmount(() => {
  setOverlayHost(false)

  mutationObserver?.disconnect()

  if (!getIsClientSide()) return

  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('popstate', onPopstate, true)
})
</script>
