<template>
  <div
    class="text-description group/model relative grid grid-cols-[1fr,auto] items-center"
    :class="{
      'cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
  >
    <slot name="option">
      <template v-if="optionComponent">
        <component
          v-bind="(optionComponentProps as SelectPrefixProps<Data, OptionComponent>['optionComponentProps'])"
          :is="(optionComponent as SelectOptionComponent<Data>)"
          :option="(option as Data)"
          :index="index"
          :selected="true"
          :model="true"
        >
          <WButtonUnselect
            v-if="!disableClear"
            :loading="loading"
            :disabled="disabled"
            class="-mr-2 ml-1"
            @mousedown.stop.prevent=""
            @click.stop.prevent="$emit('unselect')"
          />
        </component>
      </template>
    </slot>

    <WButtonUnselect
      v-if="!optionComponent && !disableClear"
      :loading="loading"
      :disabled="disabled"
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