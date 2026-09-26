<template>
  <div class="flex items-center gap-6">
    <span>Project Atlas</span>

    <WButtonMore>
      <WButtonMoreItem
        text="Rename"
        :icon="markRaw(IconEdit)"
        @click="action = 'Rename'"
      />

      <WButtonMoreItem
        text="Duplicate"
        :icon="markRaw(IconCopy)"
        @click="action = 'Duplicate'"
      />

      <WButtonMoreItem
        text="Archive"
        :icon="markRaw(IconArchiveBook)"
        disabled
        tooltip-text="Only owners can archive a project"
      />

      <WButtonMoreItem
        text="Delete"
        :icon="markRaw(IconTrash)"
        class="text-negative dark:text-negative-dark"
        @click="action = 'Delete'"
      />
    </WButtonMore>

    <WButtonDropdown>
      <template #button>
        <WButton @click="action = 'Export as CSV'">
          Export as CSV
        </WButton>
      </template>

      <template #content="{close}">
        <WButtonMoreItem
          text="Export as JSON"
          @click="action = 'Export as JSON'; close()"
        />

        <WButtonMoreItem
          text="Export as PDF"
          @click="action = 'Export as PDF'; close()"
        />
      </template>
    </WButtonDropdown>
  </div>

  <p class="text-description mt-4 text-sm">
    Last action: {{ action ?? 'none' }}
  </p>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonDropdown from 'eco-vue-js/dist/components/Button/WButtonDropdown.vue'
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'
import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconCopy from 'eco-vue-js/dist/assets/icons/IconCopy'
import IconEdit from 'eco-vue-js/dist/assets/icons/IconEdit'
import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

const action = ref<string>()
</script>
