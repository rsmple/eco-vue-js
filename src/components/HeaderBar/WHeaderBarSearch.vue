<script setup lang="ts">
import {type VNode, computed, onBeforeUnmount, useSlots, watch} from 'vue'

import {useHeaderSearch} from './use/useHeaderSearch'
import {useHeaderSearchVisible} from './use/useHeaderSearchVisible'

const slots = useSlots()

const {visible, updateVisible} = useHeaderSearchVisible()

const hide = () => {
  updateVisible(false)
}

const slotsDefault = computed(() => slots.default?.({visible: visible.value, hide}))

const {updateHeaderSearch} = useHeaderSearch()

watch(slotsDefault, updateHeaderSearch, {immediate: true})

onBeforeUnmount(() => {
  updateHeaderSearch(undefined)
})

defineSlots<{
  default: (props: {visible?: boolean, hide?: () => void}) => VNode[]
}>()
</script>