<template>
  <div class="grid max-w-md gap-4">
    <WDragContainer
      :list="steps"
      @update:list="steps = $event"
    >
      <template #default="{item, index, container, initDrag}">
        <div
          v-bind="container"
          class="bg-default dark:bg-default-dark mb-2 flex items-center gap-3 rounded-xl border border-solid border-gray-200 p-3 dark:border-gray-800"
        >
          <IconDrag
            class="text-description square-5 cursor-grab"
            @mousedown="initDrag"
          />

          <span class="text-description w-4">{{ index + 1 }}</span>

          <span>{{ item }}</span>
        </div>
      </template>
    </WDragContainer>

    <span class="text-description text-sm">Saved order: {{ steps.join(' → ') }}</span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WDragContainer from 'eco-vue-js/dist/components/DragContainer/WDragContainer.vue'

import IconDrag from 'eco-vue-js/dist/assets/icons/IconDrag'

const steps = ref(['Clone', 'Build', 'Scan dependencies', 'Scan code', 'Report'])
</script>
