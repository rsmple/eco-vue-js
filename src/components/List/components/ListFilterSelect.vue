<template>
  <WDropdownMenu
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.FILL"
    :max-height="320"
    :max-width="320"
    teleport
    update-align
  >
    <template #toggle>
      <WButtonTab
        title="Add filter"
        :icon="markRaw(IconAdd)"
        side
        @click="isOpen = true"
      />
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
                :is="getItemProp(queryParams, item, 'icon')"
                class="square-[1.25em] -mt-1 inline"
              /> {{ getItemProp(queryParams, item, 'title') ?? '' }}
            </div>
          </WMenuItem>
        </template>
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {markRaw, ref} from 'vue'

import WButtonTab from '@/components/Button/WButtonTab.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconAdd from '@/assets/icons/sax/IconAdd.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

import {getItemProp} from '../models/utils'

defineProps<{
  filter: FilterComponent<QueryParams>[]
  exclude: number[]
  queryParams: QueryParams
}>()

defineEmits<{
  (e: 'select', value: number): void
}>()

const isOpen = ref(false)
</script>