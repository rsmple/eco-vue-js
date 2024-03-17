<template>
  <div class="grid grid-cols-1 content-start pb-16">
    <template
      v-for="(slot, index) in $slots.default?.()"
      :key="index"
    >
      <component
        :is="slot"
        :is-open="index === selectedIndex"
        @toggle="setSelectedIndex(index)"
        @update:has-changes="hasChangesMap[index.toString()] = $event"
      />
    </template>

    <div class="h-0.5 bg-gray-400 rounded my-8" />

    <div class="grid grid-cols-2 gap-4">
      <slot name="bottom" />
    
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="!changesCount"
        class="col-start-2"
        @click="openConfirmReset"
      >
        <IconFilterRemove /> Reset Filters
      </WButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import WButton from '@/components/Button/WButton.vue'
import {SemanticType} from '@/utils/SemanticType'
import IconFilterRemove from '@/assets/icons/sax/IconFilterRemove.svg?component'
import {Modal} from '@/utils/Modal'
import type {LocationQueryRaw} from 'vue-router'
import {throttle} from '@/utils/utils'

const props = defineProps<{
  defaultQueryFields?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:count', value: number): void
}>()

const route = useRoute()
const router = useRouter()

const selectedIndex = ref<number | null>(null)
const hasChangesMap = ref<Record<string, boolean>>({})

const changesCount = computed(() => Object.values(hasChangesMap.value).filter(item => item).length)

const setSelectedIndex = throttle((index: number): void => {
  if (selectedIndex.value === index) {
    selectedIndex.value = null
  } else {
    selectedIndex.value = index
  }
}, 300)

let closeModal: (() => void) | null = null

const openConfirmReset = () => {
  closeModal?.()

  closeModal = Modal
    .addConfirm(
      {
        title: 'Are you sure?',
        description: 'Do you want to reset filters?',
        acceptText: 'Reset Filters',
        onAccept: () => {
          closeModal = null

          const query: LocationQueryRaw = {ordering: route.query.ordering}

          props.defaultQueryFields?.forEach(key => {
            query[key] = route.query[key]
          })

          router.push({query})
        },
      },
    )
}

watch(changesCount, value => emit('update:count', value), {immediate: true})

onUnmounted(() => {
  closeModal?.()

  closeModal = null
})

</script>