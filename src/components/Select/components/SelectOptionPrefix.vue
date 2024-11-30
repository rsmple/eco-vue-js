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
          <button
            v-if="!disableClear"
            class="square-5 relative -my-1 -mr-2 ml-1 flex items-center justify-center rounded-full outline-none"
            :class="{
              'cursor-not-allowed': disabled,
              'cursor-progress': loading,
              'w-ripple w-ripple-hover cursor-pointer ': !loading && !disabled,
            }"
            @mousedown.stop.prevent=""
            @click.stop.prevent="!loading && $emit('unselect')"
          >
            <IconCancel class="square-3" />
          </button>
        </component>
      </template>
    </slot>

    <button
      v-if="!optionComponent && !disableClear"
      class="square-5 relative flex items-center justify-center rounded-full outline-none"
      :class="{
        'cursor-not-allowed': disabled,
        'cursor-progress': loading,
        'w-ripple w-ripple-hover cursor-pointer ': !loading && !disabled,
      }"
      @mousedown.stop.prevent=""
      @click.stop.prevent="!loading && $emit('unselect')"
    >
      <IconCancel class="square-3" />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectOptionComponent, SelectPrefixProps} from '../types'

import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

defineProps<SelectPrefixProps<Data, OptionComponent>>()

defineEmits<{
  (e: 'unselect'): void
}>()
</script>