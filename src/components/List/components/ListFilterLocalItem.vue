<template>
  <WDropdownAdaptive
    :is-open="isOpen"
    frame-class="max-w-96 max-h-80 w-dropdown-frame"
    @close="$emit('close')"
  >
    <template #toggle>
      <WButton
        :semantic-type="isOpen ? SemanticType.PRIMARY : SemanticType.SECONDARY"
        :class="isOpen ? 'outline-solid outline-2 outline-focus/20 before:opacity-15' : undefined"
        outline
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
          <div class="square-4 relative flex items-center justify-center rounded-full group-hover:bg-surface-muted">
            <IconClose class="square-[1em]" />
          </div>
        </div>
      </WButton>
    </template>

    <template #header>
      <component
        :is="icon"
        v-if="icon"
        class="square-[1.25em]"
      />

      <span>{{ title }}</span>
    </template>

    <template #content>
      <div
        class="text-start font-normal"
        :class="meta.embedded ? undefined : 'p-4 sm:w-96'"
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
      </div>
    </template>
  </WDropdownAdaptive>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {computed} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'

import IconClose from '@/assets/icons/IconClose.svg?component'

import {SemanticType} from '@/utils/SemanticType'

import {getMetaValue} from '../models/utils'

const props = defineProps<{
  scope: UniformScope<QueryParams>
  item: FilterComponent<QueryParams>
  isOpen: boolean
  readonly: boolean
}>()

defineEmits<{
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
