<script setup lang="ts">
import {type VNode, computed, onBeforeUnmount, useSlots, watch} from 'vue'

import {useActionBarFilter} from './use/useActionsBarFilter'

const props = defineProps<{
  /** Number of filters set, shown as a badge on the filter button. */
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
  /** Filters, shown in the panel that slides out of the actions bar. */
  default: () => VNode[]
}>()
</script>