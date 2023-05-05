<template>
  <div
    class="relative mt-1 mb-[var(--input-b-margin,1.125rem)]"
    @click="$emit('click:internal', $event)"
  >
    <div
      v-if="title || $slots.title?.()?.length"
      class="text-xs font-semibold text-accent mb-2 duration-500"
    >
      <template v-if="!skeleton">
        <slot name="title">
          {{ title }}
        </slot>

        <Transition
          enter-active-class="fade-enter-active"
          leave-active-class="fade-leave-active"
          enter-from-class="fade-enter-from"
          leave-to-class="fade-leave-to"
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

    <div class="flex gap-4">
      <div
        v-if="!skeleton"
        class="relative w-[calc(100%-(3.75rem*var(--input-right-count)))] isolate"
        :style="{'--input-right-count': $slots.right?.().filter(item => item['type'] === 'button').length ?? 0}"
      >
        <div
          class="
            relative flex flex-wrap bg-default dark:bg-default-dark border border-solid border-gray-300 dark:border-gray-700 rounded-xl
            transition-colors duration-75 overflow-hidden min-h-[44px] w-full
          "
          :class="{
            'focus-within:border-primary-default dark:focus-within:border-primary-dark': !disabled && !readonly,
            'cursor-text': !disabled,
            'opacity-80 cursor-not-allowed': disabled,
            'pl-1 py-1 gap-1': $slots.suffix?.()?.length,
            'border-negative dark:border-negative-dark': errorMessage,
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
            text-base text-accent font-normal outline-0 border-none bg-default dark:bg-default-dark select-all flex-1 max-w-full
            disabled:opacity-80 disabled:cursor-not-allowed placeholder:text-gray-400 dark:placeholder:text-gray-500 appearance-none
          "
            :class="{
              'py-0 pr-1 pl-3': !textarea && !hideInput,
              'h-[34px]': $slots.suffix?.()?.length,
              'h-[42px]': !$slots.suffix?.()?.length,
              'h-[var(--textarea-height,160px)] w-full resize-none p-3': textarea,
              'pl-11': icon,
              'w-0 max-w-0 p-0 absolute': hideInput,
              'font-mono': mono,
              'text-secure': textSecure && !isSecureVisible,
            }"
            :value="placeholderSecure && modelValue === undefined && !isFocused ? '******' : modelValue"
            :placeholder="placeholder"
            :type="type"
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
            @click.stop.prevent="$emit('click', $event)"
            @mousedown="!allowMousedown && $event.stopPropagation(); $emit('mousedown', $event)"
            @select.stop.prevent="$emit('select:input', $event)"
          />

          <InputActions
            :loading="loading"
            :allow-clear="allowClear && modelValue !== ''"
            :disabled="disabled || readonly"
            :text-secure="textSecure"
            :is-secure-visible="isSecureVisible"
            class="absolute top-0 right-0 bottom-0"
            @click:clear="clearValue"
            @click:slot="isFocused ? blur() : focus(); $emit('click:internal', $event)"
            @show:secure="isSecureVisible = true; $emit('click', $event)"
            @hide:secure="isSecureVisible = false"
            @update:width="paddingRight = $event"
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
          enter-active-class="fade-enter-active"
          leave-active-class="fade-leave-active"
          enter-from-class="fade-enter-from"
          leave-to-class="fade-leave-to"
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
          enter-active-class="fade-enter-active"
          leave-active-class="fade-leave-active"
          enter-from-class="fade-enter-from"
          leave-to-class="fade-leave-to"
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
            {{ String(modelValue || '').length }} / {{ maxLength }}
          </div>
        </Transition>
      </div>

      <WSkeleton
        v-else
        class="w-full h-11 rounded-xl"
        :class="{'h-[var(--textarea-height, 160px)]': textarea}"
        style="--skeleton-width: 100%;"
      />

      <slot name="right" />
    </div>

    <div
      v-if="description"
      class="text-xs font-normal text-description pt-4 pb-2 whitespace-pre-wrap break-words"
    >
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, nextTick} from 'vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import InputActions from './components/InputActions.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    title?: string
    description?: string
    placeholder?: string
    type?: string
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
    allowMousedown?: boolean
  }>(),
  {
    size: 40,
    title: undefined,
    description: undefined,
    placeholder: undefined,
    type: 'text',
    name: undefined,
    autocomplete: 'off',
    errorMessage: undefined,
    icon: undefined,
    maxLength: undefined,
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | undefined): void
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
const isFocused = ref(false)
const isSecureVisible = ref(false)
const paddingRight = ref(0)

const updateModelValue = (value: string | number | undefined): void => {
  if (props.loading || props.disabled || props.readonly) return

  if (props.type === 'number') {
    if (typeof value === 'string' && value.length) emit('update:modelValue', Number.parseFloat(value))
    else emit('update:modelValue', undefined)

    return
  }

  emit('update:modelValue', value)
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

  updateModelValue('')

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

const setIsFocused = (value: boolean): void => {
  isFocused.value = value
}

onMounted(() => {
  if (props.autofocus) focus()
})

defineExpose({
  focus,
  blur,
})

</script>
