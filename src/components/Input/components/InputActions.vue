<template>
  <div
    v-if="loading || $slots.default || textSecure || allowCopy || ((allowPaste || allowClear || allowDropFile) && !disabled && !readonly)"
    class="bg-default dark:bg-default-dark flex overflow-hidden rounded-[--w-input-rounded,0.75rem]"
    :class="{
      'flex-col': textarea,
    }"
    @mousedown.prevent.stop
  >
    <InputActionsButton
      v-if="allowClear && !readonly"
      :icon="markRaw(IconClose)"
      :disabled="disabled"
      :tooltip-right="textarea"
      tooltip-text="Clear"
      top
      @click="$emit('click:clear')"
    />

    <InputActionsButton
      v-if="allowCopy && !textSecure"
      :icon="markRaw(iconCopy)"
      :tooltip-right="textarea"
      tooltip-text="Copy"
      top
      @click="doCopy"
    />

    <InputActionsButton
      v-if="allowPaste && !readonly"
      :icon="markRaw(IconPaste)"
      :disabled="disabled"
      :tooltip-right="textarea"
      tooltip-text="Paste"
      top
      @click="$emit('click:paste')"
    />

    <InputActionsButton
      v-if="allowDropFile && !readonly"
      :icon="markRaw(IconUpload)"
      :disabled="disabled"
      :tooltip-right="textarea"
      tooltip-text="Read from file"
      top
      @click="$emit('click:drop-file')"
    />

    <InputActionsButton
      v-if="textSecure"
      :icon="isSecureVisible ? markRaw(IconEye) : markRaw(IconEyeSlash)"
      :tooltip-text="isSecureVisible ? 'Hide' : 'Show'"
      :disabled="disabled || readonly"
      :tooltip-right="textarea"
      top
      @click="isSecureVisible ? $emit('hide:secure', $event) : $emit('show:secure', $event)"
    />

    <div
      v-if="loading"
      class="text-description flex h-full w-11 cursor-progress items-center justify-center"
    >
      <WSpinner class="w-spinner-size-[1.125em]" />
    </div>

    <slot
      name="default"
      :loading="loading"
      :disabled="disabled"
    />
  </div>
</template>

<script lang="ts" setup>
import {markRaw, toRef} from 'vue'

import WSpinner from '@/components/Spinner/WSpinner.vue'

import IconClose from '@/assets/icons/IconClose.svg?component'
import IconEye from '@/assets/icons/IconEye.svg?component'
import IconEyeSlash from '@/assets/icons/IconEyeSlash.svg?component'
import IconPaste from '@/assets/icons/IconPaste.svg?component'
import IconUpload from '@/assets/icons/IconUpload.svg?component'

import {useCopy} from '@/utils/useCopy'

import InputActionsButton from './InputActionsButton.vue'

const props = defineProps<{
  modelValue?: number | string
  loading?: boolean
  allowClear?: boolean
  allowPaste?: boolean
  allowCopy?: boolean
  allowDropFile?: boolean
  disabled?: boolean
  readonly?: boolean
  textSecure?: boolean
  isSecureVisible?: boolean
  focused?: boolean
  textarea?: boolean
}>()

defineEmits<{
  (e: 'click:paste'): void
  (e: 'click:drop-file'): void
  (e: 'show:secure', value: MouseEvent): void
  (e: 'hide:secure', value: MouseEvent): void
  (e: 'click:clear'): void
}>()

const {doCopy, iconCopy} = useCopy(toRef(props, 'modelValue'))
</script>