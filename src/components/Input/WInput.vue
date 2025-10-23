<template>
  <WFieldWrapper
    ref="fieldWrapper"
    v-bind="props"
    :class="[$attrs.class, {
      'group/seamless': seamless,
    }]"
    @click="seamless && focus()"
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
        class="flex max-w-full gap-1"
        :class="{
          'flex-wrap': !seamless,
          'overflow-hidden': seamless,
          'w-full': textarea,
        }"
      >
        <slot name="prefix" />
        <div
          v-if="!hideInput"
          :class="{
            'font-mono': mono,
            'text-secure': textSecure && !isSecureVisible && modelValue,
            'h-[--w-textarea-height,10rem] min-h-[--w-textarea-height,10rem] w-full overflow-auto overscroll-contain whitespace-pre': textarea,
            'resize-y': resize && textarea,
            'resize-none': !resize && textarea,
            'border-b border-solid border-gray-300 dark:border-gray-700': textarea,
          }"
          class="overflow-x-auto overscroll-x-contain"
        ><slot
          name="before"
          v-bind="{modelValue}"
        />{{ modelValue || emptyValue }}</div>
      </div>
    </template>

    <template
      v-else
      #field="{id, setFocused, focused}"
    >
      <div
        class="
          relative isolate grid min-h-[--w-input-min-height,var(--w-input-height,2.75rem)]
          grid-cols-[auto,1fr,auto] overflow-hidden rounded-[--w-input-rounded,0.75rem] border border-solid
        "
        :class="{
          'focus-within:border-primary dark:focus-within:border-primary-dark focus-within:outline-primary/20 dark:focus-within:outline-primary-dark/20 focus-within:outline focus-within:outline-2': !isDisabled && !isReadonly && !unclickable,
          'cursor-text': !isDisabled,
          'border-negative dark:border-negative-dark': errorMessage,
          'border-gray-300 dark:border-gray-700': !isDisabled,
          'border-gray-300/50 dark:border-gray-700/50': isDisabled,
          'border-opacity-0 group-hover/seamless:border-opacity-100 dark:border-opacity-0 dark:group-hover/seamless:border-opacity-100': seamless && !focused,
          'bg-[--w-input-bg,inherit]': !seamless || focused,
        }"
        @click="focus"
      >
        <InputToolbar
          v-if="!isDisabled && !isReadonly && textarea && (rich || toolbarActions || $slots.toolbar)"
          :list="toolbarActions"
          :rich="rich === true"
          :is-undo="historyPosition > 0"
          :is-redo="historyPosition < history.length - 1"
          :text-secure="textSecure ?? false"
          @wrap-selection="wrapSelection"
          @undo="undo"
          @redo="redo"
        >
          <slot
            name="toolbar"
            v-bind="{wrapSelection}"
          />
        </InputToolbar>

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
            'no-scrollbar overflow-x-auto overscroll-x-contain': noWrap && !(seamless && !focused),
            'overflow-hidden': seamless && !focused,
          }"
        >
          <div
            class="w-skeleton-w-32 flex gap-[--w-input-gap,0.25rem]"
            :class="{
              '[&:not(:has(.w-option-has-bg))]:-px--w-option-padding': !icon && !textarea,
              'flex-wrap': !noWrap && !seamless,
              'w-full min-w-max': !textarea && noWrap,
            }"
          >
            <slot
              name="prefix"
              v-bind="{modelValue}"
            />

            <div
              class="flex-1 font-normal"
              :class="{
                'w-full': !hideInput && !$slots.prefix,
                'w-option-has-bg-input': $slots.prefix,
                'resize-y': resize && textarea,
                'resize-none': !resize && textarea,
                'h-[calc(var(--w-input-height,2.75rem)-2px)]': !textarea && !$slots.suffix,
                'w-option min-w-40': !textarea && $slots.prefix && !hideInput,
                'font-mono': mono,
                'text-black-default dark:text-gray-200': !isDisabled,
                'text-black-default/50 dark:text-gray-200/50': isDisabled,
                '-p--w-option-padding h-[--w-textarea-height,10rem] min-h-[--w-textarea-height,10rem] w-full overflow-auto overscroll-contain': textarea,
                'absolute': hideInput,
              }"
            >
              <div class="relative flex min-h-full flex-1">
                <slot
                  name="before"
                  v-bind="{modelValue}"
                />

                <component
                  :is="textarea ? ContentEditable : 'input'"
                  :id="id"
                  ref="input"
                  class="
                    w-input sm-not:text-base min-h-full flex-1 basis-auto appearance-none border-none bg-[inherit]
                    outline-0 placeholder:text-gray-400 disabled:cursor-not-allowed dark:placeholder:text-gray-500
                  "
                  :class="{
                    'w-0 max-w-0': hideInput,
                    'text-secure': textSecure && !isSecureVisible,
                    '[-webkit-text-fill-color:transparent]': textTransparent,
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
                  :max-length="maxLength"
                  :text-parts="textParts"
                  @input="handleInputEvent"
                  @keypress.enter.exact="!isDisabled && !isReadonly && $emit('keypress:enter', $event)"
                  @keydown.up.exact.stop="!isDisabled && !isReadonly && $emit('keypress:up', $event)"
                  @keydown.down.exact.stop="!isDisabled && !isReadonly && $emit('keypress:down', $event)"
                  @keydown.delete.exact.stop="!isDisabled && !isReadonly && $emit('keypress:delete', $event); handleBackspace($event)"
                  @keydown="handleHistoryKeydown"
                  @focus="
                    $emit('focus', $event);
                    setFocused(true);
                    seamless && nextTick(scrollToInput);
                  "
                  @blur="
                    $emit('blur', $event);
                    setFocused(false);
                    isSecureVisible = false;
                    contentRef?.scrollTo({left: 0});
                  "
                  @click="$emit('click', $event)"
                  @mousedown.stop="$emit('mousedown', $event)"
                  @select.stop="$emit('select:input', $event)"
                  @update:model-value="updateModelValue"
                  @paste.prevent="onPaste"
                />

                <slot name="after" />
              </div>
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
          @show:secure="isSecureVisible = true; $emit('click', $event)"
          @hide:secure="isSecureVisible = false"
          @click:paste="paste"
        >
          <template
            v-if="$slots.suffix"
            #default="scope"
          >
            <slot
              name="suffix"
              v-bind="scope"
            />
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

    <template
      v-if="$slots.bottom"
      #bottom
    >
      <slot name="bottom" />
    </template>
  </WFieldWrapper>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import type {InputProps, WrapSelection} from './types'

import {computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import {useTabActiveListener} from '@/components/Tabs/use/useTabActiveListener'
import {Notify} from '@/utils/Notify'
import {useComponentStates} from '@/utils/useComponentStates'
import {checkPermissionPaste} from '@/utils/useCopy'
import {debounce} from '@/utils/utils'

import InputActions from './components/InputActions.vue'
import {type CaretOffset} from './models/utils'

const ContentEditable = defineAsyncComponent(() => import('./components/ContentEditable.vue'))
const InputToolbar = defineAsyncComponent(() => import('./components/InputToolbar.vue'))

type ModelValue = Required<InputProps<Type>>['modelValue']

interface HistoryEntry {
  value: ModelValue | undefined
  caret: CaretOffset
}

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputProps<Type>>(),
  {
    size: 10,
    autocomplete: 'off',
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
    unclickable: null,
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
  (e: 'select:input', value: Event): void
  (e: 'paste'): void
}>()

const {isReadonly, isDisabled} = useComponentStates(props)

const fieldWrapperRef = useTemplateRef('fieldWrapper')
const contentRef = useTemplateRef('content')
const inputRef = useTemplateRef<HTMLInputElement | ComponentInstance<typeof ContentEditable>>('input')
const isSecureVisible = ref(false)

const history = ref<HistoryEntry[]>([])
const historyPosition = ref(-1)

const getCaret = (): CaretOffset => {
  if (!inputRef.value) return {start: 0, end: 0}
  if ('getCaret' in inputRef.value) return inputRef.value.getCaret()
  return {start: inputRef.value.selectionStart ?? 0, end: inputRef.value.selectionEnd ?? 0}
}

const setCaret = (start: number, end?: number): void => {
  if (!inputRef.value) return
  if ('setCaret' in inputRef.value) inputRef.value.setCaret(start, end)
  else inputRef.value.setSelectionRange(start, end ?? start)
}

const addToHistory = (value: ModelValue | undefined, noDebounce: boolean) => {
  if (history.value.length === 0) {
    history.value.push({value: props.modelValue, caret: getCaret()} as typeof history.value[number])
    historyPosition.value = 0
  }

  if (noDebounce) nextTick(() => addToHistoryFn(value))
  else addToHistoryDebounced(value)
}

const addToHistoryFn = (value: ModelValue | undefined): void => {
  const entry: HistoryEntry = {value, caret: getCaret()}

  if (historyPosition.value < history.value.length - 1) history.value = history.value.slice(0, historyPosition.value + 1)

  history.value.push(entry as typeof history.value[number])
  historyPosition.value = history.value.length - 1
  if (history.value.length > 50) {
    history.value.shift()
    historyPosition.value--
  }
}

const addToHistoryDebounced = debounce(addToHistoryFn, 500)

const undo = (): void => {
  if (props.loading || isDisabled.value || isReadonly.value || props.unclickable || props.textSecure) return
  if (historyPosition.value <= 0) {
    fieldWrapperRef.value?.showMessage('No Undo')
    historyPosition.value = history.value.length ? 0 : -1
    return
  }

  fieldWrapperRef.value?.showMessage('Undo')
  const index = historyPosition.value - 1
  const item = history.value[index]
  emit('update:model-value', item.value as ModelValue)
  nextTick(() => setCaret(item.caret.start, item.caret.end))
  historyPosition.value = index
}

const redo = (): void => {
  if (props.loading || isDisabled.value || isReadonly.value || props.unclickable || props.textSecure) return
  if (historyPosition.value >= history.value.length - 1) {
    fieldWrapperRef.value?.showMessage('No Redo')
    historyPosition.value = history.value.length -1
    return
  }

  fieldWrapperRef.value?.showMessage('Redo')
  const index = historyPosition.value + 1
  const item = history.value[index]
  emit('update:model-value', item.value as ModelValue)
  nextTick(() => setCaret(item.caret.start, item.caret.end))
  historyPosition.value = index
}

const handleHistoryKeydown = (event: KeyboardEvent): void => {
  if (!event.ctrlKey && !event.metaKey) return
  if (event.key !== 'z' && event.key !== 'Z') return
  event.preventDefault()
  event.stopPropagation()
  if (event.shiftKey) redo()
  else undo()
}

const updateModelValue = (value: string | undefined, noDebounce = false): void => {
  if (props.loading || isDisabled.value || isReadonly.value || props.unclickable) return

  let newValue: ModelValue
  if (props.type === 'number') newValue = (typeof value === 'string' && value.length ? Number.parseFloat(value) : undefined) as ModelValue
  else newValue = value as ModelValue

  if (!props.textSecure) addToHistory(newValue, noDebounce)

  emit('update:model-value', newValue)
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

  if (typeof props.modelValue === 'string') updateModelValue('', true)
  else updateModelValue(undefined, true)

  inputRef.value?.focus()
  emit('click:clear')
}

const focus = (): void => {
  if (isDisabled.value || isReadonly.value) return

  if (props.unclickable) emit('focus', undefined)
  else inputRef.value?.focus()
}

const blur = (): void => inputRef.value?.blur()

const onPaste = async (e: ClipboardEvent) => {
  if (props.loading || isDisabled.value || isReadonly.value || props.unclickable) return

  let text = e.clipboardData?.getData('text/plain')

  if (!text) {
    try {
      text = await navigator.clipboard.readText()
    } catch {
      Notify.error({title: 'Clipboard API not available'})
      return
    }
  }

  text = text.replace(/\r\n?/g, '\n')

  if (!text) {
    fieldWrapperRef.value?.showMessage('Nothing to paste')
    return
  }
 
  const caret = getCaret()
  const value = props.modelValue?.toString() ?? ''
  const newValue = value.slice(0, caret.start) + text + value.slice(caret.end)

  updateModelValue(newValue, true)

  await nextTick()
  setCaret(Math.min(caret.start + text.length, props.modelValue?.toString().length ?? 0))
}

const paste = async () => {
  if (props.loading || isDisabled.value || isReadonly.value || props.unclickable) return

  try {
    await checkPermissionPaste()
    await navigator.clipboard
      .readText()
      .then(value => {
        if (!value) {
          Notify.warn({title: 'Nothing to paste'})
        } else if (!props.maxLength || props.maxLength <= value.length) {
          updateModelValue(value, true)
          Notify.success({title: 'Pasted'})
          nextTick().then(() => emit('paste'))
        } else Notify.error({
          title: 'Unable to paste',
          caption: 'The length of the pasted value exceeds the allowed limit',
        })
      })
  } catch {
    Notify.error({
      title: 'Paste failed',
      caption: `Please allow the clipboard actions in browser settings for current domain: ${ location.host }`,
    })
  }
}

const scrollToInput = () => {
  if (!contentRef.value || !inputRef.value) return

  if (inputRef.value instanceof HTMLElement) inputRef.value.scrollIntoView({behavior: 'instant', block: 'center'})
  else contentRef.value.scrollTo({left: contentRef.value.scrollWidth - 40})
}

const wrapSelection = (value: WrapSelection) => inputRef.value && 'wrapSelection' in inputRef.value ? inputRef.value.wrapSelection(value) : void 0

let timeout: NodeJS.Timeout | undefined

const autofocusDebounced = () => {
  if (timeout) clearTimeout(timeout)

  if (props.autofocus === 0) {
    focus()
    return
  }

  timeout = setTimeout(() => {
    if (props.autofocus !== false && props.autofocus !== undefined) focus()

    timeout = undefined
  }, typeof props.autofocus === 'number' ? props.autofocus : 250)
}

if (props.autofocus !== false && props.autofocus !== undefined) useTabActiveListener(autofocusDebounced)

watch(() => props.autofocus, value => {
  if (value === false || value === undefined) return

  nextTick(autofocusDebounced)
})

onMounted(() => {
  if (props.autofocus !== false && props.autofocus !== undefined) autofocusDebounced()
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
  wrapSelection,
  setCaret,
  getCaret,
  fieldRef: computed(() => fieldWrapperRef.value?.fieldRef),
  scrollToInput,
  undo,
  redo,
})
</script>
