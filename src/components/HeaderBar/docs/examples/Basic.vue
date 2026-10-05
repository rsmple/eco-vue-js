<template>
  <div class="grid max-w-md gap-4">
    <span class="text-description text-sm">
      This page's header is a WHeaderBar: the search below is placed there, behind a search button on its right.
    </span>

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      @click="shown = !shown"
    >
      {{ shown ? 'Unmount the search' : 'Mount the search' }}
    </WButton>

    <WHeaderBarSearch
      v-if="shown"
      shown
    >
      <template #default="{hide}">
        <div class="flex w-full items-center gap-2">
          <WInput
            v-model="search"
            placeholder="Search plants"
            no-margin
            class="flex-1"
          />

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            @click="hide?.()"
          >
            Close
          </WButton>
        </div>
      </template>
    </WHeaderBarSearch>

    <span
      v-if="search"
      class="text-sm"
    >
      Searching for “{{ search }}”
    </span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WHeaderBarSearch from 'eco-vue-js/dist/components/HeaderBar/WHeaderBarSearch.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

const shown = ref(false)
const search = ref<string>()
</script>
