<template>
  <WFieldWrapper
    v-bind="props"
    :class="$attrs.class"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template #field>
      <div
        class="flex"
        :class="{
          'flex-wrap gap-2': wrap,
          'flex-col gap-2': col,
          'items-start': col && !stretch,
        }"
      >
        <WButton
          v-for="(item, index) in list"
          :key="index"
          :semantic-type="getValue(item as Model | Entity) === modelValue ? semanticType ?? SemanticType.PRIMARY : SemanticType.SECONDARY"
          :loading="getValue(item as Model | Entity) === loading"
          :disabled="disabled || (loading !== undefined && getValue(item as Model | Entity) !== loading)"
          :minimize="minimize"
          :join="!wrap && !col"
          :class="{
            'flex-1': stretch,
          }"
          @click="(alwaysEmit || getValue(item as Model | Entity) !== modelValue) && $emit('update:modelValue', getValue(item as Model | Entity))"
        >
          <slot :item="(item as ValueGetter extends undefined ? Model : Entity)" />
        </WButton>
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

<script lang="ts" setup generic="Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined">
import WButton from './WButton.vue'
import {SemanticType} from '@/utils/SemanticType'
import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'
import type {ButtonGroupPropsForEntity, ButtonGroupPropsForModel} from './types'

defineOptions({inheritAttrs: false})

const props = defineProps<ButtonGroupPropsForEntity<Model, Entity, ValueGetter> | ButtonGroupPropsForModel<Model, Entity, ValueGetter>>()

defineEmits<{
  (e: 'update:modelValue', value: Model): void
}>()

const getValue = (item: Model | Entity): Model => {
  if (props.valueGetter && typeof item === 'object') {
    return props.valueGetter(item as Entity)
  } else {
    return item as Model
  }
}

</script>