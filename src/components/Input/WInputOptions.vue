<template>
  <WInputSuggest
    ref="input"
    v-bind="{...props, modelValue: search, clearValue: getClearValue()}"
    :class="$attrs.class"
    @update:model-value="updateSearch"
    @click:clear="draft && updateModelValue(getClearValue() as ModelValue)"

    @keypress:enter.stop.prevent="selectCursor"
    @keypress:up.prevent="cursorUp"
    @keypress:down.prevent="cursorDown"

    @open="isOpen = true"
    @close="close"
    @focus="focused = true"
    @blur="focused = false"
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

    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <SelectAsyncList
        v-if="useQueryFnOptions"
        ref="list"
        :model-value="modelValue === undefined || modelValue === null ? [] : [modelValue]"
        :use-query-fn="useQueryFnOptions"
        :query-params="queryParams"
        :loading="loading"
        :disabled="isDisabledComputed"
        :empty-stub="emptyStub ?? 'No suggestion'"
        :value-getter="valueGetter"
        :query-options="{placeholderData: keepPreviousData}"
        :search="draft ? search?.toString() : undefined"
        :allow-create="draft"
        :create-prefix="applyPrefix ?? 'Apply:'"
        :cursor-on-create="draft"
        apply-always
        @select="(_value, option) => select(option)"
        @unselect="(_value, option) => select(option)"
        @create:option="apply"
      >
        <template #default="{option, selected, skeleton: skeletonOption, index}">
          <span
            v-if="!option && !skeletonOption"
            class="w-option w-option-padding-y flex items-center truncate font-semibold"
          >{{ search }}</span>

          <slot
            v-else
            name="option"
            :option="option"
            :selected="selected"
            :skeleton="skeletonOption"
            :model="false"
            :index="index"
            :search="undefined"
          >
            <component
              v-bind="(optionComponentProps as SelectOptionComponentProps<Option, OptionComponent>)"
              :is="optionComponent"
              :option="option"
              :selected="selected"
              :skeleton="skeletonOption"
              :model="false"
            />
          </slot>
        </template>
      </SelectAsyncList>

      <template v-else>
        <SelectOption
          v-if="draft"
          :index="applyIndex"
          :is-selected="false"
          :is-cursor="cursor === applyIndex"
          :scroll="isCursorLocked"
          :disabled="!search"
          class="first:pt-4 last:pb-4"
          @select="apply"
          @mouseenter="setCursor(applyIndex)"
        >
          <template #prefix>
            <span class="w-option w-option-padding-y flex items-center self-start pr-2">
              {{ applyPrefix ?? 'Apply:' }}
            </span>
          </template>

          <span
            v-if="search"
            class="w-option w-option-padding-y flex items-center truncate font-semibold"
          >{{ search }}</span>

          <span
            v-else
            class="text-description w-option w-option-padding-y flex items-center"
          >Start typing..</span>
        </SelectOption>

        <div
          v-if="!options?.length"
          class="px-4.25 py-2 first:pt-4 last:pb-4"
        >
          <div
            class="w-select-field sm-not:px-3 cursor-default select-none"
          >
            {{ emptyStub ?? 'No suggestion' }}
          </div>
        </div>

        <SelectOption
          v-for="(option, index) in options"
          :key="option.id"
          :index="index"
          :is-selected="modelValue === valueGetter(option)"
          :is-cursor="index === cursor"
          :loading="loadingOptionIndex === index && loading"
          :scroll="isCursorLocked"
          class="first:pt-4 last:pb-4"
          @select="select(option); setLoadingOptionIndex(index)"
          @mouseenter="setCursor(index)"
        >
          <template #default="{selected}">
            <slot
              name="option"
              :option="option"
              :selected="selected"
              :skeleton="false"
              :model="false"
              :index="index"
              :search="undefined"
            >
              <component
                v-bind="(optionComponentProps as SelectOptionComponentProps<Option, OptionComponent>)"
                :is="optionComponent"
                :option="option"
                :selected="selected"
                :model="false"
              />
            </slot>
          </template>
        </SelectOption>
      </template>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text', Option extends Record<string, any> & {id: number} = Record<string, any> & {id: number}, QueryParams = unknown, OptionComponent extends SelectOptionComponent<Option> = SelectOptionComponent<Option>, ClearValue extends InputClearValue = ''">
import type {InputClearValue, InputOptionsProps} from './types'
import type {SelectOptionComponent, SelectOptionComponentProps, SelectOptionProps} from '@/components/Select/types'

import {keepPreviousData} from '@tanstack/vue-query'
import {computed, ref, useTemplateRef, watch} from 'vue'

import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import SelectAsyncList from '@/components/Select/components/SelectAsyncList.vue'
import SelectOption from '@/components/Select/components/SelectOption.vue'
import {useClearValue} from '@/utils/useClearValue'
import {useComponentStates} from '@/utils/useComponentStates'
import {debounce as debounceImport} from '@/utils/utils'

type ModelValue = Required<InputOptionsProps<Type, Option, QueryParams, OptionComponent>>['modelValue']

const props = withDefaults(
  defineProps<InputOptionsProps<Type, Option, QueryParams, OptionComponent, ClearValue>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const getClearValue = useClearValue(props, '')

const emit = defineEmits<{
  /** The typed value, or the value of a picked option. */
  (e: 'update:model-value', value: ModelValue): void
}>()

defineSlots<{
  /** Replaces the `title` text. */
  title?: () => void
  /** Content between the title and the field. */
  subtitle?: () => void
  /** Content to the right of the field. */
  right?: () => void
  /** Content of an option in the menu. Replaces `optionComponent`. `option` is `undefined` on a loading skeleton row. */
  option?: (props: PartialNot<SelectOptionProps<Option>>) => void
}>()

const {isReadonly, isDisabled} = useComponentStates(props)

const isOpen = ref(false)
const inputRef = useTemplateRef('input')
const listRef = useTemplateRef('list')
const cursor = ref<number>(-1)
const isCursorLocked = ref(false)
const search = ref<ModelValue>(props.modelValue ?? null)
const applyIndex = computed(() => props.options?.length ?? 0)
const lastIndex = computed(() => props.draft ? applyIndex.value : applyIndex.value - 1)
const queryParams = computed(() => ({...props.queryParamsOptions, [props.searchField ?? 'search']: search.value ?? ''}) as QueryParams)

watch(() => props.modelValue, value => {
  search.value = value ?? null
})
const focused = ref(false)
const loadingOptionIndex = ref<number | null>(null)

const isDisabledComputed = computed(() => props.loading || isReadonly.value || isDisabled.value)

const close = () => {
  isOpen.value = false
  focused.value = false

  if (props.draft) search.value = props.modelValue ?? null
}

const setLoadingOptionIndex = (value: number) => {
  if (isDisabledComputed.value) return

  loadingOptionIndex.value = value
}

const unlockCursor = debounceImport(() => {
  isCursorLocked.value = false
}, 50)

const lockCursor = () => {
  isCursorLocked.value = true

  unlockCursor()
}

const setCursor = (value: number): void => {
  if (isCursorLocked.value) return

  cursor.value = value
}

const cursorUp = () => {
  if (isDisabledComputed.value) return
  if (listRef.value) return listRef.value.cursorUp()

  lockCursor()

  cursor.value = lastIndex.value < 0
    ? -1
    : cursor.value < 1
      ? lastIndex.value
      : cursor.value - 1
}

const cursorDown = () => {
  if (isDisabledComputed.value) return
  if (listRef.value) return listRef.value.cursorDown()

  lockCursor()

  cursor.value = lastIndex.value < 0
    ? -1
    : cursor.value >= lastIndex.value
      ? 0
      : cursor.value + 1
}

const selectCursor = () => {
  if (isDisabledComputed.value) return

  if (listRef.value) return listRef.value.selectCursor()

  if (props.draft && (cursor.value === -1 || cursor.value === applyIndex.value)) return apply()

  const value = cursor.value !== -1 ? props.options?.[cursor.value] : undefined

  if (value) select(value)
}

const apply = (): void => {
  if (isDisabledComputed.value) return

  updateModelValue(search.value)

  blur()
}

const updateSearch = (value: ModelValue): void => {
  search.value = value ?? null
  cursor.value = props.draft ? applyIndex.value : -1

  if (!props.draft) updateModelValue(value)
}

const select = (option: Option): void => {
  updateModelValue(props.valueGetter(option))

  blur()
}

const updateModelValue = (value: ModelValue): void => {
  if (isDisabled.value || props.modelValue === value) return

  emit('update:model-value', value)
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

defineExpose({
  focus,
  blur,
})
</script>
