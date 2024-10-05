<template>
  <WFieldWrapper
    v-bind="props"
    :class="$attrs.class"
    @click="$emit('click:suffix', $event)"
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

    <template #field="{id, setFocused, focused}">
      <div
        class="
          relative border border-solid rounded-xl bg-default dark:bg-default-dark
          transition-colors duration-75 overflow-hidden min-h-11 grid grid-cols-[auto,1fr,auto]
        "
        :class="{
          'focus-within:border-primary-default dark:focus-within:border-primary-dark': !disabled && !readonly,
          'cursor-text': !disabled,
          'border-negative dark:border-negative-dark': errorMessage,
          'border-gray-300 dark:border-gray-700': !disabled,
          'border-gray-300/50 dark:border-gray-700/50': disabled,
        }"
        @click="focus"
        @mousedown.prevent=""
      >
        <div
          v-if="icon"
          class="flex items-center w-11 h-full justify-center text-description select-none"
        >
          <component
            :is="icon"
            class="square-5"
          />
        </div>

        <div
          class="col-start-2 grid grid-cols-1 group/input"
          :class="{
            'py-1 first:pl-1 last:pr-1': $slots.prefix,
          }"
        >
          <div class="flex flex-wrap gap-1">
            <slot name="prefix" />

            <component
              :is="textarea ? 'textarea' : 'input'"
              :id="id"
              ref="input"
              class="
                text-base font-normal outline-0 border-none bg-[inherit] flex-1 max-w-full w-input
                disabled:opacity-80 disabled:cursor-not-allowed placeholder:text-gray-400 dark:placeholder:text-gray-500 appearance-none
              "
              :class="{
                'min-h-[var(--textarea-height,10rem)] w-full py-3': textarea,
                'resize-y': resize && textarea,
                'resize-none': !resize && textarea,
                'h-[var(--input-height,2.625rem)]': !textarea && !$slots.suffix,
                'h-[var(--input-height,2.125rem)]': !textarea && $slots.suffix,
                'group-first/input:pl-3 first:pl-0 [&:not(:first-child)]:pl-3 group-last/input:pr-3': !hideInput,
                'w-0 max-w-0 p-0 absolute': hideInput,
                'font-mono': mono,
                'text-secure': textSecure && !isSecureVisible,
                'text-black-default dark:text-gray-200': !disabled,
                'text-black-default/50 dark:text-gray-200/50': disabled,
              }"
              :value="placeholderSecure && modelValue === undefined && !focused ? '******' : modelValue"
              :placeholder="placeholder"
              :type="type ?? 'text'"
              :name="name"
              :disabled="disabled"
              :readonly="readonly"
              :autocomplete="autocomplete"
              :size="size || undefined"
              :spellcheck="spellcheck ? 'true' : 'false'"
              @input="handleInputEvent"
              @keypress.enter.exact="!disabled && !readonly && $emit('keypress:enter', $event)"
              @keydown.up.exact.stop="!disabled && !readonly && $emit('keypress:up', $event)"
              @keydown.down.exact.stop="!disabled && !readonly && $emit('keypress:down', $event)"
              @keydown.delete.exact.stop="!disabled && !readonly && $emit('keypress:delete', $event); handleBackspace($event)"
              @focus="$emit('focus', $event); setFocused(true)"
              @blur="$emit('blur', $event); setFocused(false); isSecureVisible = false"
              @click="$emit('click', $event)"
              @mousedown.stop="$emit('mousedown', $event)"
              @select.stop="$emit('select:input', $event)"
            />
          </div>
        </div>

        <InputActions
          :model-value="(modelValue as ModelValue)"
          :loading="loading"
          :allow-clear="allowClear && modelValue !== ''"
          :disabled="disabled || disabledActions"
          :readonly="readonly"
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
import {onMounted, ref, nextTick, onBeforeUnmount} from 'vue'
import InputActions from './components/InputActions.vue'
import {Notify} from '@/utils/Notify'
import {useTabActiveListener} from '@/components/Tabs/use/useTabActiveListener'
import type {InputProps} from './types'
import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

type ModelValue = Required<InputProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputProps<Type>>(),
  {
    size: 10,
    autocomplete: 'off',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue | undefined): void
  (e: 'keypress:enter', value: KeyboardEvent): void
  (e: 'keypress:up', value: KeyboardEvent): void
  (e: 'keypress:down', value: KeyboardEvent): void
  (e: 'keypress:delete', value: KeyboardEvent): void
  (e: 'keypress:backspace', value: KeyboardEvent): void
  (e: 'click:clear'): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
  (e: 'click', value: MouseEvent): void
  (e: 'mousedown', value: MouseEvent): void
  (e: 'click:suffix', value: MouseEvent): void
  (e: 'select:input', value: Event): void
  (e: 'paste'): void
}>()

const input = ref<HTMLInputElement>()
const isSecureVisible = ref(false)

const updateModelValue = (value: string | undefined): void => {
  if (props.loading || props.disabled || props.readonly) return

  if (props.type === 'number') {
    emit('update:modelValue', (typeof value === 'string' && value.length ? Number.parseFloat(value) : undefined) as ModelValue)
  } else {
    emit('update:modelValue', value as ModelValue)
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
  if (props.disabled || props.readonly) return

  if (typeof props.modelValue === 'string') updateModelValue('')
  else updateModelValue(undefined)

  input.value?.focus()

  emit('click:clear')
}

const focus = (): void => {
  if (props.disabled || props.readonly) return

  input.value?.focus()
}

const blur = (): void => {
  input.value?.blur()
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
})

</script>
