<template>
  <div ref="element">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {hasParent, isClientSide} from '@/utils/utils'

const emit = defineEmits<{
  (e: 'click'): void
}>()

const element = ref<HTMLDivElement | undefined>()

const clickListener = (event: MouseEvent) => {
  if (!element.value || !(event.target instanceof Element) || hasParent(element.value, event.target)) return

  emit('click')
}

onMounted(() => {
  if (!isClientSide) return

  setTimeout(() => {
    document.addEventListener('click', clickListener)
  })
})

onBeforeUnmount(() => {
  if (!isClientSide) return

  document.removeEventListener('click', clickListener)
})

</script>