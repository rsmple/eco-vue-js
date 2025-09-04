export type CaretOffset = {start: number, end: number}

export const getCaretOffset = (parent: Element | null | undefined): CaretOffset => {
  if (!parent) return {start: 0, end: 0}
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return {start: 0, end: 0}
  const range = selection.getRangeAt(0)

  const pre = range.cloneRange()
  pre.selectNodeContents(parent)
  pre.setEnd(range.startContainer, range.startOffset)
  const start = pre.toString().length

  const selected = range.toString().length
  return {start, end: start + selected}
}
