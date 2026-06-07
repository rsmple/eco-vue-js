import {ref} from 'vue'

import {getIsClientSide} from './utils'

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

export const isDragging = ref(false)

const preventDefaults = (e: Event) => {
  if (!(e instanceof DragEvent) || !e.dataTransfer || !e.dataTransfer.types.includes('Files')) return

  e.preventDefault()

  isDragging.value = e.type === 'dragenter' || e.type === 'dragover'
}

let isPrevented = false

export const preventDragFile = () => {
  if (!getIsClientSide() || isPrevented) return

  isPrevented = true

  events.forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults)
  })
}