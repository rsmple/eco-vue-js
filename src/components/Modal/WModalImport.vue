<template>
  <WModalWrapper class="w-modal-wrapper-w-160">
    <template #title>
      {{ title ?? `Importing ${numberFormatter.format(items.length)} item${items.length === 1 ? '' : 's'}` }}
    </template>

    <div>
      <div class="mb-4">
        <WProgressStriped
          :model-value="progress"
          class="h-1.5"
        />

        <div class="text-description mt-1 text-end text-xs">
          {{ itemIndex }} / {{ items.length }}
        </div>
      </div>
    </div>

    <template #actions>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        class="flex-1"
        @click="abortUpload"
      >
        {{ isDone ? successText ?? 'Done' : abortText ?? 'Abort upload' }}
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup generic="Item">
import {computed, onMounted, ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'

import {SemanticType} from '@/utils/SemanticType'
import {handleApiError} from '@/utils/api'
import {numberFormatter} from '@/utils/utils'

import WProgressStriped from '../Progress/WProgressStriped.vue'

const props = defineProps<{
  /** Creates one item. All items are sent at once; `config.signal` aborts a request. */
  createMethod: (item: Item, config: RequestConfig) => Promise<RequestResponse<unknown>>
  /** Items to create. */
  items: Item[]
  /** Title of the modal. Defaults to "Importing N items". */
  title?: string
  /** Text of the button once every item is sent. Defaults to "Done". */
  successText?: string
  /** Text of the button while items are being sent. Defaults to "Abort upload". */
  abortText?: string
  /** Called when every item is sent, or when the modal is closed after that. */
  resolve?: () => void
  /** Called with the number of aborted requests when the upload is aborted. */
  reject?: (length: number) => void
}>()

const emit = defineEmits<{
  /** Every item was sent, or the button was clicked. */
  (e: 'close:modal'): void
}>()

const itemIndex = ref(0)
const abortList = ref<(() => void)[]>([])

const progress = computed<number>(() => {
  if (props.items.length === 0) return 0

  return 100 * itemIndex.value / props.items.length
})

const isDone = computed<boolean>(() => progress.value === 100)

const abortUpload = (): void => {
  if (!isDone.value) {
    const length = abortList.value.length

    abortList.value.forEach(cb => cb())
    abortList.value = []

    props.reject?.(length)
  } else {
    props.resolve?.()
  }

  emit('close:modal')
}

const doUpload = () => {
  const promiseList: Promise<RequestResponse<unknown>>[] = []
  
  props.items.forEach(item => {
    const controller = new AbortController()
    const abort = () => controller.abort()

    abortList.value.push(abort)

    const promise = props
      .createMethod(item, {signal: controller.signal})
      .catch(handleApiError)
      .finally(() => {
        itemIndex.value = itemIndex.value + 1

        const index = abortList.value.indexOf(abort)

        if (index !== -1) abortList.value.splice(index, 1)
      })

    promiseList.push(promise)
  })

  return Promise.all(promiseList)
}

onMounted(() => {
  doUpload()
    .then(() => {
      props.resolve?.()

      emit('close:modal')
    })
})
</script>