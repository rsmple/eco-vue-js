<template>
  <WForm
    v-if="!removable || active"
    v-show="active"
    ref="form"
    :name="name"
    :title="title"
    class="h-full"
    @update:is-valid="$event === false && $emit('tab:switch', name)"
  >
    <slot />
  </WForm>
</template>

<script lang="ts" setup>
import {nextTick, toRef, useTemplateRef, watch} from 'vue'

import WForm from '@/components/Form/WForm.vue'

import {useTabItemActiveListener} from '../use/useTabItemActiveListener'

const props = defineProps<{
  name: string
  title: string | undefined
  active: boolean
  removable: boolean
}>()

const emit = defineEmits<{
  (e: 'tab:switch', value: string): void
  (e: 'update:height', value: number): void
  (e: 'update:active'): void
}>()

const {callListeners} = useTabItemActiveListener()

const formRef = useTemplateRef('form')

const emitHeight = (): void => {
  if (!formRef.value) return

  emit('update:height', formRef.value.$el.offsetHeight)
}

watch(() => props.active, async value => {
  if (value) emit('update:active')

  if (value) await nextTick()

  emitHeight()

  if (value) callListeners()
}, {immediate: true})

defineExpose({
  emitHeight,
  name: toRef(props, 'name'),
})
</script>