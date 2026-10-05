<template>
  <div class="grid max-w-xl gap-2">
    <span class="text-description text-sm">Select a few words:</span>

    <p
      ref="text"
      class="leading-relaxed"
      @mouseup="updateRange"
      @keyup="updateRange"
    >
      Monstera likes bright, indirect light and a chunky, well-draining mix. Water it when the top few centimetres of
      soil are dry, and wipe the leaves now and then so they can breathe.
    </p>

    <Teleport to="body">
      <WDropdown
        v-if="range"
        :parent-element="range"
        :horizontal-align="HorizontalAlign.CENTER"
        inner-class="w-max tone-surface-raised flex flex-col items-center"
        update-align
        top
        class="z-50"
      >
        <template #default="{isTop}">
          <WDropdownTip :top="isTop" />

          <div class="w-dropdown-frame w-tooltip-center-x flex gap-1 p-1">
            <WMenuItem @click="add">
              Add to notes
            </WMenuItem>
          </div>
        </template>
      </WDropdown>
    </Teleport>

    <ul
      v-if="notes.length"
      class="text-description list-disc pl-5 text-sm"
    >
      <li
        v-for="note in notes"
        :key="note"
      >
        {{ note }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef} from 'vue'

import {HorizontalAlign} from 'eco-vue-js/dist/utils/HorizontalAlign'

import WDropdown from 'eco-vue-js/dist/components/Dropdown/WDropdown.vue'
import WDropdownTip from 'eco-vue-js/dist/components/Dropdown/WDropdownTip.vue'
import WMenuItem from 'eco-vue-js/dist/components/MenuItem/WMenuItem.vue'

const textRef = useTemplateRef('text')

const range = shallowRef<Range>()
const notes = ref<string[]>([])

// The dropdown follows the selected text, a `Range`, as the page scrolls.
const updateRange = () => {
  const selection = document.getSelection()
  const selected = selection?.rangeCount ? selection.getRangeAt(0) : undefined

  range.value = selected && !selected.collapsed && textRef.value?.contains(selected.commonAncestorContainer) ? selected : undefined
}

const add = () => {
  const text = range.value?.toString().trim()

  if (text) notes.value.push(text)

  document.getSelection()?.removeAllRanges()
  range.value = undefined
}

onMounted(() => document.addEventListener('selectionchange', updateRange))
onBeforeUnmount(() => document.removeEventListener('selectionchange', updateRange))
</script>
