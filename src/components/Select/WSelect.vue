<template>
  <SelectDeferred
    v-if="isDeferred"
    :model-value="modelValue ?? []"
    :get-option="getOption"
    :field="deferredField"
    :option-component="optionComponent"
    :option-component-props="optionComponentProps"
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
      v-if="$slots.prefix"
      #chips
    >
      <slot name="prefix" />
    </template>
  </SelectDeferred>

  <SelectBase
    v-else
    ref="selectComponent"
    v-bind="getDefinedProps(props)"
    :class="$attrs.class"
    @select="(value, data) => $emit('select', value, data)"
    @unselect="(value, data) => $emit('unselect', value, data)"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @update:query-options-error="$emit('update:query-options-error', $event)"
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
      v-if="$slots.prefix"
      #prefix
    >
      <slot name="prefix" />
    </template>

    <template
      v-if="$slots.content"
      #content
    >
      <slot name="content" />
    </template>
  </SelectBase>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectOptionComponent, SelectOptionProps, SelectProps} from './types'

import {useTemplateRef} from 'vue'

import SelectBase from './components/SelectBase.vue'
import SelectDeferred from './components/SelectDeferred.vue'
import {getDefinedProps, useDeferred} from './models/useDeferred'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectProps<Model, Data, QueryParamsOptions, OptionComponent>>(),
  {
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
  /** The field was focused. */
  (e: 'focus', value: FocusEvent | undefined): void
  /** The field lost focus. */
  (e: 'blur', value: FocusEvent): void
  /** Error detail from a failed `useQueryFnOptions`, or `undefined` once it loads. */
  (e: 'update:query-options-error', value: string | undefined): void
  /** A default value was selected by `useQueryFnDefault` or `useFirstDefault`. */
  (e: 'init-model'): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const {isDeferred, deferredField, activate, focus} = useDeferred(props, () => selectComponentRef.value?.focus())

const getOption = (value: Model): Data | undefined => {
  return [...props.options ?? [], ...props.createdData ?? [], ...props.previewData ?? []]
    .find(option => props.valueGetter(option) === value)
}

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
  /** Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. */
  option?: (props: PartialNot<SelectOptionProps<Data>>) => void
  /** Content to the right of the field. */
  right?: () => void
  /** Replaces the selected chips. */
  prefix?: () => void
  /** Content at the top of the menu, above the options. */
  content?: () => void
}>()
</script>
