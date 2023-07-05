<template>
  <div>
    <component
      :is="isMobile ? WBottomSheet : WDropdownMenu"
      ref="dropdownMenu"
      v-bind="isMobile ? {isOpen, onClose: close} : {isOpen, maxHeight: 320, maxWidth: 600, horizontalAlign: HorizontalAlign.FILL, updateAlign: true, teleport}"
    >
      <template #toggle="{unclickable}">
        <WInput
          ref="input"
          :title="title"
          :model-value="modelValue"
          :max-length="maxLength"
          :loading="loading"
          :hide-input="hideInput"
          :readonly="readonly || unclickable"
          :skeleton="skeleton"
          :size="size"
          :error-message="errorMessage"
          :required="required"
          :disabled="disabled"
          :has-changes="hasChanges"
          :allow-clear="allowClear"
          :icon="icon"
          :placeholder="placeholder"
          :class="{
            'cursor-pointer': !disabled,
            'cursor-not-allowed': disabled,
          }"
          @update:model-value="!loading && $emit('update:modelValue', $event as string ?? '')"

          @keypress:enter="$emit('keypress:enter', $event)"
          @keypress:up="$emit('keypress:up', $event)"
          @keypress:down="$emit('keypress:down', $event)"
          @keypress:delete="$emit('keypress:delete', $event)"

          @focus="open(); !unclickable && $emit('focus')"
          @blur="!isMobile && !persist && close(); !unclickable && $emit('blur')"
        
          @click="isMobile && unclickable && open()"
          @click:internal="isMobile && unclickable && open()"
          @click:clear="$emit('click:clear')"
        >
          <template #prefix>
            <slot
              name="prefix"
              :unclickable="unclickable"
            />
          </template>

          <template #suffix>
            <IconArrow
              v-if="!disabled"
              class="square-3 text-description transition-transform"
              :class="{'rotate-180': isOpen}"
            />
          </template>

          <template #right>
            <slot name="right" />
          </template>
        </WInput>
      </template>

      <template #content>
        <div
          ref="content"
          class="bg-default dark:bg-default-dark w-full"
          :class="{
            'max-h-full pb-20': isMobile,
            'rounded-xl shadow-md max-h-72 overflow-x-hidden overflow-y-overlay overscroll-contain mb-1 mt-4 dark:border dark:border-solid dark:border-gray-800': !isMobile,
          }"
        >
          <template v-if="$slots.content?.().length">
            <template
              v-for="(slot, index) in $slots.content?.()"
              :key="index"
            >
              <component
                :is="slot"
                :scrolling-element="isMobile ? content?.parentElement : content"
                @close="close"
              />
            </template>
          </template>
        </div>
      </template>
    </component>

    <div
      v-if="description"
      class="text-xs font-normal text-description pb-4 whitespace-pre-wrap break-words"
    >
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed} from 'vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WInput from '@/components/Input/WInput.vue'
import IconArrow from '@/assets/icons/default/IconArrow.svg?component'
import {getIsMobile} from '@/utils/mobile'
import {HorizontalAlign} from '@/utils/HorizontalAlign'

const props = defineProps<{
  modelValue?: string | number
  title?: string
  description?: string
  loading?: boolean
  maxLength?: number
  allowClear?: boolean
  hideInput?: boolean
  readonly?: boolean
  disabled?: boolean
  skeleton?: boolean
  persist?: boolean
  size?: number
  errorMessage?: string
  required?: boolean
  hasChanges?: boolean
  icon?: SVGComponent
  teleport?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', event: string): void
  (e: 'keypress:enter', event: KeyboardEvent): void
  (e: 'keypress:up', event: KeyboardEvent): void
  (e: 'keypress:down', event: KeyboardEvent): void
  (e: 'keypress:delete', event: KeyboardEvent): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'click:clear'): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}>()

const isOpen = ref(false)
const dropdownMenu = ref<InstanceType<typeof WDropdownMenu> | undefined>()
const input = ref<InstanceType<typeof WInput> | undefined>()
const isMobile = getIsMobile()
const content = ref<HTMLDivElement | undefined>()

const isDisabled = computed(() => props.readonly || props.disabled)

const open = () => {
  if (isDisabled.value) return

  isOpen.value = true

  emit('open')
}

const close = () => {
  isOpen.value = false

  emit('close')
}

const focus = () => {
  if (isMobile) open()

  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
}

const updateDropdown = () => {
  dropdownMenu.value?.updateDropdown?.()
}

defineExpose({
  focus,
  blur,
  close,
  updateDropdown,
})

</script>
