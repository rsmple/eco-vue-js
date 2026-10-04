<template>
  <DropdownOverlay
    :is-open="isOpen"
    @close="isOpen = false"
  >
    <template #toggle>
      <WButton
        :semantic-type="isOpen ? SemanticType.PRIMARY : SemanticType.SECONDARY"
        :class="isOpen ? 'outline-solid outline-2 outline-focus/20 before:opacity-15' : undefined"
        outline
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

    <template #content>
      <div class="text-start font-normal sm:max-h-80 sm:overflow-y-auto sm:overscroll-y-contain">
        <WMenuItem
          v-for="item in filter"
          :key="item.id"
          @click="$emit('select', item.id); isOpen = false"
        >
          <div>
            <component
              :is="getMetaValue((Array.isArray(item.item) ? item.item[0].meta : item.item.meta).icon, queryParams)"
              class="square-[1.25em] -mt-1 inline"
            /> {{ getMetaValue((Array.isArray(item.item) ? item.item[0].meta : item.item.meta).title, queryParams) ?? '' }}
          </div>
        </WMenuItem>
      </div>
    </template>
  </DropdownOverlay>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconAdd from '@/assets/icons/IconAdd.svg?component'

import DropdownOverlay from '@/components/DropdownMenu/components/DropdownOverlay.vue'
import {SemanticType} from '@/utils/SemanticType'

import {getMetaValue} from '../models/utils'

defineProps<{
  filter: {id: string, item: FilterComponent<QueryParams>}[]
  queryParams: QueryParams
}>()

defineEmits<{
  (e: 'select', value: string): void
}>()

const isOpen = ref(false)
</script>