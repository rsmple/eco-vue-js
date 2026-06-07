<template>
  <code
    ref="element"
    :contenteditable="readonly || disabled ? 'false' : 'plaintext-only'"
    role="textbox"
    aria-multiline="true"
    spellcheck="false"
    class="relative [white-space:var(--w-input-whitespace,pre)]"
    @input="onInput"
    @beforeinput="handleBeforeInput($event as InputEvent)"
    @keydown="$emit('keydown', $event)"
    @focus="$emit('focus', $event); focused = true"
    @blur="$emit('blur', $event); focused = false"
  />
</template>

<script lang="ts" setup>
import type {TextPart,  WrapSelection} from '../types'

import {nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch} from 'vue'

import {WrapSelectionType} from '@/utils/utils'

import {type Line, buildLines} from '../models/buildLines'
import {preserveIndentation} from '../models/toolbarActions'
import {getCaretOffset, setCaretOffset} from '../models/utils'

const props = defineProps<{
  value: string
  placeholder: string
  maxLength: number
  textParts: TextPart[] | undefined
  readonly: boolean | undefined
  disabled: boolean | undefined
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: string, noDebounce?: boolean): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
  (e: 'keydown', value: KeyboardEvent): void
  (e: 'rendered', taggedList: HTMLElement[]): void
}>()

const elementRef = useTemplateRef<HTMLElement>('element')
const focused = ref(false)

const setTaggedText = (el: HTMLElement, text: string) => {
  for (const child of (el.childNodes as unknown as ChildNode[])) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.nodeValue !== text) child.nodeValue = text
      return
    }
  }
  el.insertBefore(document.createTextNode(text), el.firstChild)
}

const ensureInner = (outerLine: HTMLElement): HTMLElement => {
  if (outerLine.childNodes.length === 1 && outerLine.firstChild instanceof HTMLDivElement) {
    return outerLine.firstChild as HTMLElement
  }
  while (outerLine.firstChild) outerLine.removeChild(outerLine.firstChild)
  const inner = document.createElement('div')
  outerLine.appendChild(inner)
  return inner
}

const reconcileLineChildren = (outerLine: HTMLElement, line: Line, taggedById: Map<string, HTMLElement>) => {
  const inner = ensureInner(outerLine)

  if (line.length === 0) {
    if (inner.childNodes.length === 1 && inner.firstChild instanceof HTMLBRElement) return []
    while (inner.firstChild) inner.removeChild(inner.firstChild)
    inner.appendChild(document.createElement('br'))
    return []
  }

  const taggedList: HTMLElement[] = []

  let nodeIndex = 0
  for (const item of line) {
    let existingNode: ChildNode | null = inner.childNodes[nodeIndex] ?? null

    while (existingNode instanceof HTMLBRElement) {
      inner.removeChild(existingNode)
      existingNode = inner.childNodes[nodeIndex] ?? null
    }

    if (typeof item === 'string') {
      if (existingNode instanceof Text) {
        if (existingNode.textContent !== item) existingNode.textContent = item
      } else {
        const textNode = document.createTextNode(item)
        inner.insertBefore(textNode, existingNode)
      }
    } else {
      let reused: HTMLElement | null = null

      if (item.id) {
        const fromMap = taggedById.get(item.id)
        if (fromMap && fromMap.tagName.toLowerCase() === item.tag.toLowerCase()) {
          taggedById.delete(item.id)
          reused = fromMap
        }
      }

      if (!reused
        && existingNode instanceof HTMLElement
        && existingNode.tagName.toLowerCase() === item.tag.toLowerCase()) {
        reused = existingNode
      }

      if (reused) {
        if (reused !== existingNode) inner.insertBefore(reused, existingNode)
        setTaggedText(reused, item.value)
        if (reused.className !== (item.class || '')) reused.className = item.class || ''
        if (reused.id !== (item.id || '')) reused.id = item.id || ''
        if (item.edit === false && reused.getAttribute('contenteditable') !== 'false') {
          reused.setAttribute('contenteditable', 'false')
        }

        taggedList.push(reused)
      } else {
        const element = document.createElement(item.tag)
        setTaggedText(element, item.value)
        element.setAttribute('contenteditable', item.edit ? 'plaintext-only' : 'false')
        if (item.class) element.className = item.class
        if (item.id) element.id = item.id
        inner.insertBefore(element, existingNode)

        taggedList.push(element)
      }
    }

    nodeIndex++
  }

  while (inner.childNodes.length > line.length) {
    const nodeToRemove = inner.childNodes[line.length]
    if (nodeToRemove) inner.removeChild(nodeToRemove)
  }

  return taggedList
}

const updateLines = () => {
  const root = elementRef.value
  if (!root) return

  const offsets = focused.value ? getCaret() : null
  const sourceParts: TextPart[] = props.textParts ?? [props.value ?? '']
  const lines = buildLines(sourceParts)

  const taggedById = new Map<string, HTMLElement>()
  for (const outer of Array.from(root.children)) {
    if (!(outer instanceof HTMLElement) || !outer.classList.contains('line')) continue
    const inner = outer.firstChild
    if (!(inner instanceof HTMLElement)) continue
    for (const child of Array.from(inner.children)) {
      if (child instanceof HTMLElement && child.id) taggedById.set(child.id, child)
    }
  }
  const taggedList: HTMLElement[] = []

  for (let i = 0; i < lines.length; i++) {
    let outerLine = root.childNodes[i] as Node | null
    if (!(outerLine instanceof HTMLElement) || !outerLine.classList.contains('line')) {
      if (outerLine) root.removeChild(outerLine)
      const newOuter = document.createElement('div')
      newOuter.className = 'line'
      const next = root.childNodes[i] ?? null
      root.insertBefore(newOuter, next)
      outerLine = newOuter
    }
    taggedList.push(...reconcileLineChildren(outerLine as HTMLElement, lines[i]!, taggedById))
  }

  while (root.childNodes.length > lines.length) {
    const nodeToRemove = root.childNodes[lines.length]
    if (nodeToRemove) root.removeChild(nodeToRemove)
  }

  if (offsets && !isSetCaretNext) setCaret(offsets.start, offsets.end !== offsets.start ? undefined : offsets.end)

  emit('rendered', taggedList)
}

watch(() => props.textParts, updateLines)
watch(() => props.value, () => { if (!props.textParts) updateLines() })

const textPartsToText = (parts: TextPart[]): string => {
  return parts.map(part => typeof part === 'string' ? part : part.value).join('')
}

const getCurrentText = (): string => {
  return props.textParts ? textPartsToText(props.textParts) : props.value
}

const computeTextFromDom = (): string => {
  const root = elementRef.value
  if (!root) return ''
  const result: string[] = []
  for (const child of Array.from(root.childNodes)) {
    if (child instanceof HTMLElement && child.classList.contains('line')) {
      result.push(child.textContent ?? '')
    }
  }
  return result.join('\n')
}

const lineBreakEvents = ['insertParagraph', 'insertLineBreak']

const autoPairMap: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  '\'': '\'',
  '`': '`',
}

const handleLineBoundaryDelete = (e: InputEvent): boolean => {
  const {start, end} = getCaret()
  const currentText = getCurrentText()

  if (start !== end) {
    if (!currentText.slice(start, end).includes('\n')) return false
    e.preventDefault()
    const newText = currentText.slice(0, start) + currentText.slice(end)
    emit('update:model-value', newText, true)
    nextTick(() => setCaret(start))
    return true
  }

  if (e.inputType === 'deleteContentBackward') {
    if (start === 0 || currentText[start - 1] !== '\n') return false
    e.preventDefault()
    const newText = currentText.slice(0, start - 1) + currentText.slice(start)
    emit('update:model-value', newText, true)
    nextTick(() => setCaret(start - 1))
    return true
  }

  if (start >= currentText.length || currentText[start] !== '\n') return false
  e.preventDefault()
  const newText = currentText.slice(0, start) + currentText.slice(start + 1)
  emit('update:model-value', newText, true)
  nextTick(() => setCaret(start))
  return true
}

const handleBeforeInput = (e: InputEvent) => {
  if (lineBreakEvents.includes(e.inputType)) {
    e.preventDefault()

    const {start} = getCaret()
    const currentText = getCurrentText()
    const lineStart = currentText.lastIndexOf('\n', start - 1) + 1
    const currentLine = currentText.slice(lineStart, start)
    const leadingSpaces = currentLine.match(/^[ ]*/)?.[0] || ''

    insertPlain('\n' + leadingSpaces)
    return
  }

  if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
    if (handleLineBoundaryDelete(e)) return
  }

  if (e.inputType === 'insertText' && e.data && autoPairMap[e.data]) {
    e.preventDefault()

    const {start, end} = getCaret()
    const currentText = getCurrentText()
    const closingChar = autoPairMap[e.data]

    if (start !== end) {
      const before = currentText.slice(0, start)
      const selected = currentText.slice(start, end)
      const after = currentText.slice(end)
      const newText = before + e.data + selected + closingChar + after

      emit('update:model-value', newText, true)
      nextTick(() => setCaret(start + 1, end + 1))
    } else {
      const newText = currentText.slice(0, start) + e.data + closingChar + currentText.slice(start)

      emit('update:model-value', newText, true)
      nextTick(() => setCaret(start + 1))
    }
  }
}

const regexDifferentEnding = /\r\n?/g

const onInput = (e: Event) => {
  e.stopImmediatePropagation()

  if (!(e.target instanceof HTMLElement)) return

  const text = computeTextFromDom().replace(regexDifferentEnding, '\n')
  const currentText = getCurrentText()

  if (text === currentText) return

  if (props.maxLength && text.length > props.maxLength) {
    emit('update:model-value', text.substring(0, props.maxLength))
  } else {
    emit('update:model-value', text)
  }
}

const insertPlain = (text: string) => {
  const root = elementRef.value
  if (!root) return
  const {start, end} = getCaret()
  const currentText = getCurrentText()
  const next = (currentText ?? '').slice(0, start) + text + (currentText ?? '').slice(end)
  const caretAfter = start + text.length

  emit('update:model-value', props.maxLength && next.length > props.maxLength ? next.substring(0, props.maxLength) : next, true)
  nextTick(() => setCaret(props.maxLength ? Math.min(caretAfter, props.maxLength) : caretAfter))
}

const getCaret = () => getCaretOffset(elementRef.value)

let isSetCaretNext = false

const setCaret = (indexStart: number, indexEnd?: number) => {
  isSetCaretNext = false
  setCaretOffset(elementRef.value, indexStart, indexEnd)
}

const collapseList = [' ', '\n']

let offsetsOld: {start: number, end: number} | null = null

const wrapSelection = (value: WrapSelection): void => {
  if (focused.value || !offsetsOld) offsetsOld = getCaret()
  const offsets = offsetsOld
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
          if (value.prepare) {
            start = value.prepare(start, 0)
            end = value.prepare(end, offset)
          }
          if (value.lineBreakPadding) {
            if (start.endsWith('\n')) start += ' '
            if (end.startsWith('\n')) end = ' ' + end
          }
          newText = start + (value.start || value.end) + end
        } else {
          let start = currentText.slice(0, offsets.start)
          let middle = currentText.slice(offsets.start, offsets.end)
          let end = currentText.slice(offsets.end)
          for (const item of collapseList) {
            if (value.start.startsWith(item) && start.endsWith(item)) {
              start = start.slice(0, offsets.start - item.length)
              startLen -= item.length
            }
            if (value.end.endsWith(item) && end.startsWith(item)) end = end.slice(item.length)
          }
          if (value.prepare) {
            start = value.prepare(start, 0)
            middle = value.prepare(middle, offsets.start)
            end = value.prepare(end, offsets.end)
          }
          if (value.lineBreakPadding) {
            if (start.endsWith('\n')) start += ' '
            if (end.startsWith('\n')) end = ' ' + end
          }
          newText = start + value.start + middle + value.end + end
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

  emit('update:model-value', newText, true)
  requestAnimationFrame(() => setCaret(newCursorStart, newCursorEnd))
}

const focus = () => {
  elementRef.value?.focus()
}

const blur = () => {
  elementRef.value?.blur()
}

const updateActiveLine = () => {
  const root = elementRef.value
  if (!root) return

  const selection = window.getSelection()
  let activeLine: HTMLElement | null = null

  if (selection && selection.focusNode && root.contains(selection.focusNode)) {
    let node: Node | null = selection.focusNode
    while (node && node !== root) {
      if (node instanceof HTMLElement && node.classList.contains('line')) {
        activeLine = node
        break
      }
      node = node.parentNode
    }
  }

  for (const child of Array.from(root.children)) {
    if (!(child instanceof HTMLElement)) continue
    child.classList.toggle('line-active', child === activeLine)
  }
}

onMounted(() => {
  updateLines()
  document.addEventListener('selectionchange', updateActiveLine)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', updateActiveLine)
})

defineExpose({
  focus,
  blur,
  wrapSelection,
  setCaret,
  getCaret,
  insertPlain,
  get offsetWidth() {
    return elementRef.value?.offsetWidth ?? 0
  },
})
</script>
