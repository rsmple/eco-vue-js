const collectLines = (parent: Element): HTMLElement[] => {
  const out: HTMLElement[] = []
  for (const child of Array.from(parent.children)) {
    if (child instanceof HTMLElement && child.classList.contains('line')) out.push(child)
  }
  return out
}

const findInLine = (line: HTMLElement, offsetInLine: number): {node: Node, offset: number} => {
  const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, null)
  let node: Node | null
  let remaining = offsetInLine
  let lastEditable: Text | null = null
  while ((node = walker.nextNode())) {
    const text = node as Text
    const len = text.nodeValue?.length ?? 0
    const editable = text.parentElement?.contentEditable !== 'false'
    if (editable && remaining <= len) return {node: text, offset: Math.max(remaining, 0)}
    if (editable) lastEditable = text
    remaining -= len
  }
  if (lastEditable) return {node: lastEditable, offset: lastEditable.nodeValue?.length ?? 0}

  let container: Element = line
  while (container.firstElementChild
    && container.firstElementChild.tagName !== 'BR'
    && (container.firstElementChild as HTMLElement).contentEditable !== 'false') {
    container = container.firstElementChild
  }
  return {node: container, offset: 0}
}

const getNodeOffset = (parent: Element | null | undefined, index: number | undefined) => {
  if (!parent || index === undefined) return undefined
  if (!parent.firstChild) parent.appendChild(document.createTextNode(''))

  const lines = collectLines(parent)

  if (lines.length === 0) {
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null)
    let node, offset = index
    while ((node = walker.nextNode())) {
      const len = node.nodeValue?.length ?? 0
      if (offset <= len && node.parentElement?.contentEditable !== 'false') return {node, offset: Math.max(offset, 0)}
      offset -= len
    }
    const last = parent.lastChild
    if (!last) return undefined
    if (last.nodeType === Node.TEXT_NODE) return {node: last, offset: last.nodeValue?.length ?? 0}
    const textNode = document.createTextNode('')
    parent.appendChild(textNode)
    return {node: textNode, offset: 0}
  }

  let remaining = index
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const lineLen = (line.textContent ?? '').length
    if (remaining <= lineLen || i === lines.length - 1) {
      return findInLine(line, Math.max(remaining, 0))
    }
    remaining -= lineLen + 1
  }

  return findInLine(lines[lines.length - 1]!, remaining)
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

const offsetWithinLine = (line: HTMLElement, targetNode: Node, targetOffset: number, isStart: boolean): number => {
  if (line === targetNode) {
    let sum = 0
    for (let i = 0; i < targetOffset && i < line.childNodes.length; i++) {
      sum += line.childNodes[i]?.textContent?.length ?? 0
    }
    return sum
  }

  let result: number | null = null
  let cumulative = 0

  const visit = (node: Node): void => {
    if (result !== null) return
    for (const child of Array.from(node.childNodes)) {
      if (result !== null) return
      if (child === targetNode) {
        if (child.nodeType === Node.TEXT_NODE) {
          if ((child as Text).parentElement?.contentEditable === 'false') {
            result = cumulative + (isStart ? 0 : (child.nodeValue?.length ?? 0))
          } else {
            result = cumulative + targetOffset
          }
        } else {
          let sum = 0
          for (let i = 0; i < targetOffset && i < child.childNodes.length; i++) {
            sum += child.childNodes[i]?.textContent?.length ?? 0
          }
          result = cumulative + sum
        }
        return
      }
      if (child instanceof Element && child.contains(targetNode)) {
        visit(child)
      } else {
        cumulative += child.textContent?.length ?? 0
      }
    }
  }

  visit(line)
  return result !== null ? result : cumulative
}

const getOffsetFromNode = (parent: Element, targetNode: Node, targetOffset: number, isStart: boolean): {offset: number} => {
  if (!parent.firstChild) parent.appendChild(document.createTextNode(''))

  const lines = collectLines(parent)

  if (lines.length === 0) {
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null)
    let node, offset = 0
    while ((node = walker.nextNode())) {
      if (node.parentElement?.contentEditable === 'false') {
        if (isStart && node === targetNode) return {offset}
      } else if (node === targetNode) {
        return {offset: offset + targetOffset}
      }
      offset += node.nodeValue?.length ?? 0
    }
    return {offset}
  }

  let baseOffset = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line === targetNode || line.contains(targetNode)) {
      return {offset: baseOffset + offsetWithinLine(line, targetNode, targetOffset, isStart)}
    }
    baseOffset += (line.textContent ?? '').length
    if (i < lines.length - 1) baseOffset += 1
  }

  return {offset: baseOffset}
}

export const getCaretOffset = (parent: Element | null | undefined): CaretOffset => {
  if (!parent) return {start: 0, end: 0}
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return {start: 0, end: 0}
  const range = selection.getRangeAt(0)

  const start = getOffsetFromNode(parent, range.startContainer, range.startOffset, true)
  const end = range.startOffset !== range.endOffset ? getOffsetFromNode(parent, range.endContainer, range.endOffset, false) : start

  return {start: start.offset, end: end.offset}
}
