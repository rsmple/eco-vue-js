<template>
  <slot :items="items" />
</template>

<script setup lang="ts" generic="Data extends DefaultData, Inner extends {id: number | string}">
import {computed} from 'vue'

const props = defineProps<{
  item: Data
  skeleton: boolean
  meta: {keyArray: keyof Data} | {getterArray: (data: Data) => Inner[]}
}>()

const items = computed<Inner[]>(() => {
  if (props.skeleton) return [props.item] as unknown as Inner[]
  if ('keyArray' in props.meta) return props.item[props.meta.keyArray] as Inner[]
  return props.meta.getterArray(props.item)
})

defineSlots<{
  default: (props: {items: Inner[]}) => void
}>()
</script>
