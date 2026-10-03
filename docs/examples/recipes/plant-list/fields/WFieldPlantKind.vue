<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <!-- A tinted tag in the kind's own tone. -->
    <span
      class="bg-tone-soft text-tone flex w-max items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold"
      :class="kindDisplay[item.kind].tone"
    >
      <component
        :is="kindDisplay[item.kind].icon"
        class="square-3.5"
      />
      {{ kindDisplay[item.kind].name }}
    </span>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

import {kindDisplay} from '../models/PlantDisplay'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'kind',
  cssClass: 'basis-[7.5rem]',
  title: 'Kind',
  field: 'kind',
  // Used by CSV export and "copy as Markdown", which cannot render the tag.
  textFormat: item => item.kind,
} as const satisfies ListField<Plant>
</script>
