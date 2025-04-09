<script setup lang="ts">
import {type VNode, computed, onBeforeUnmount, useSlots, watch} from 'vue'

import {useActionBarFilter} from './use/useActionsBarFilter'

const props = defineProps<{
  count: number
}>()

const slots = useSlots()

const slotsDefault = computed(() => slots.default?.())

const {updateFilter, updateCount} = useActionBarFilter()

watch(slotsDefault, updateFilter, {immediate: true})

watch(() => props.count, updateCount, {immediate: true})

onBeforeUnmount(() => {
  updateFilter(undefined)
  updateCount(0)
})

defineSlots<{
  default: () => VNode[]
}>()
</script>