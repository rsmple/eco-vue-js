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
import {getCaretOffset} from '../models/utils'

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

  const offsets = getCaret()

  let nodeIndex = 0

  for (const item of props.textParts) {
    const existingNode = elementRef.value.childNodes[nodeIndex] ?? null

    if (typeof item === 'string') {
      // Add space after newlines for cursor positioning
      const displayText = item.replace(/\n$/g, '\n ')
      
      if (existingNode instanceof Text) {
        if (existingNode.textContent !== displayText) existingNode.textContent = displayText
      } else {
        const textNode = document.createTextNode(displayText)
        elementRef.value.insertBefore(textNode, existingNode)
      }
    } else {
      if (existingNode instanceof HTMLElement && existingNode.tagName.toLowerCase() === item.tag.toLowerCase()) {
        if (existingNode.textContent !== item.value) existingNode.textContent = item.value
        if (existingNode.className !== (item.class || '')) existingNode.className = item.class || ''

        const contentEditable = item.edit ? 'plaintext-only' : 'false'
        if (existingNode.getAttribute('contenteditable') !== contentEditable) {
          existingNode.setAttribute('contenteditable', contentEditable)
        }
      } else {
        const element = document.createElement(item.tag)
        element.textContent = item.value
        element.setAttribute('contenteditable', item.edit ? 'plaintext-only' : 'false')
        if (item.class) element.className = item.class

        elementRef.value.insertBefore(element, existingNode)
      }
    }

    nodeIndex++
  }

  while (elementRef.value.childNodes.length > props.textParts.length) {
    const nodeToRemove = elementRef.value.childNodes[props.textParts.length]
    elementRef.value.removeChild(nodeToRemove)
  }

  if (focused.value && !isSetCaretNext) setCaret(offsets.start, offsets.end !== offsets.start ? undefined : offsets.end)
}

watch(() => props.textParts, updateTextParts, {immediate: true})

const updateTextValue = (value: string) => {
  if (props.textParts || !elementRef.value) return
  
  if (elementRef.value.textContent !== value) {
    const offsets = getCaret()
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
  const {start, end} = getCaret()
  const currentText = getCurrentText()
  const next = (currentText ?? '').slice(0, start) + text + ((currentText ?? '').slice(end) || ' ')
  const caretAfter = start + text.length

  emit('update:model-value', props.maxLength && next.length > props.maxLength ? next.substring(0, props.maxLength) : next)
  nextTick(() => setCaret(props.maxLength ? Math.min(caretAfter, props.maxLength) : caretAfter))
}

const getCaret = () => getCaretOffset(elementRef.value)

const getNodeOffset = (index: number | undefined) => {
  if (!elementRef.value || index === undefined) return undefined
  if (!elementRef.value.firstChild) elementRef.value.appendChild(document.createTextNode(''))

  const walker = document.createTreeWalker(elementRef.value, NodeFilter.SHOW_TEXT, null)
  let node, offset = index
  while ((node = walker.nextNode())) {
    const len = node.nodeValue?.length ?? 0
    if (offset <= len && node.parentElement?.contentEditable !== 'false') return {node, offset}
    offset -= len
  }

  const last = elementRef.value.lastChild
  if (!last) return undefined

  if (last.nodeType === Node.TEXT_NODE) {
    return {node: last, offset: last.nodeValue?.length ?? 0}
  }

  const textNode = document.createTextNode('')
  elementRef.value.appendChild(textNode)
  return {node: textNode, offset: 0}
}

let isSetCaretNext = false

const setCaret = (indexStart: number, indexEnd?: number) => {
  isSetCaretNext = false
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
  let offsets = getCaret()
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
        const processedText = value.lineTransformAll ? value.lineTransformAll(lines) : value.lineTransform
          ? lines.map(value.lineTransform).join('\n')
          : lines.map(line => line.trim() ? preserveIndentation(line, value.linePrefix) : line).join('\n')
        newText = beforeLines + processedText + afterLines
        newCursorStart = lineStart
        newCursorEnd = lineStart + processedText.length
      }
      break
  }

  isSetCaretNext = true

  emit('update:model-value', newText)
  requestAnimationFrame(() => setCaret(newCursorStart, newCursorEnd))
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
  getCaret,
  get offsetWidth() {
    return elementRef.value?.offsetWidth ?? 0
  },
})
</script>
