<template>
  <WDropdownMenu
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.LEFT_INNER"
  >
    <template #toggle>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        class="w-max"
        @click="isOpen = !isOpen"
      >
        Columns: {{ visible.length }} of {{ COLUMNS.length }}
      </WButton>
    </template>

    <template #content>
      <WClickOutside
        class="bg-default dark:bg-default-dark my-2 grid w-64 gap-1 rounded-xl p-3 shadow-md dark:border dark:border-gray-800"
        @click="isOpen = false"
      >
        <WCheckbox
          v-for="column in COLUMNS"
          :key="column"
          :model-value="visible.includes(column)"
          :title="column"
          no-margin
          @update:model-value="visible = $event ? [...visible, column] : visible.filter(item => item !== column)"
        />
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {HorizontalAlign} from 'eco-vue-js/dist/utils/HorizontalAlign'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WClickOutside from 'eco-vue-js/dist/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from 'eco-vue-js/dist/components/DropdownMenu/WDropdownMenu.vue'

const COLUMNS = ['Title', 'Author', 'Year', 'Genre', 'Available']

const isOpen = ref(false)
const visible = ref(['Title', 'Author', 'Year'])
</script>
