<template>
  <WToggle
    v-bind="{
      ...props,
      modelValue: modelValue === Theme.LIGHT,
      icon: modelValue === Theme.LIGHT ? markRaw(IconSun) : markRaw(IconMoon),
    }"
    @update:model-value="$emit('update:model-value', $event ? Theme.LIGHT : Theme.DARK)"
  />
</template>

<script lang="ts" setup>
import type {ToggleThemeProps} from './types'

import {markRaw} from 'vue'

import IconMoon from '@/assets/icons/IconMoon.svg?component'
import IconSun from '@/assets/icons/IconSun.svg?component'

import {Theme} from '@/utils/utils'

import WToggle from './WToggle.vue'

const props = defineProps<ToggleThemeProps>()

defineEmits<{
  (e: 'update:model-value', value: Theme): void
}>()
</script>
