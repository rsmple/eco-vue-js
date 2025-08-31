<template>
  <div
    ref="element"
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    spellcheck="false"
    :textContent="value"
    :placeholder="placeholder"
    class="
      relative whitespace-pre empty:before:pointer-events-none
      empty:before:text-gray-400 empty:before:[content:attr(placeholder)] dark:empty:before:text-gray-500
    "
    @input="onInput"
    @beforeinput="insertParagraph"
    @paste="onPaste"
    @keydown="$emit('keydown', $event)"
    @focus="$emit('focus', $event); focused = true"
    @blur="$emit('blur', $event); focused = false"
  />
</template>

<script lang="ts" setup>
import type {WrapSelection} from '../types'

import {defineEmits, defineProps, nextTick, ref, useTemplateRef} from 'vue'

const props = defineProps<{
  value: string
  placeholder: string
  maxLength: number
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: string): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
  (e: 'keydown', value: KeyboardEvent): void
}>()

const elementRef = useTemplateRef('element')
const focused = ref(false)

const insertParagraph = (e: Event) => {
  if ((e as InputEvent).inputType === 'insertParagraph') {
    e.preventDefault()

    insertPlain('\n')
  }
}

const onInput = (e: Event) => {
  e.stopImmediatePropagation()

  if (!(e.target instanceof HTMLDivElement)) return

  const text = e.target.textContent?.replace(/\r\n?/g, '\n') ?? ''

  if (text === props.value) return

  if (props.maxLength && typeof text === 'string' && text.length > props.maxLength) {
    e.preventDefault()

    const substring = text.substring(0, props.maxLength)

    if (e.target) e.target.textContent = substring

    emit('update:model-value', substring)
  } else {
    emit('update:model-value', text)
  }
}

const onPaste = async (e: ClipboardEvent) => {
  e.preventDefault()

  navigator.clipboard.readText()
  const text = (e.clipboardData?.getData('text/plain') || await navigator.clipboard.readText()).replace(/\r\n?/g, '\n')
 
  insertPlain(text)
}

const insertPlain = (text: string) => {
  const root = elementRef.value
  if (!root) return
  const {start, end} = getSelectionOffsets()
  const next = (props.value ?? '').slice(0, start) + text + ((props.value ?? '').slice(end) || ' ')
  const caretAfter = start + text.length

  emit('update:model-value', next)
  nextTick(() => setCaret(caretAfter))
}

const getSelectionOffsets = () => {
  const selection = window.getSelection()
  if (!elementRef.value || !selection || selection.rangeCount === 0) return {start: 0, end: 0}
  const range = selection.getRangeAt(0)

  const pre = range.cloneRange()
  pre.selectNodeContents(elementRef.value)
  pre.setEnd(range.startContainer, range.startOffset)
  const start = pre.toString().length

  const selected = range.toString().length
  return {start, end: start + selected}
}

const getNodeOffset = (index: number | undefined) => {
  if (!elementRef.value || index === undefined) return undefined
  if (!elementRef.value.firstChild) elementRef.value.appendChild(document.createTextNode(''))

  const walker = document.createTreeWalker(elementRef.value, NodeFilter.SHOW_TEXT, null)
  let node, offset = index
  while ((node = walker.nextNode())) {
    const len = node.nodeValue?.length ?? 0
    if (offset <= len) return {node, offset}
    offset -= len
  }

  const last = elementRef.value.lastChild
  if (!last) return undefined
  return {node: last, offset: last.nodeType === Node.TEXT_NODE && last.nodeValue ? last.nodeValue.length : last.childNodes.length}
}

const setCaret = (indexStart: number, indexEnd?: number) => {
  const start = getNodeOffset(indexStart)

  if (start === undefined) return

  const range = document.createRange()
  range.setStart(start.node, start.offset)

  const end = getNodeOffset(indexEnd)
  if (end !== undefined) range.setEnd(end.node, end.offset)
  else range.collapse(true)

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

let offsetsOld: {start: number, end: number} | null = null

const wrapSelection = (value: WrapSelection): void => {
  const root = elementRef.value
  if (!root) return

  let offsets = getSelectionOffsets()
  if (focused.value || !offsetsOld) offsetsOld = offsets
  else offsets = offsetsOld
  const currentText = props.value ?? ''
  const selectedText = currentText.slice(offsets.start, offsets.end)
  
  const beforeSelection = currentText.slice(0, offsets.start)
  const afterSelection = currentText.slice(offsets.end)
  
  const newText = beforeSelection + (value.start || '') + selectedText + (value.end || '') + afterSelection
  
  const cursorPosition = offsets.start + (value.end ? (value.start?.length ?? 0) + selectedText.length : 0)
  
  emit('update:model-value', newText)
  nextTick(() => setCaret(cursorPosition))
}

const focus = () => {
  elementRef.value?.focus()
}

const blur = () => {
  elementRef.value?.blur()
}

defineExpose({
  focus,
  blur,
  wrapSelection,
  setCaret,
  getSelectionOffsets,
  get offsetWidth() {
    return elementRef.value?.offsetWidth ?? 0
  },
})
</script>
