<template>
  <WDropdownMenu
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.CENTER"
    update-align
  >
    <template #toggle>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        @click="$emit('toggle')"
      >
        <component
          :is="icon"
          v-if="icon"
          class="square-[1.25em]"
        />

        <span class="whitespace-nowrap">{{ title }} ({{ count }})</span>

        <div
          v-if="!readonly"
          role="button"
          aria-label="Remove filter"
          class="group p-1"
          @click.stop="$emit('remove')"
        >
          <div class="square-4 relative flex items-center justify-center rounded-full group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
            <IconClose class="square-[1em]" />
          </div>
        </div>
      </WButton>
    </template>

    <template #content>
      <WClickOutside
        class="bg-default dark:bg-default-dark my-1 w-96 rounded-xl p-4 text-start font-normal shadow-md dark:border dark:border-solid dark:border-gray-800"
        @click="emit('close')"
      >
        <component
          :is="item[0].default"
          v-if="Array.isArray(item)"
          v-bind="item[1]"
          :scope="scope"
          :readonly="readonly"
          :global="false"
        />

        <component
          :is="item.default"
          v-else
          :scope="scope"
          :readonly="readonly"
          :global="false"
        />
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {computed} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconClose from '@/assets/icons/IconClose.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {SemanticType} from '@/utils/SemanticType'

import {getMetaValue} from '../models/utils'

const props = defineProps<{
  scope: UniformScope<QueryParams>
  item: FilterComponent<QueryParams>
  isOpen: boolean
  readonly: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'close'): void
  (e: 'remove'): void
}>()

const meta = computed(() => Array.isArray(props.item) ? props.item[0].meta : props.item.meta)

const title = computed(() => getMetaValue(meta.value.title, props.scope.modelValue))

const icon = computed(() => getMetaValue(meta.value.icon, props.scope.modelValue))

const count = computed(() => meta.value.fields
  ?.filter(field => field in (props.scope.modelValue as Record<string, unknown>) && props.scope.modelValue[field] !== undefined)
  .length ?? 0)
</script>
