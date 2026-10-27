<template>
  <SelectDeferred
    v-if="isDeferred"
    :model-value="arrayValue"
    :get-option="getOption"
    :field="deferredField"
    :option-component="(optionComponent as SelectOptionComponent<Data>)"
    :option-component-props="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
    :placeholder="placeholder"
    :placeholder-empty="placeholderEmpty"
    :name="name"
    :size="size"
    :no-wrap="noWrap"
    :border-class="borderClass"
    :hide-input="hideInput"
    :loading="loading"
    :class="$attrs.class"
    @activate="activate"
  >
    <template
      v-if="$slots.option"
      #option="scope"
    >
      <slot
        name="option"
        v-bind="scope"
      />
    </template>

    <template
      v-if="$slots.prefix || !hasPreview"
      #chips="{readonly: readonlyChips, disabled: disabledChips}"
    >
      <slot
        v-if="$slots.prefix"
        name="prefix"
      />

      <SelectAsyncPrefix
        v-else
        :use-query-fn="useQueryFnPrefix ?? useQueryFnOptions"
        :model-value="arrayValue"
        :disabled="disabledChips"
        :loading="loading"
        :option-component="(optionComponent as SelectOptionComponent<Data>)"
        :option-component-props="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
        :disable-clear="true"
        :preview-data="previewData === undefined ? undefined : [previewData]"
        :created-data="createdData === undefined ? undefined : [createdData]"
        :value-getter="valueGetter"
        :value-query-key="valueQueryKey"
        :readonly="readonlyChips"
        :prefix-text="prefixText"
        :prefix-max="prefixMax"
        :known-data="knownData"
      >
        <template
          v-if="$slots.option"
          #option="{option, index, skeleton: skeletonOption}"
        >
          <slot
            name="option"
            :option="option"
            :index="index"
            :selected="true"
            :model="true"
            :skeleton="skeletonOption"
            :search="undefined"
          />
        </template>
      </SelectAsyncPrefix>
    </template>
  </SelectDeferred>

  <SelectAsyncBase
    v-else
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      disableClear: !allowClear,
      previewData: previewData ? [previewData] as Data[] : undefined,
      createdData: createdData ? [createdData] as Data[] : undefined,
      hidePrefix: true,
      cursorSelected: true,
      filterValue: filterValue === undefined ? modelValue : filterValue,
    }"
    :class="$attrs.class"
    @select="updateModelValue"
    @unselect="(value, data) => allowClear && updateModelValue(getClearValue(), data)"
    @focus="searchModel && typeof modelValue === 'string' ? selectComponentRef?.setSearch(modelValue) : undefined; $emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @init-model="$emit('init-model')"
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
      v-if="$slots.option"
      #option="scope"
    >
      <slot
        name="option"
        v-bind="scope"
      />
    </template>

    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>

    <template
      v-if="$slots.content"
      #content
    >
      <slot name="content" />
    </template>

    <template
      v-if="$slots.prefix"
      #prefix
    >
      <slot name="prefix" />
    </template>
  </SelectAsyncBase>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false, ClearValue extends SelectClearValue = null">
import type {SelectAsyncSingleProps, SelectClearValue, SelectOptionComponent, SelectOptionComponentProps, SelectOptionProps} from './types'

import {computed, toRef, useTemplateRef, watch} from 'vue'

import {useClearValue} from '@/utils/useClearValue'

import SelectAsyncBase from './components/SelectAsyncBase.vue'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'
import SelectDeferred from './components/SelectDeferred.vue'
import {useCloseOnPick} from './models/useCloseOnPick'
import {useDeferred} from './models/useDeferred'

type EmitType = AllowClear extends true ? Model | ClearValue : NonNullable<Model>

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectAsyncSingleProps<Model, Data, QueryParams, OptionComponent, AllowClear, ClearValue>>(),
  {
    valueGetter: (data: Data) => (data as unknown as {id: Model}).id,
    valueQueryKey: 'id__in',
    prefixMax: 8,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  /** The new value, with its option — `clearValue` when cleared. */
  (e: 'update:model-value', value: EmitType, data: Data | undefined): void
  /** A default value was selected by `useQueryFnDefault`. */
  (e: 'init-model'): void
  /** The field was focused. */
  (e: 'focus', value: FocusEvent | undefined): void
  /** The field lost focus. */
  (e: 'blur', value: FocusEvent): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const getClearValue = useClearValue(props)

const arrayValue = computed<Model[]>(() => props.modelValue ? [props.modelValue] : [])

const {isDeferred, deferredField, activate, focus} = useDeferred(props, () => selectComponentRef.value?.focus())

const getOption = (value: Model): Data | undefined => {
  return [props.createdData, props.previewData]
    .find(option => option !== undefined && props.valueGetter(option) === value)
}

// Chips from `previewData` need no query, so the chip renders without one when it is the selected option.
const hasPreview = computed(() => arrayValue.value.every(value => getOption(value) !== undefined))

const knownData = new Map<string, Data>()

const closeOnPick = useCloseOnPick(() => props.embedded ?? false, () => selectComponentRef.value?.close())

const updateModelValue = (value: Model | ClearValue, data: Data | undefined): void => {
  emit('update:model-value', value as EmitType, data)

  closeOnPick()
}

const blur = () => {
  selectComponentRef.value?.blur()
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
  focus,
})

defineSlots<{
  /** Replaces the `title` text. */
  title?: () => void
  /** Content between the title and the field. */
  subtitle?: () => void
  /** Content to the right of the field. */
  right?: (props: Record<string, never>) => void
  /** Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. */
  option?: (props: PartialNot<SelectOptionProps<Data>>) => void
  /** Content at the top of the menu, above the options. */
  content?: () => void
  /** Replaces the selected chips. */
  prefix?: () => void
}>()
</script>
