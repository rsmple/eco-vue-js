<template>
  <div>
    <div
      v-if="title || $slots.title?.().length"
      class="text-xs font-semibold text-accent mb-2"
      :class="{'opacity-60': disabled}"
    >
      <slot name="title">
        {{ title }}
      </slot>
    </div>

    <div
      class="flex px-px"
      :class="{
        'flex-wrap gap-2': wrap,
      }"
    >
      <WButton
        v-for="(item, index) in list"
        :key="index"
        :semantic-type="getValue(item) === modelValue ? semanticType ?? SemanticType.PRIMARY : SemanticType.SECONDARY"
        :loading="getValue(item) === loading"
        :disabled="disabled || (loading !== undefined && getValue(item) !== loading)"
        :minimize="minimize"
        :class="wrap ? [
          getValue(item) !== modelValue && '-mx-px'
        ] : [
          index !== list.length -1 ? 'rounded-r-none border-r-0' : getValue(item) !== modelValue && '-mr-px',
          index !== 0 ?'rounded-l-none border-l-0' : getValue(item) !== modelValue && '-ml-px',
          stretch ? 'flex-1' : undefined,
        ]"
        @click="getValue(item) !== modelValue && $emit('update:modelValue', getValue(item))"
      >
        <slot :item="(item as typeof valueGetter extends never ? Model : Entity)" />
      </WButton>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string | null | boolean, Entity extends Record<string, unknown>">
import WButton from './WButton.vue'
import {SemanticType} from '@/utils/SemanticType'

type PropsForModel = {
  modelValue: Model
  title?: string
  list: Model[]
  valueGetter: never
  disabled?: boolean
  loading?: number | string
  minimize?: boolean
  wrap?: boolean
  semanticType?: SemanticType
  stretch?: boolean
}

type PropsForEntity = {
  modelValue: Model
  title?: string
  list: Entity[]
  valueGetter: (value: Entity) => Model
  disabled?: boolean
  loading?: number | string
  minimize?: boolean
  wrap?: boolean
  semanticType?: SemanticType
  stretch?: boolean
}

const props = defineProps<PropsForModel | PropsForEntity>()

defineEmits<{
  (e: 'update:modelValue', value: Model): void
}>()

const getValue = (item: Model | Entity): Model => {
  if ('valueGetter' in props && typeof item === 'object') {
    return props.valueGetter(item as Entity)
  } else {
    return item as Model
  }
}

</script>