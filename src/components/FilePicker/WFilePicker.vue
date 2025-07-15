<template>
  <div class="relative mb-6">
    <div
      v-if="title || $slots.title"
      class="text-accent mb-2 text-xs font-semibold"
    >
      <template v-if="!isSkeleton">
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
        class="w-skeleton-h-4 w-skeleton-w-16"
      />
    </div>

    <label
      ref="container"
      class="height-64 relative mb-1 block w-full min-w-60"
      @dragenter.prevent="setIsActive(true)"
      @dragover.prevent="setIsActive(true)"
      @dragleave.prevent="setIsActive(false)"
      @dragend.prevent="setIsActive(false)"
      @drop.prevent="onDrop"
    >
      <input
        v-if="!isReadonly && !isDisabled && !isSkeleton"
        ref="input"
        type="file"
        class="pointer-events-none hidden"
        :multiple="multiple"
        :accept="accept"
        @change="updateModelValue"
      >

      <FilePickerSvg
        v-if="containerWidth && containerHeight"
        :svg-width="containerWidth"
        :svg-height="containerHeight"
        :is-active="isActive"
        :has-error="!!errorMessage"
        class="absolute left-0 top-0"
      />

      <div
        v-if="placeholder"
        class="grid-cols-fill-44 grid h-full items-center justify-center gap-6"
      >
        <FilePickerItem
          :name="placeholder"
          :has-error="!!errorMessage"
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
        v-else-if="modelValue.length === 0"
        class="text-accent flex size-full flex-col items-center"
      >
        <div class="mt-16 font-semibold">
          Drag and drop files here
        </div>

        <div class="mt-4 font-normal">
          or
        </div>

        <WButton
          :semantic-type="SemanticType.PRIMARY"
          :disabled="isReadonly || isDisabled"
          class="mt-4"
          @click.stop.prevent="inputRef?.click()"
        >
          Browse file
        </WButton>
      </div>

      <div
        v-else
        class="flex h-full items-center justify-center"
      >
        <div class="overflow-x-overlay flex items-center gap-6">
          <FilePickerItem
            v-for="(file, index) in modelValue"
            :key="index"
            :name="file.name"
            :has-error="!!errorMessage"
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
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="errorMessage"
        class="text-negative dark:text-negative-dark absolute right-0 text-xs font-normal"
      >
        {{ errorMessage }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, useTemplateRef} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {SemanticType} from '@/utils/SemanticType'
import {useComponentStates} from '@/utils/useComponentStates'
import {isClientSide} from '@/utils/utils'

import FilePickerItem from './components/FilePickerItem.vue'
import FilePickerSvg from './components/FilePickerSvg.vue'

import {useTabActiveListener} from '../Tabs/use/useTabActiveListener'

const props = withDefaults(
  defineProps<{
    modelValue: File[]
    placeholder?: string
    multiple?: boolean
    accept?: string
    errorMessage?: string
    title?: string
    skeleton?: boolean
    readonly?: boolean
    disabled?: boolean
    required?: boolean
  }>(),
  {
    placeholder: undefined,
    accept: undefined,
    errorMessage: undefined,
    title: undefined,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: File[]): void
  (e: 'clear:placeholder'): void
}>()

const {isReadonly, isDisabled, isSkeleton} = useComponentStates(props)

const inputRef = useTemplateRef('input')
const containerRef = useTemplateRef('container')
const containerWidth = ref<number | undefined>(undefined)
const containerHeight = ref<number | undefined>(undefined)
const isActive = ref(false)

const updateModelValue = (): void => {
  emit('update:modelValue', inputRef.value?.files?.length ? Array.from(inputRef.value.files) : [])
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

  if (newFiles.length === 0 && inputRef.value) inputRef.value.value = ''
}

const preventDefaults = (e: Event) => {
  e.preventDefault()
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

const updateSize = () => {
  containerWidth.value = containerRef.value?.offsetWidth
  containerHeight.value = containerRef.value?.offsetHeight
}

useTabActiveListener(updateSize)

onMounted(() => {
  if (!isClientSide) return

  updateSize()

  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })

  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  if (!isClientSide) return

  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })

  window.removeEventListener('resize', updateSize)
})
</script>
