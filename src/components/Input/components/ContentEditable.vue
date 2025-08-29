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
      whitespace-pre empty:before:pointer-events-none empty:before:text-gray-400
      empty:before:[content:attr(placeholder)] dark:empty:before:text-gray-500
    "
    @input="onInput"
    @paste="onPaste"
    @keydown="onKeyDown"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  />
</template>

<script lang="ts" setup>
import {defineEmits, defineProps, nextTick, useTemplateRef} from 'vue'

const props = defineProps<{
  value: string
  placeholder?: string
  maxLength?: number
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: string): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
  (e: 'keydown', value: KeyboardEvent): void
}>()

const elementRef = useTemplateRef('element')

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

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    insertPlain('\n')
  } else {
    emit('keydown', e)
  }
}

const insertPlain = (text: string) => {
  const root = elementRef.value
  if (!root) return
  const {start, end} = getSelectionOffsets(root)
  const next = (props.value ?? '').slice(0, start) + text + ((props.value ?? '').slice(end) || ' ')
  const caretAfter = start + text.length

  emit('update:model-value', next)
  nextTick(() => setCaretByCharIndex(root, caretAfter))
}

const getSelectionOffsets = (root: HTMLDivElement) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return {start: 0, end: 0}
  const range = selection.getRangeAt(0)

  // Build a range from start of root to caret start to measure text length
  const pre = range.cloneRange()
  pre.selectNodeContents(root)
  pre.setEnd(range.startContainer, range.startOffset)
  const start = pre.toString().length

  const selected = range.toString().length
  return {start, end: start + selected}
}

const setCaretByCharIndex = (root: HTMLDivElement, index: number) => {
  // Ensure there is at least one text node
  if (!root.firstChild) root.appendChild(document.createTextNode(''))

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let node, pos = index
  while ((node = walker.nextNode())) {
    const len = node.nodeValue?.length ?? 0
    if (pos <= len) {
      const r = document.createRange()
      r.setStart(node, pos)
      r.collapse(true)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(r)
      return
    }
    pos -= len
  }

  const last = root.lastChild
  if (!last) return
  const r = document.createRange()
  r.setStart(last, last.nodeType === Node.TEXT_NODE && last.nodeValue ? last.nodeValue.length : last.childNodes.length)
  r.collapse(true)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(r)
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
  get offsetWidth() {
    return elementRef.value?.offsetWidth ?? 0
  },
})
</script>
