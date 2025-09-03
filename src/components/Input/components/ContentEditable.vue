<template>
  <div
    ref="element"
    contenteditable="plaintext-only"
    role="textbox"
    aria-multiline="true"
    spellcheck="false"
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
import type {TextPart,  WrapSelection} from '../types'

import {defineEmits, defineProps, nextTick, onMounted, ref, useTemplateRef, watch} from 'vue'

import {WrapSelectionType} from '@/utils/utils'

import {preserveIndentation} from '../models/toolbarActions'

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

  while (elementRef.value.childNodes.length > props.textParts.length) {
    const nodeToRemove = elementRef.value.childNodes[props.textParts.length]
    elementRef.value.removeChild(nodeToRemove)
  }

  if (focused.value) setCaret(offsets.start, offsets.end !== offsets.start ? undefined : offsets.end)
}

watch(() => props.textParts, updateTextParts, {immediate: true})

const updateTextValue = (value: string) => {
  if (props.textParts || !elementRef.value) return
  
  if (elementRef.value.textContent !== value) {
    const offsets = getSelectionOffsets()
    elementRef.value.textContent = value
    if (focused.value) setCaret(offsets.start, offsets.end !== offsets.start ? undefined : offsets.end)
  }
}

watch(() => props.value, updateTextValue, {immediate: true})

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

    if (!props.textParts) updateTextValue(substring)
    else updateTextParts()

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

  emit('update:model-value', props.maxLength && next.length > props.maxLength ? next.substring(0, props.maxLength) : next)
  nextTick(() => setCaret(props.maxLength ? Math.min(caretAfter, props.maxLength) : caretAfter))
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

const collapseList = [' ', '\n']

let offsetsOld: {start: number, end: number} | null = null

const wrapSelection = (value: WrapSelection): void => {
  let offsets = getSelectionOffsets()
  if (focused.value || !offsetsOld) offsetsOld = offsets
  else offsets = offsetsOld
  const currentText = getCurrentText() ?? ''
  
  let newText = ''
  let newCursorStart = offsets.start
  let newCursorEnd: number | undefined = undefined
  
  switch (value.type) {
    case WrapSelectionType.TOGGLE:
      let startLen = value.start.length
      const endLen = value.end.length
      const textWithContext = currentText.slice(
        Math.max(0, offsets.start - startLen),
        Math.min(currentText.length, offsets.end + endLen),
      )

      if ((!value.start || textWithContext.startsWith(value.start)) && (!value.end || textWithContext.endsWith(value.end))) {
        let expandedStart = Math.max(0, offsets.start - startLen)
        let start = currentText.slice(0, expandedStart)
        const middle = currentText.slice(offsets.start, offsets.end)
        let end = currentText.slice(Math.min(currentText.length, offsets.end + endLen))
        for (const item of collapseList) {
          if (value.start.startsWith(item) && !start.endsWith(item) && !middle.startsWith(item)) {
            start += item
            expandedStart += item.length
          }
          if (value.end.endsWith(item) && !end.startsWith(item) && !middle.endsWith(item)) end = item + end
        }
        newText = start + middle + end
        if (value.prepare) newText = value.prepare(newText, 0)
        newCursorStart = expandedStart
        newCursorEnd = expandedStart + offsets.end - offsets.start
      } else {
        if (!value.start || !value.end) {
          const offset = value.start ? offsets.start : offsets.end
          let start = currentText.slice(0, offset)
          let end = currentText.slice(offset)
          for (const item of collapseList) {
            if (value.start.startsWith(item) && start.endsWith(item)) {
              start = start.slice(0, offsets.start - item.length)
              startLen -= item.length
            }
            if (value.end.endsWith(item) && end.startsWith(item)) end = end.slice(item.length)
          }
          newText = (value.prepare?.(start, 0) ?? start) + (value.start || value.end) + (value.prepare?.(end, offset) ?? end)
        } else {
          let start = currentText.slice(0, offsets.start)
          const middle = currentText.slice(offsets.start, offsets.end)
          let end = currentText.slice(offsets.end)
          for (const item of collapseList) {
            if (value.start.startsWith(item) && start.endsWith(item)) {
              start = start.slice(0, offsets.start - item.length)
              startLen -= item.length
            }
            if (value.end.endsWith(item) && end.startsWith(item)) end = end.slice(item.length)
          }
          newText = (value.prepare?.(start, 0) ?? start) + value.start + (value.prepare?.(middle, offsets.start) ?? middle) + value.end + (value.prepare?.(end, offsets.end) ?? end)
        }
        
        newCursorStart = offsets.start + startLen
        if (offsets.start !== offsets.end) newCursorEnd = newCursorStart + offsets.end - offsets.start
      }
      break
    
    case WrapSelectionType.LINE_PREFIX: 
      const lineStart = currentText.lastIndexOf('\n', offsets.start - 1) + 1
      const lineEnd = currentText.indexOf('\n', offsets.end)
      const actualLineEnd = lineEnd === -1 ? currentText.length : lineEnd
      
      const linesText = currentText.slice(lineStart, actualLineEnd)
      const beforeLines = currentText.slice(0, lineStart)
      const afterLines = currentText.slice(actualLineEnd)
      
      const lines = linesText.split('\n')
      if (lines.length === 0) lines.push('')

      const allLinesHavePrefix = value.detectPattern
        ? lines.every(line => !line.trim() || value.detectPattern!.test(line))
        : value.linePrefix
          ? lines.every(line => !line.trim() || line.startsWith(value.linePrefix))
          : false
      
      if (allLinesHavePrefix) {
        const cleanText = lines.map(line => preserveIndentation(line, '')).join('\n')
        newText = beforeLines + cleanText + afterLines
        newCursorStart = lineStart
        newCursorEnd = lineStart + cleanText.length
      } else {
        const processedLines: string[] = value.lineTransform
          ? lines.map(value.lineTransform)
          : lines.map(line => line.trim() ? preserveIndentation(line, value.linePrefix) : line)

        const processedText = processedLines.join('\n')
        newText = beforeLines + processedText + afterLines
        newCursorStart = lineStart
        newCursorEnd = lineStart + processedText.length
      }
      break
  }
  
  emit('update:model-value', newText)
  nextTick(() => setCaret(newCursorStart, newCursorEnd))
}

const focus = () => {
  elementRef.value?.focus()
}

const blur = () => {
  elementRef.value?.blur()
}

onMounted(() => {
  updateTextValue(props.value)
  updateTextParts()
})

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
