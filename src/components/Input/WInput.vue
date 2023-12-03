<template>
  <div
    class="relative"
    :class="{
      'cursor-not-allowed': disabled && !skeleton,
      'mt-1 mb-[1.125rem]': !noMargin,
    }"
    @click="$emit('click:internal', $event)"
  >
    <div
      v-if="title || $slots.title?.()?.length"
      class="text-xs font-semibold text-accent mb-2 duration-500"
      :class="{
        'opacity-50': disabled && !skeleton,
      }"
    >
      <template v-if="!skeleton">
        <slot name="title">
          {{ title }}
        </slot>

        <Transition
          enter-active-class="transition-opacity"
          leave-active-class="transition-opacity"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <span
            v-if="required"
            class="text-negative dark:text-negative-dark"
          >
            *
          </span>
        </Transition>
      </template>

      <WSkeleton
        v-else
        class="h-4 w-16"
      />
    </div>

    <div class="flex">
      <div
        v-if="!skeleton"
        class="relative isolate w-[calc(100%-var(--input-right-width))] flex-1"
        :style="{'--input-right-width': (rightContainer?.offsetWidth ?? 0) + 'px'}"
      >
        <div
          class="
            relative flex flex-wrap border border-solid rounded-xl bg-default dark:bg-default-dark
            transition-colors duration-75 overflow-hidden min-h-[44px] w-full
          "
          :class="{
            'focus-within:border-primary-default dark:focus-within:border-primary-dark': !disabled && !readonly,
            'cursor-text': !disabled,
            'pl-1 py-1 gap-1': $slots.suffix?.()?.length,
            'border-negative dark:border-negative-dark': errorMessage,
            'border-gray-300 dark:border-gray-700': !disabled,
            'border-gray-300/50 dark:border-gray-700/50': disabled,
          }"
          :style="{paddingRight: paddingRight + 'px'}"
          @click="focus"
          @mousedown.prevent=""
        >
          <div
            v-if="icon"
            class="absolute top-0 left-0 h-full flex items-center justify-center px-3 text-description select-none"
          >
            <component
              :is="icon"
              class="w-5 h-5"
            />
          </div>

          <slot name="prefix" />

          <component
            :is="textarea ? 'textarea' : 'input'"
            ref="input"
            class="
              text-base font-normal outline-0 border-none bg-[inherit] flex-1 max-w-full
              disabled:opacity-80 disabled:cursor-not-allowed placeholder:text-gray-400 dark:placeholder:text-gray-500 appearance-none
            "
            :class="{
              'min-h-[var(--textarea-height,160px)] w-full p-3': textarea,
              'resize-y': resize && textarea,
              'resize-none': !resize && textarea,
              'h-[var(--input-height,42px)]': !textarea && !$slots.suffix?.()?.length,
              'h-[var(--input-height,34px)]': !textarea && $slots.suffix?.()?.length,
              'py-0 pr-1': !hideInput && !textarea,
              'pl-11': !hideInput && !textarea && icon,
              'pl-3': !hideInput && !textarea && !icon,
              'w-0 max-w-0 p-0 absolute': hideInput,
              'font-mono': mono,
              'text-secure': textSecure && !isSecureVisible,
              'text-black-default dark:text-gray-200': !disabled,
              'text-black-default/50 dark:text-gray-200/50': disabled,
            }"
            :value="placeholderSecure && modelValue === undefined && !isFocused ? '******' : modelValue"
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
            @focus="$emit('focus', $event); setIsFocused(true)"
            @blur="$emit('blur', $event); setIsFocused(false); isSecureVisible = false"
            @click="$emit('click', $event)"
            @mousedown.stop="$emit('mousedown', $event)"
            @select="$emit('select:input', $event)"
          />

          <InputActions
            :loading="loading"
            :allow-clear="allowClear && modelValue !== ''"
            :disabled="disabled || readonly || disabledActions"
            :text-secure="textSecure"
            :is-secure-visible="isSecureVisible"
            :allow-paste="allowPaste"
            class="absolute top-0 right-0 bottom-0"
            @click:clear="clearValue"
            @click:slot="isFocused ? blur() : focus(); $emit('click:internal', $event)"
            @show:secure="isSecureVisible = true; $emit('click', $event)"
            @hide:secure="isSecureVisible = false"
            @update:width="paddingRight = $event"
            @click:paste="paste"
          >
            <template
              v-if="$slots.suffix?.()?.length"
              #default
            >
              <slot name="suffix" />
            </template>
          </InputActions>
        </div>

        <Transition
          enter-active-class="transition-opacity"
          leave-active-class="transition-opacity"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <span
            v-if="hasChanges"
            class="square-2 rounded-full transition-colors absolute top-0 right-0 z-10"
            :class="{
              'bg-info dark:bg-info-dark': isFocused || errorMessage === undefined,
              'bg-negative dark:bg-negative-dark': !isFocused && errorMessage !== undefined,
            }"
          />
        </Transition>

        <Transition
          enter-active-class="transition-opacity"
          leave-active-class="transition-opacity"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="errorMessage"
            class="text-xs font-normal text-negative dark:text-negative-dark absolute right-0 pt-0.5 text-end"
          >
            {{ errorMessage }}
          </div>

          <div
            v-else-if="maxLength !== undefined && isFocused"
            class="text-xs font-normal text-description absolute right-0 pt-0.5 whitespace-nowrap"
          >
            {{ numberFormatter.format(String(modelValue || '').length) }} / {{ numberFormatter.format(maxLength) }}
          </div>
        </Transition>
      </div>

      <WSkeleton
        v-else
        class="w-full w-skeleton-rounded-xl"
        :class="{
          'h-[calc(var(--textarea-height,160px)+2px)]': textarea,
          'h-[calc(var(--input-height,42px)+2px)]': !textarea && !$slots.suffix?.()?.length,
          'h-[calc(var(--input-height,34px)+10px)]': !textarea && $slots.suffix?.()?.length,
        }"
        style="--skeleton-width: 100%;"
      />

      <div
        v-if="$slots.right?.()?.length"
        ref="rightContainer"
        class="pl-4 flex gap-4"
      >
        <slot name="right" />
      </div>
    </div>

    <div
      v-if="description"
      class="text-xs font-normal text-description pt-4 whitespace-pre-wrap break-words"
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
import {onMounted, ref, nextTick} from 'vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import InputActions from './components/InputActions.vue'
import {Notify} from '@/utils/Notify'
import {debounce, numberFormatter} from '@/utils/utils'
import {useTabActiveListener} from '../Tabs/use/useTabActiveListener'

type ModelValue = Type extends 'number' ? number : string

const props = withDefaults(
  defineProps<{
    modelValue?: ModelValue | undefined
    title?: string
    description?: string
    placeholder?: string
    type?: Type
    name?: string
    autocomplete?: string
    autofocus?: boolean
    textarea?: boolean
    disabled?: boolean
    allowClear?: boolean
    errorMessage?: string
    readonly?: boolean
    icon?: SVGComponent
    maxLength?: number
    loading?: boolean
    required?: boolean
    hideInput?: boolean
    skeleton?: boolean
    size?: number
    mono?: boolean
    textSecure?: boolean
    spellcheck?: boolean
    placeholderSecure?: boolean
    customBackspaceHandle?: boolean
    hasChanges?: boolean
    disabledActions?: boolean
    noMargin?: boolean
    resize?: boolean
    allowPaste?: boolean
  }>(),
  {
    size: 40,
    title: undefined,
    description: undefined,
    placeholder: undefined,
    type: undefined,
    name: undefined,
    autocomplete: 'off',
    errorMessage: undefined,
    icon: undefined,
    maxLength: undefined,
    modelValue: undefined,
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
  (e: 'click:internal', value: MouseEvent): void
  (e: 'select:input', value: Event): void
}>()

const input = ref<HTMLInputElement>()
const rightContainer = ref<HTMLInputElement>()
const isFocused = ref(false)
const isSecureVisible = ref(false)
const paddingRight = ref(0)

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

  updateModelValue(undefined)

  input.value?.focus()

  emit('click:clear')
}

const focus = (): void => {
  if (props.disabled || props.readonly) return

  if (isFocused.value) return

  input.value?.focus()
}

const blur = (): void => {
  input.value?.blur()
}

const setIsFocused = (value: boolean): void => {
  isFocused.value = value
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

      Notify.success({
        title: 'Pasted',
      })

      if (!props.maxLength || props.maxLength <= value.length) updateModelValue(value)
      else {
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

const autofocusDebounced = debounce(() => {
  if (props.autofocus) focus()
}, 500)

if (props.autofocus) {
  useTabActiveListener(autofocusDebounced)
}

onMounted(() => {
  if (props.autofocus) autofocusDebounced()
})

defineExpose({
  focus,
  blur,
})

</script>
