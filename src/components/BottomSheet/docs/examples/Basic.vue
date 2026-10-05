<template>
  <div class="flex flex-wrap items-center gap-4">
    <WBottomSheet
      :is-open="isOpen"
      compact
      @close="isOpen = false"
    >
      <template #toggle="{unclickable}">
        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :class="{'pointer-events-none': !unclickable}"
          @click="isOpen = true"
        >
          {{ plant }}
        </WButton>
      </template>

      <template #content>
        <div class="grid pb-6">
          <WMenuItem
            v-for="item in plants"
            :key="item"
            :active="item === plant"
            @click="pick(item)"
          >
            {{ item }}
          </WMenuItem>
        </div>
      </template>
    </WBottomSheet>

    <span class="text-description text-sm">Swipe it down, or tap the backdrop, to close it.</span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WBottomSheet from 'eco-vue-js/dist/components/BottomSheet/WBottomSheet.vue'
import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WMenuItem from 'eco-vue-js/dist/components/MenuItem/WMenuItem.vue'

const plants = ['Basil', 'Lavender', 'Mint', 'Rosemary', 'Thyme']

const plant = ref(plants[0]!)
const isOpen = ref(false)

const pick = (value: string) => {
  plant.value = value
  isOpen.value = false
}
</script>
