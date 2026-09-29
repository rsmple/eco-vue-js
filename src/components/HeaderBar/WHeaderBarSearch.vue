<script setup lang="ts">
import {type VNode, computed, onBeforeUnmount, useSlots, watch} from 'vue'

import {useHeaderSearch} from './use/useHeaderSearch'
import {useHeaderSearchVisible} from './use/useHeaderSearchVisible'

const props = defineProps<{
  /** Opens the search right away, and again whenever it becomes `true`. */
  shown?: boolean
}>()

const slots = useSlots()

const {visible, updateVisible} = useHeaderSearchVisible()

const hide = () => {
  updateVisible(false)
}

const show = () => {
  updateVisible(true)
}

const slotsDefault = computed(() => slots.default?.({visible: visible.value, hide, show}))

const {updateHeaderSearch} = useHeaderSearch()

watch(slotsDefault, updateHeaderSearch, {immediate: true})

watch(() => props.shown, value => {
  if (value) show()
}, {immediate: true})

onBeforeUnmount(() => {
  updateHeaderSearch(undefined)
  hide()
})

defineSlots<{
  /** Search content shown in place of the header's title row when the search button is clicked. `hide` goes back to the title. */
  default: (props: {visible?: boolean, hide?: () => void, show?: () => void}) => VNode[]
}>()
</script>