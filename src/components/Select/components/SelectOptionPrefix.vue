<template>
  <template v-if="optionComponent">
    <component
      v-bind="(optionComponentProps as SelectPrefixProps<Data, OptionComponent>['optionComponentProps'])"
      :is="(optionComponent as SelectOptionComponent<Data>)"
      :option="option"
      :index="index"
      :search="option === undefined ? search as string : undefined"
      :selected="true"
      :model="true"
    >
      <WButtonUnselect
        v-if="!disableClear"
        :loading="loading"
        :disabled="disabled"
        class="w-option-button ml-1 mr-2"
        @mousedown.stop.prevent=""
        @click.stop.prevent="$emit('unselect')"
      />
    </component>
  </template>

  <div
    v-else
    class="text-description group/model relative grid grid-cols-[1fr,auto] items-center"
    :class="{
      'cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
  >
    <slot
      name="option"
      :option="option"
      :search="option === undefined ? search as string : undefined"
    />

    <WButtonUnselect
      v-if="!disableClear"
      :loading="loading"
      :disabled="disabled"
      class="mx-1 mr-2"
      @mousedown.stop.prevent=""
      @click.stop.prevent="$emit('unselect')"
    />
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectOptionComponent, SelectPrefixProps} from '../types'

import WButtonUnselect from '@/components/Button/WButtonUnselect.vue'

defineProps<SelectPrefixProps<Data, OptionComponent>>()

defineEmits<{
  (e: 'unselect'): void
}>()
</script>