<template>
  <div
    v-if="loading || $slots.default || textSecure || allowCopy || ((allowPaste || allowClear) && !disabled && !readonly)"
    class="flex rounded-xl overflow-hidden bg-default dark:bg-default-dark"
  >
    <InputActionsButton
      v-if="allowClear && !disabled && !readonly"
      :icon="markRaw(IconClose)"
      tooltip-text="Clear"
      @click="$emit('click:clear')"
    />

    <InputActionsButton
      v-if="allowCopy && !textSecure"
      :icon="markRaw(iconCopy)"
      tooltip-text="Copy"
      @click="doCopy"
    />

    <InputActionsButton
      v-if="allowPaste && !disabled && !readonly"
      :icon="markRaw(IconPaste)"
      tooltip-text="Paste"
      @click="$emit('click:paste')"
    />

    <InputActionsButton
      v-if="textSecure"
      :icon="isSecureVisible ? markRaw(IconEye) : markRaw(IconEyeSlash)"
      :tooltip-text="isSecureVisible ? 'Hide' : 'Show'"
      :disabled="disabled || readonly"
      :top="!focused"
      @click="isSecureVisible ? $emit('hide:secure', $event) : $emit('show:secure', $event)"
    />

    <div
      v-if="loading"
      class="h-full w-11 flex items-center justify-center text-description cursor-progress"
    >
      <WSpinner class="[--spinner-size:1.5rem]" />
    </div>

    <InputActionsButton
      v-else-if="$slots.default"
      :disabled="disabled"
      @click="$emit('click:slot', $event)"
    >
      <slot name="default" />
    </InputActionsButton>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, toRef} from 'vue'
import IconClose from '@/assets/icons/sax/IconClose.svg?component'
import IconEye from '@/assets/icons/sax/IconEye.svg?component'
import IconEyeSlash from '@/assets/icons/sax/IconEyeSlash.svg?component'
import IconPaste from '@/assets/icons/sax/IconPaste.svg?component'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import {useCopy} from '@/utils/useCopy'
import InputActionsButton from './InputActionsButton.vue'

const props = defineProps<{
  modelValue?: number | string
  loading?: boolean
  allowClear?: boolean
  allowPaste?: boolean
  allowCopy?: boolean
  disabled?: boolean
  readonly?: boolean
  textSecure?: boolean
  isSecureVisible?: boolean
  focused?: boolean
}>()

defineEmits<{
  (e: 'click:paste'): void
  (e: 'show:secure', value: MouseEvent): void
  (e: 'hide:secure', value: MouseEvent): void
  (e: 'click:clear'): void
  (e: 'click:slot', value: MouseEvent): void
}>()

const {doCopy, iconCopy} = useCopy(toRef(props, 'modelValue'))

</script>