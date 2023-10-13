<template>
  <div>
    <div
      v-if="title"
      class="text-xs font-semibold text-accent mb-2"
      :class="{'opacity-60': disabled}"
    >
      {{ title }}
    </div>

    <div
      class="flex"
      :class="{
        'flex-wrap gap-2': wrap,
      }"
    >
      <WButton
        v-for="(item, index) in list"
        :key="index"
        :semantic-type="item === modelValue ? SemanticType.PRIMARY : SemanticType.SECONDARY"
        :loading="item === loading"
        :disabled="(disabled || loading !== undefined) && item !== loading"
        :minimize="minimize"
        :class="wrap ? [
          item !== modelValue && '-mx-px'
        ] : [
          index !== list.length -1 ? 'rounded-r-none border-r-0' : item !== modelValue && '-mr-px',
          index !== 0 ?'rounded-l-none border-l-0' : item !== modelValue && '-ml-px'
        ]"
        @click="item !== modelValue && $emit('update:modelValue', item)"
      >
        <slot :item="item" />
      </WButton>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string | null | boolean">
import WButton from './WButton.vue'
import {SemanticType} from '@/utils/SemanticType'

defineProps<{
  modelValue: Model
  title?: string
  list: Model[]
  disabled?: boolean
  loading?: number | string
  minimize?: boolean
  wrap?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: Model): void
}>()

</script>