<template>
  <WDropdownAdaptive
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.LEFT_INNER"
    update-align
    close-on-click-outside
    @close="isOpen = false"
  >
    <template #toggle>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        @click="isOpen = !isOpen"
      >
        <IconAdd class="square-[1.25em]" />

        <span class="whitespace-nowrap">Add filter</span>
      </WButton>
    </template>

    <template #header>
      <div class="py-2 text-base font-semibold">
        Add filter
      </div>
    </template>

    <template #content="{isMobile}">
      <div
        class="text-start font-normal"
        :class="{
          'bg-default dark:bg-default-dark max-h-80 overflow-y-auto overscroll-y-contain rounded-xl shadow-md dark:border dark:border-solid dark:border-gray-800': !isMobile,
        }"
      >
        <template
          v-for="(item, index) in filter"
          :key="index"
        >
          <WMenuItem
            v-if="!exclude?.includes(index)"
            @click="$emit('select', index); isOpen = false"
          >
            <div>
              <component
                :is="getMetaValue((Array.isArray(item.item) ? item.item[0].meta : item.item.meta).icon, queryParams)"
                class="square-[1.25em] -mt-1 inline"
              /> {{ getMetaValue((Array.isArray(item.item) ? item.item[0].meta : item.item.meta).title, queryParams) ?? '' }}
            </div>
          </WMenuItem>
        </template>
      </div>
    </template>
  </WDropdownAdaptive>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconAdd from '@/assets/icons/IconAdd.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {SemanticType} from '@/utils/SemanticType'

import {getMetaValue} from '../models/utils'

defineProps<{
  filter: {id: string, item: FilterComponent<QueryParams>}[]
  exclude: number[]
  queryParams: QueryParams
}>()

defineEmits<{
  (e: 'select', value: number): void
}>()

const isOpen = ref(false)
</script>