<template>
  <WDropdownMenu
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.LEFT_INNER"
    update-align
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

    <template #content>
      <WClickOutside
        class="
          bg-default dark:bg-default-dark max-h-80 overflow-y-auto overscroll-y-contain
          rounded-xl text-start font-normal shadow-md dark:border dark:border-solid dark:border-gray-800
        "
        @click="isOpen = false"
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
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
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