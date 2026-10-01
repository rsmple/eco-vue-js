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
          class="tone-negative text-tone"
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
      class="height-64 relative mb-1 block w-full min-w-60 rounded-xl"
      :class="{
        'tone-primary bg-tone/10': !isActive,
        'tone-primary bg-tone/20': isActive,
      }"
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
        :animate="isDragging"
        class="w-border-svg-rounded-xl absolute left-0 top-0"
        :class="{
          'tone-negative text-tone': !!errorMessage,
          'tone-primary text-tone': !errorMessage,
        }"
      />

      <div
        v-if="placeholder"
        class="grid-cols-fit-44 grid h-full items-center justify-center gap-6"
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
        <div class="flex items-center gap-6 overflow-x-auto">
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
        class="tone-negative text-tone absolute right-0 text-xs font-normal"
      >
        {{ errorMessage }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {ref, useTemplateRef} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {SemanticType} from '@/utils/SemanticType'
import {isDragging} from '@/utils/preventDragFile'
import {useComponentStates} from '@/utils/useComponentStates'

import FilePickerItem from './components/FilePickerItem.vue'
import FilePickerSvg from './components/FilePickerSvg.vue'

const props = withDefaults(
  defineProps<{
    /** Picked files. */
    modelValue: File[]
    /** Name of a file that is already saved, such as the current avatar, shown while no file is picked. Removing it emits `clear:placeholder`. */
    placeholder?: string
    /** Lets several files be picked at once. */
    multiple?: boolean
    /** File types the browse dialog offers, as in the input's `accept` attribute, e.g. `image/*,.pdf`. */
    accept?: string
    /** Error shown under the drop zone. The files get a cross instead of a check. */
    errorMessage?: string
    /** Label above the drop zone. */
    title?: string
    /** Shows a placeholder for the title and stops picking. When unset, inherits the skeleton state provided by a parent. */
    skeleton?: boolean
    /** Stops picking. When unset, inherits the readonly state provided by a parent. */
    readonly?: boolean
    /** Stops picking. When unset, inherits the disabled state provided by a parent. */
    disabled?: boolean
    /** Marks the title with a red asterisk. */
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
  /** Files picked with the dialog or dropped, replacing the previous ones, or the files left after one is removed. */
  (e: 'update:model-value', value: File[]): void
  /** The `placeholder` file was removed. */
  (e: 'clear:placeholder'): void
}>()

defineSlots<{
  /** Replaces the `title` text. */
  title?: () => void
  /** Icon of a file, replacing the check. `file` is unset for the `placeholder`. */
  positive?: (props: {file?: File}) => void
  /** Icon of a file while there is an error, replacing the cross. `file` is unset for the `placeholder`. */
  negative?: (props: {file?: File}) => void
}>()

const {isReadonly, isDisabled, isSkeleton} = useComponentStates(props)

const inputRef = useTemplateRef('input')
const isActive = ref(false)

const updateModelValue = (): void => {
  emit('update:model-value', inputRef.value?.files?.length ? Array.from(inputRef.value.files) : [])
}

const setIsActive = (value: boolean): void => {
  isActive.value = value
}

const onDrop = (event: DragEvent): void => {
  setIsActive(false)

  if (isReadonly.value || isDisabled.value || isSkeleton.value) return

  const files = Array.from(event.dataTransfer?.files ?? [])

  if (!files.length) return

  emit('update:model-value', props.multiple ? files : files.slice(0, 1))
}

const unselectFile = (index: number): void => {
  const newFiles = props.modelValue.slice()

  newFiles.splice(index, 1)

  emit('update:model-value', newFiles)

  if (newFiles.length === 0 && inputRef.value) inputRef.value.value = ''
}
</script>
