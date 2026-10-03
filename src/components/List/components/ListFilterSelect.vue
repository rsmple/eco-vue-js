<template>
  <WDropdownAdaptive
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.CENTER"
    update-align
    close-on-click-outside
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

    <template #content="{isMobile, isTop}">
      <div class="flex-col flex items-center tone-surface-raised">
        <WDropdownTip
          v-if="!isMobile"
          :top="isTop"
        />

        <div
          class="text-start font-normal"
          :class="{
            'surface-raised max-h-80 overflow-y-auto overscroll-y-contain rounded-xl shadow-md border border-solid border-line-raised': !isMobile,
          }"
        >
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
      </div>
    </template>
  </WDropdownAdaptive>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WDropdownTip from '@/components/Dropdown/WDropdownTip.vue'
import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconAdd from '@/assets/icons/IconAdd.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
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