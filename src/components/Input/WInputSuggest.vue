<template>
  <div :class="$attrs.class">
    <component
      :is="isMobile ? WBottomSheet : WDropdownMenu"
      ref="dropdownMenu"
      v-bind="isMobile ? {
        isOpen,
        onClose: close
      } : {
        isOpen,
        maxHeight,
        maxWidth,
        horizontalAlign,
        updateAlign: true,
        teleport
      }"
    >
      <template #toggle="{unclickable}">
        <WInput
          ref="input"
          v-bind="{
            ...props,
            title: unclickable ? mobileTitle ?? title : title,
            readonly: readonly || unclickable,
            description: undefined,
          }"
          :class="{
            'cursor-pointer': !disabled,
            'cursor-not-allowed': disabled,
            'mb-3': isMobile && !unclickable,
          }"
          @update:model-value="!loading && $emit('update:modelValue', $event as ModelValue)"

          @keypress:enter="$emit('keypress:enter', $event)"
          @keypress:up="$emit('keypress:up', $event)"
          @keypress:down="$emit('keypress:down', $event)"
          @keypress:delete="$emit('keypress:delete', $event)"

          @focus="open(); !unclickable && $emit('focus', $event)"
          @blur="!isMobile && !persist && close(); !unclickable && $emit('blur', $event)"

          @click="isMobile && unclickable && open()"
          @click:suffix="isMobile && unclickable && open()"
          @click:clear="$emit('click:clear')"
        >
          <template
            v-if="$slots.title"
            #title
          >
            <slot name="title" />
          </template>

          <template
            v-if="$slots.subtitle"
            #subtitle
          >
            <slot name="subtitle" />
          </template>

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

          <template
            v-if="$slots.right?.()?.length"
            #right
          >
            <slot name="right" />
          </template>
        </WInput>
      </template>

      <template #content="contentScope">
        <div
          ref="content"
          class="bg-default dark:bg-default-dark w-full"
          :class="{
            'pb-[50vh]': isMobile,
            'rounded-xl max-h-[inherit] shadow-md overflow-x-hidden overflow-y-overlay overscroll-contain dark:border dark:border-solid dark:border-gray-800': !isMobile,
            'mt-5': 'istop' in contentScope && contentScope.istop === false && (errorMessage || maxLength),
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
      :class="{
        'opacity-50': disabled && !skeleton,
      }"
    >
      <WSkeleton v-if="skeleton" />

      <template v-else>
        {{ description }}
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import {ref, computed} from 'vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WInput from '@/components/Input/WInput.vue'
import IconArrow from '@/assets/icons/default/IconArrow.svg?component'
import {getIsMobile, getIsTouchDevice} from '@/utils/mobile'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import type {InputSuggestProps} from './types'

type ModelValue = Required<InputSuggestProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputSuggestProps<Type>>(),
  {
    maxHeight: 320,
    maxWidth: 600,
    horizontalAlign: HorizontalAlign.FILL,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', event: ModelValue): void
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
const input = ref<ComponentInstance<typeof WInput<Type>> | undefined>()
const isMobile = getIsMobile() || getIsTouchDevice()
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

defineSlots<{
  title?: () => void
  subtitle?: () => void
  prefix?: (props: {unclickable?: boolean}) => void
  right?: (props: Record<string, never>) => void
  content?: (props: {scrollingElement?: Element}) => void
}>()

</script>
