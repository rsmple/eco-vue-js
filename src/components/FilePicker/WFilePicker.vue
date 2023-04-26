<template>
  <div class="mb-6 relative">
    <div
      v-if="title || $slots.title?.()?.length"
      class="text-xs font-semibold text-accent mb-2"
    >
      <template v-if="!skeleton">
        <slot name="title">
          {{ title }}
        </slot>

        <span
          v-if="required"
          class="text-negative dark:text-negative-dark"
        >
          *
        </span>
      </template>

      <WSkeleton
        v-else
        class="h-4 w-16"
      />
    </div>

    <label
      ref="container"
      class="relative block height-64 w-full min-w-[15rem] mb-1"
      @dragenter.prevent="setIsActive(true)"
      @dragover.prevent="setIsActive(true)"
      @dragleave.prevent="setIsActive(false)"
      @dragend.prevent="setIsActive(false)"
      @drop.prevent="onDrop"
    >
      <input
        ref="input"
        type="file"
        class="hidden pointer-events-none"
        :multiple="multiple"
        :accept="accept"
        @change="updateModelValue"
      >

      <FilePickerSvg
        v-if="containerWidth && containerHeight"
        :svg-width="containerWidth"
        :svg-height="containerHeight"
        :is-active="isActive"
        :has-error="errorMessage !== undefined"
        class="absolute top-0 left-0"
      />

      <div
        v-if="placeholder"
        class="flex gap-6 h-full items-center justify-center"
      >
        <FilePickerItem
          :name="placeholder"
          :has-error="errorMessage !== undefined"
          @click:cancel="$emit('clear:placeholder')"
        >
          <template #positive>
            <slot name="positive" />
          </template>

          <template #negative>
            <slot name="negative" />
          </template>
        </FilePickerItem>
      </div>

      <div
        v-if="modelValue.length === 0"
        class="w-full h-full flex flex-col items-center text-base text-accent"
      >
        <div class="font-semibold mt-16">
          Drag and drop files here
        </div>

        <div class="font-normal mt-4">
          or
        </div>

        <WButton
          :semantic-type="SemanticType.PRIMARY"
          class="mt-4"
          @click.stop.prevent="input?.click()"
        >
          Browse file
        </WButton>
      </div>

      <div
        v-else-if="!placeholder"
        class="h-full flex items-center justify-center"
      >
        <div class="overflow-x-overlay flex gap-6 items-center">
          <FilePickerItem
            v-for="(file, index) in modelValue"
            :key="index"
            :name="file.name"
            :has-error="errorMessage !== undefined"
            @click:cancel="unselectFile(index)"
          >
            <template #positive>
              <slot
                name="positive"
                :file="file"
              />
            </template>

            <template #negative>
              <slot
                name="negative"
                :file="file"
              />
            </template>
          </FilePickerItem>
        </div>
      </div>
    </label>

    <Transition
      enter-active-class="fade-enter-active"
      leave-active-class="fade-leave-active"
      enter-from-class="fade-enter-from"
      leave-to-class="fade-leave-to"
    >
      <div
        v-if="errorMessage"
        class="absolute right-0 text-xs text-negative dark:text-negative-dark font-normal"
      >
        {{ errorMessage }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {inject, onMounted, onUnmounted, ref} from 'vue'
import WButton from '@/components/Button/WButton.vue'
import {SemanticType} from '@/utils/SemanticType'
import FilePickerItem from './components/FilePickerItem.vue'
import FilePickerSvg from './components/FilePickerSvg.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import {wTabItemListener, wTabItemUnlistener} from '@/components/Tabs/models/injection'

const props = defineProps<{
  modelValue: File[]
  placeholder?: string
  multiple?: boolean
  accept?: string
  errorMessage?: string
  title?: string
  skeleton?: boolean
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: File[]): void
  (e: 'clear:placeholder'): void
}>()

const input = ref<HTMLInputElement | undefined>()
const container = ref<HTMLLabelElement | undefined>()
const containerWidth = ref<number | undefined>(undefined)
const containerHeight = ref<number | undefined>(undefined)
const isActive = ref(false)

const updateModelValue = (): void => {
  emit('update:modelValue', input.value?.files?.length ? Array.from(input.value.files) : [])
}

const setIsActive = (value: boolean): void => {
  isActive.value = value
}

const onDrop = (event: DragEvent): void => {
  setIsActive(false)

  emit('update:modelValue', event.dataTransfer?.files?.length ? Array.from(event.dataTransfer.files) : [])
}

const unselectFile = (index: number): void => {
  const newFiles = props.modelValue.slice()

  newFiles.splice(index, 1)

  emit('update:modelValue', newFiles)

  if (newFiles.length === 0 && input.value) input.value.value = ''
}

const preventDefaults = (e: Event) => {
  e.preventDefault()
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

const updateSize = () => {
  containerWidth.value = container.value?.offsetWidth
  containerHeight.value = container.value?.offsetHeight
}

const tabItemListenerInjected = inject(wTabItemListener, null)
const tabItemUnlistenerInjected = inject(wTabItemUnlistener, null)

onMounted(() => {
  updateSize()

  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })

  window.addEventListener('resize', updateSize)

  tabItemListenerInjected?.(updateSize)
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })

  window.removeEventListener('resize', updateSize)

  tabItemUnlistenerInjected?.(updateSize)
})

</script>
