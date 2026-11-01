<template>
  <SelectDeferred
    v-if="isDeferred"
    :model-value="modelValue ?? []"
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
        :model-value="modelValue ?? []"
      />

      <SelectAsyncPrefix
        v-else
        :use-query-fn="useQueryFnPrefix ?? useQueryFnOptions"
        :model-value="modelValue ?? []"
        :disabled="disabledChips"
        :loading="loading"
        :option-component="(optionComponent as SelectOptionComponent<Data>)"
        :option-component-props="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
        :disable-clear="true"
        :preview-data="previewData"
        :created-data="createdData"
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
    v-bind="getDefinedProps(props)"
    :class="$attrs.class"
    @select="(value, data) => $emit('select', value, data)"
    @unselect="(value, data) => $emit('unselect', value, data)"
    @update:model-value="$emit('update:model-value', $event)"
    @focus="$emit('focus', $event)"
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
      #prefix="scope"
    >
      <slot
        name="prefix"
        v-bind="scope"
      />
    </template>
  </SelectAsyncBase>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectAsyncProps, SelectOptionComponent, SelectOptionComponentProps, SelectOptionProps} from './types'

import {computed, useTemplateRef} from 'vue'

import SelectAsyncBase from './components/SelectAsyncBase.vue'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'
import SelectDeferred from './components/SelectDeferred.vue'
import {getDefinedProps, useDeferred} from './models/useDeferred'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectAsyncProps<Model, Data, QueryParams, OptionComponent>>(),
  {
    emptyStub: 'No match',
    valueGetter: (data: Data) => (data as unknown as {id: Model}).id,
    valueQueryKey: 'id__in',
    prefixMax: 8,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

defineEmits<{
  /** An option was picked. Add it to `modelValue`. */
  (e: 'select', item: Model, data: Data): void
  /** An option was removed, from its chip or the menu. Remove it from `modelValue`. */
  (e: 'unselect', item: Model, data: Data | undefined): void
  /** Emits `[]` from the clear-all button shown with the count, when more than `prefixMax` values are selected. */
  (e: 'update:model-value', value: Model[]): void
  /** A default value was selected by `useQueryFnDefault`. */
  (e: 'init-model'): void
  /** The field was focused. */
  (e: 'focus', value: FocusEvent | undefined): void
  /** The field lost focus. */
  (e: 'blur', value: FocusEvent): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const {isDeferred, deferredField, activate, focus} = useDeferred(props, () => selectComponentRef.value?.focus())

const getOption = (value: Model): Data | undefined => {
  return [...props.createdData ?? [], ...props.previewData ?? []]
    .find(option => props.valueGetter(option) === value)
}

// Chips from `previewData` need no query, so the chips render without one when it has every selected option.
const hasPreview = computed(() => {
  if (!props.modelValue?.length) return true

  return props.modelValue.length <= props.prefixMax && props.modelValue.every(value => getOption(value) !== undefined)
})

const knownData = new Map<string, Data>()

defineExpose({
  focus,
  blur: () => selectComponentRef.value?.blur(),
  close: () => selectComponentRef.value?.close(),
  setSearch: (value: string) => selectComponentRef.value?.setSearch(value),
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
  prefix?: (props: {modelValue: Model[]}) => void
}>()
</script>
