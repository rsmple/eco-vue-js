const getNodeOffset = (parent: Element | null | undefined, index: number | undefined) => {
  if (!parent || index === undefined) return undefined
  if (!parent.firstChild) parent.appendChild(document.createTextNode(''))

  const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null)
  let node, offset = index
  while ((node = walker.nextNode())) {
    const len = node.nodeValue?.length ?? 0
    if (offset <= len && node.parentElement?.contentEditable !== 'false') return {node, offset: Math.max(offset, 0)}
    offset -= len
  }

  const last = parent.lastChild
  if (!last) return undefined

  if (last.nodeType === Node.TEXT_NODE) {
    return {node: last, offset: last.nodeValue?.length ?? 0}
  }

  const textNode = document.createTextNode('')
  parent.appendChild(textNode)
  return {node: textNode, offset: 0}
}

export type CaretOffset = {start: number, end: number}

export const setCaretOffset = (parent: Element | null | undefined, indexStart: number, indexEnd: number | undefined) => {
  const start = getNodeOffset(parent, indexStart)

  if (start === undefined) return

  const range = document.createRange()
  range.setStart(start.node, start.offset)

  const end = getNodeOffset(parent, indexEnd)
  if (end !== undefined) range.setEnd(end.node, end.offset)
  else range.collapse(true)

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

const getOffsetFromNode = (parent: Element, targetNode: Node, targetOffset: number, isStart: boolean): number => {
  if (!parent.firstChild) parent.appendChild(document.createTextNode(''))
  
  const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null)
  let node, offset = 0
  
  while ((node = walker.nextNode())) {
    if (node.parentElement?.contentEditable === 'false') {
      if (isStart && node === targetNode) return offset
    } else if (node === targetNode) {
      return offset + targetOffset
    }

    offset += node.nodeValue?.length ?? 0
  }
  
  return offset
}

export const getCaretOffset = (parent: Element | null | undefined): CaretOffset => {
  if (!parent) return {start: 0, end: 0}
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return {start: 0, end: 0}
  const range = selection.getRangeAt(0)

  const start = getOffsetFromNode(parent, range.startContainer, range.startOffset, true)
  const end = range.startOffset !== range.endOffset ? getOffsetFromNode(parent, range.endContainer, range.endOffset, false) : start

  return {start, end}
}
