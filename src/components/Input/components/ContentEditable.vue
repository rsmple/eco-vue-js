<template>
  <div
    ref="element"
    contenteditable="plaintext-only"
    role="textbox"
    aria-multiline="true"
    spellcheck="false"
    :textContent="textParts ? undefined : value"
    :placeholder="placeholder"
    class="relative whitespace-pre"
    @input="onInput"
    @beforeinput="insertParagraph($event as InputEvent)"
    @paste="onPaste"
    @keydown="$emit('keydown', $event)"
    @focus="$emit('focus', $event); focused = true"
    @blur="$emit('blur', $event); focused = false"
  />
</template>

<script lang="ts" setup>
import type {TextPart, WrapSelection} from '../types'

import {defineEmits, defineProps, nextTick, ref, useTemplateRef, watch} from 'vue'

const props = defineProps<{
  value: string
  placeholder: string
  maxLength: number
  textParts: TextPart[] | undefined
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: string): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
  (e: 'keydown', value: KeyboardEvent): void
}>()

const elementRef = useTemplateRef('element')
const focused = ref(false)

const updateTextParts = () => {
  if (!elementRef.value || !props.textParts) return

  const offsets = getSelectionOffsets()
  const existingNodes = Array.from(elementRef.value.childNodes)

  let nodeIndex = 0

  for (const item of props.textParts) {
    const existingNode = existingNodes[nodeIndex]

    if (typeof item === 'string') {
      // Add space after newlines for cursor positioning
      const displayText = item.replace(/\n$/g, '\n ')
      
      if (existingNode?.nodeType === Node.TEXT_NODE) {
        if (existingNode.textContent !== displayText) {
          existingNode.textContent = displayText
        }
      } else {
        const textNode = document.createTextNode(displayText)
        elementRef.value.insertBefore(textNode, existingNode || null)
      }
    } else {
      if (existingNode?.nodeType === Node.ELEMENT_NODE &&
        (existingNode as HTMLElement).tagName.toLowerCase() === item.tag.toLowerCase()) {
        const element = existingNode as HTMLElement

        if (element.textContent !== item.value) {
          element.textContent = item.value
        }

        const contentEditable = item.edit ? 'plaintext-only' : 'false'
        if (element.getAttribute('contenteditable') !== contentEditable) {
          element.setAttribute('contenteditable', contentEditable)
        }

        if (element.className !== (item.class || '')) {
          element.className = item.class || ''
        }
      } else {
        const element = document.createElement(item.tag)
        element.textContent = item.value
        element.setAttribute('contenteditable', item.edit ? 'plaintext-only' : 'false')
        if (item.class) element.className = item.class

        elementRef.value.insertBefore(element, existingNode || null)
      }
    }

    nodeIndex++
  }

  while (nodeIndex < existingNodes.length) {
    elementRef.value.removeChild(existingNodes[nodeIndex])
    nodeIndex++
  }

  if (focused.value) setCaret(offsets.start, offsets.end !== offsets.start ? undefined : offsets.end)
}

watch(() => props.textParts, updateTextParts, {immediate: true})

const textPartsToText = (parts: TextPart[]): string => {
  return parts.map(part => typeof part === 'string' ? part : part.value).join('')
}

const getCurrentText = (): string => {
  return props.textParts ? textPartsToText(props.textParts) : props.value
}

const lineBreakEvents = ['insertParagraph', 'insertLineBreak']

const insertParagraph = (e: InputEvent) => {
  if (lineBreakEvents.includes(e.inputType)) {
    e.preventDefault()

    insertPlain('\n')
  }
}

const regexDifferentEnding = /\r\n?/g
const regexSpaces = /\n \n/g
const regexEnding = / +$/gm

const normalizeText = (text: string): string => {
  return text
    .replace(regexDifferentEnding, '\n')
    .replace(regexSpaces, '\n\n')
    .replace(regexEnding, '')
}

const onInput = (e: Event) => {
  e.stopImmediatePropagation()

  if (!(e.target instanceof HTMLDivElement)) return

  const rawText = e.target.textContent ?? ''
  const text = normalizeText(rawText)
  const currentText = getCurrentText()

  if (text === currentText) return

  if (props.maxLength && typeof text === 'string' && text.length > props.maxLength) {
    e.preventDefault()

    const substring = text.substring(0, props.maxLength)

    if (e.target && !props.textParts) e.target.textContent = substring

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
  const currentText = getCurrentText()
  const next = (currentText ?? '').slice(0, start) + text + ((currentText ?? '').slice(end) || ' ')
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
  const currentText = getCurrentText() ?? ''
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
