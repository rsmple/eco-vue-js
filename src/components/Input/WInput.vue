<template>
  <WFieldWrapper
    ref="fieldWrapper"
    v-bind="props"
    :class="$attrs.class"
    @click="$emit('click:suffix', $event); seamless && focus()"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template
      v-if="$slots.subtitle && unclickable !== false"
      #subtitle
    >
      <slot name="subtitle" />
    </template>

    <template
      v-if="isReadonly"
      #default
    >
      <div
        class="flex gap-1"
        :class="{
          'flex-wrap': !seamless,
          'overflow-hidden': seamless,
        }"
      >
        <slot name="prefix" />
        <div
          v-if="!hideInput"
          :class="{
            'font-mono': mono,
            'text-secure': textSecure && !isSecureVisible && modelValue,
          }"
        >
          {{ modelValue || emptyValue }}
        </div>
      </div>
    </template>

    <template
      v-else
      #field="{id, setFocused, focused}"
    >
      <div
        class="
          relative grid min-h-[--w-input-min-height,var(--w-input-height,2.75rem)] grid-cols-[auto,1fr,auto]
          overflow-hidden rounded-[--w-input-rounded,0.75rem] border border-solid
        "
        :class="{
          'focus-within:border-primary dark:focus-within:border-primary-dark focus-within:outline-primary/20 dark:focus-within:outline-primary-dark/20 focus-within:outline focus-within:outline-2': !isDisabled && !isReadonly && !unclickable,
          'cursor-text': !isDisabled,
          'border-negative dark:border-negative-dark': errorMessage,
          'border-gray-300 dark:border-gray-700': !isDisabled,
          'border-gray-300/50 dark:border-gray-700/50': isDisabled,
          'border-opacity-0 group-hover/field:border-opacity-100 dark:border-opacity-0 dark:group-hover/field:border-opacity-100': seamless && !focused,
          'bg-default dark:bg-default-dark': !seamless || focused,
        }"
        @click="focus"
        @mousedown.prevent=""
      >
        <div
          v-if="icon"
          class="flex h-full w-[--w-input-height,2.75rem] select-none items-center justify-center"
          :class="{
            'text-description': !focused,
            'text-primary dark:text-primary-dark': focused,
          }"
        >
          <component
            :is="icon"
            class="square-[1.125em]"
          />
        </div>

        <div
          ref="content"
          class="group/input col-start-2 grid grid-cols-1"
          :class="{
            'py-[--w-input-gap,0.25rem] first:pl-[--w-input-gap,0.25rem] last:pr-[--w-input-gap,0.25rem]': $slots.prefix,
            'no-scrollbar overflow-x-auto overscroll-x-contain': noWrap && (!seamless || focused),
            'overflow-hidden': noWrap && (seamless && !focused),
          }"
        >
          <div
            class="flex gap-[--w-input-gap,0.25rem]"
            :class="{
              '[&:not(:has(.w-option-has-bg))]:-px--w-option-padding': !icon && !textarea,
              'flex-wrap': !noWrap,
            }"
          >
            <slot name="prefix" />

            <div
              class="flex flex-1 items-baseline"
              :class="{
                'absolute w-0 max-w-0': hideInput,
                'w-option-has-bg-input': $slots.prefix,
              }"
            >
              <slot name="before" />

              <component
                :is="textarea ? 'textarea' : 'input'"
                :id="id"
                ref="input"
                class="
                  w-input max-w-full flex-1 basis-auto appearance-none border-none bg-[inherit] font-normal
                  outline-0 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-80 dark:placeholder:text-gray-500
                "
                :class="{
                  '-p--w-option-padding min-h-[--w-textarea-height,10rem] w-full': textarea,
                  'resize-y': resize && textarea,
                  'resize-none': !resize && textarea,
                  'h-[calc(var(--w-input-height,2.75rem)-2px)]': !textarea && !$slots.suffix,
                  'w-option': !textarea && $slots.prefix,
                  'font-mono': mono,
                  'text-secure': textSecure && !isSecureVisible,
                  'text-black-default dark:text-gray-200': !isDisabled,
                  'text-black-default/50 dark:text-gray-200/50': isDisabled,
                }"
                :value="placeholderSecure && modelValue === undefined && !focused ? '******' : modelValue"
                :placeholder="placeholder"
                :type="type ?? 'text'"
                :name="name"
                :disabled="isDisabled"
                :readonly="isReadonly || unclickable"
                :autocomplete="autocomplete"
                :size="size || undefined"
                :step="step"
                :min="min"
                :max="max"
                :spellcheck="spellcheck ? 'true' : 'false'"
                @input="handleInputEvent"
                @keypress.enter.exact="!isDisabled && !isReadonly && $emit('keypress:enter', $event)"
                @keydown.up.exact.stop="!isDisabled && !isReadonly && $emit('keypress:up', $event)"
                @keydown.down.exact.stop="!isDisabled && !isReadonly && $emit('keypress:down', $event)"
                @keydown.delete.exact.stop="!isDisabled && !isReadonly && $emit('keypress:delete', $event); handleBackspace($event)"
                @focus="
                  $emit('focus', $event);
                  setFocused(true);
                  seamless && nextTick(scrollToInput);
                "
                @blur="
                  $emit('blur', $event);
                  setFocused(false);
                  isSecureVisible = false;
                  seamless && contentRef?.scrollTo({left: 0});
                "
                @click="$emit('click', $event)"
                @mousedown.stop="$emit('mousedown', $event)"
                @select.stop="$emit('select:input', $event)"
              />

              <slot name="after" />
            </div>
          </div>
        </div>

        <InputActions
          v-if="!seamless || focused"
          :model-value="(modelValue as ModelValue)"
          :loading="loading"
          :allow-clear="allowClear && modelValue !== ''"
          :disabled="isDisabled || disabledActions"
          :readonly="isReadonly || unclickable === true"
          :text-secure="textSecure"
          :is-secure-visible="isSecureVisible"
          :allow-paste="allowPaste"
          :allow-copy="allowCopy"
          :focused="focused"
          @click:clear="clearValue"
          @click:slot="focused ? blur() : focus(); $emit('click:suffix', $event)"
          @show:secure="isSecureVisible = true; $emit('click', $event)"
          @hide:secure="isSecureVisible = false"
          @click:paste="paste"
        >
          <template
            v-if="$slots.suffix"
            #default
          >
            <slot name="suffix" />
          </template>
        </InputActions>

        <slot name="inner" />
      </div>
    </template>

    <template 
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>
  </WFieldWrapper>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import type {InputProps} from './types'

import {computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import {useTabActiveListener} from '@/components/Tabs/use/useTabActiveListener'
import {Notify} from '@/utils/Notify'
import {useComponentStates} from '@/utils/useComponentStates'

import InputActions from './components/InputActions.vue'

type ModelValue = Required<InputProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputProps<Type>>(),
  {
    size: 10,
    autocomplete: 'off',
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: ModelValue | undefined): void
  (e: 'keypress:enter', value: KeyboardEvent): void
  (e: 'keypress:up', value: KeyboardEvent): void
  (e: 'keypress:down', value: KeyboardEvent): void
  (e: 'keypress:delete', value: KeyboardEvent): void
  (e: 'keypress:backspace', value: KeyboardEvent): void
  (e: 'click:clear'): void
  (e: 'focus', value: FocusEvent | undefined): void
  (e: 'blur', value: FocusEvent): void
  (e: 'click', value: MouseEvent): void
  (e: 'mousedown', value: MouseEvent): void
  (e: 'click:suffix', value: MouseEvent): void
  (e: 'select:input', value: Event): void
  (e: 'paste'): void
}>()

const {isReadonly, isDisabled} = useComponentStates(props)

const fieldWrapperRef = useTemplateRef('fieldWrapper')
const contentRef = useTemplateRef('content')
const inputRef = useTemplateRef<HTMLInputElement>('input')
const isSecureVisible = ref(false)

const updateModelValue = (value: string | undefined): void => {
  if (props.loading || isDisabled.value || isReadonly.value || props.unclickable) return

  if (props.type === 'number') {
    emit('update:model-value', (typeof value === 'string' && value.length ? Number.parseFloat(value) : undefined) as ModelValue)
  } else {
    emit('update:model-value', value as ModelValue)
  }
}

const handleBackspace = (event: KeyboardEvent): void => {
  if (!props.customBackspaceHandle) return

  event.preventDefault()
  event.stopPropagation()

  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  const value = target?.value

  if (!value || target.selectionStart === null || target.selectionEnd === null) return

  let substring: string
  let selectionStart: number

  if (target.selectionStart === target.selectionEnd) {
    if (target.selectionStart === 0) return

    selectionStart = target.selectionStart - 1
    substring = value.substring(0, selectionStart) + value.substring(target.selectionEnd)
  } else {
    selectionStart = target.selectionStart
    substring = value.substring(0, selectionStart) + value.substring(target.selectionEnd)
  }
  
  target.value = substring
  updateModelValue(substring)

  nextTick().then(() => target.setSelectionRange(selectionStart, selectionStart))
}

const handleInputEvent = (event: Event): void => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  const value = target?.value

  if (props.maxLength && typeof value === 'string' && value.length > props.maxLength) {
    event.preventDefault()

    const substring = value.substring(0, props.maxLength)

    if (target) target.value = substring
    updateModelValue(substring)
    return
  }

  updateModelValue(value)
}

const clearValue = () => {
  if (isDisabled.value || isReadonly.value || props.unclickable) return

  if (typeof props.modelValue === 'string') updateModelValue('')
  else updateModelValue(undefined)

  inputRef.value?.focus()

  emit('click:clear')
}

const focus = (): void => {
  if (isDisabled.value || isReadonly.value) return

  if (props.unclickable) emit('focus', undefined)
  else inputRef.value?.focus()
}

const blur = (): void => {
  inputRef.value?.blur()
}

const checkPermission = async (): Promise<boolean> => {
  const result = await navigator.permissions.query({name: 'clipboard-read' as PermissionName})

  return result.state === 'granted' || result.state === 'prompt'
}

const paste = async () => {
  if (!(await checkPermission())) {
    Notify.error({
      title: 'Paste failed',
      caption: 'Reading from clipboard is not permitted',
    })

    return
  }

  navigator.clipboard
    .readText()
    .then(value => {
      if (!value) {
        Notify.warn({
          title: 'Nothing to paste',
        })

        return
      }

      if (!props.maxLength || props.maxLength <= value.length) {
        updateModelValue(value)

        Notify.success({
          title: 'Pasted',
        })

        nextTick().then(() => emit('paste'))
      } else {
        Notify.error({
          title: 'Unable to paste',
          caption: 'The length of the pasted value exceeds the allowed limit',
        })
      }
    })
    .catch(() => {
      Notify.error({
        title: 'Paste failed',
      })
    })
}

const scrollToInput = () => {
  if (!contentRef.value || !inputRef.value) return

  contentRef.value.scrollTo({left: contentRef.value.scrollWidth - inputRef.value.offsetWidth - 40})
}

let timeout: NodeJS.Timeout | undefined

const autofocusDebounced = () => {
  if (timeout) clearTimeout(timeout)

  timeout = setTimeout(() => {
    if (props.autofocus) focus()

    timeout = undefined
  }, 250)
}

if (props.autofocus) {
  useTabActiveListener(autofocusDebounced)
}

watch(() => props.autofocus, value => {
  if (!value) return

  nextTick(focus)
})

onMounted(() => {
  if (props.autofocus) autofocusDebounced()
})

onBeforeUnmount(() => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = undefined
  }
})

defineExpose({
  focus,
  blur,
  fieldRef: computed(() => fieldWrapperRef.value?.fieldRef),
  scrollToInput,
})
</script>
