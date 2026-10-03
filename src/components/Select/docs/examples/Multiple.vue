<template>
  <WSelect
    :model-value="tags"
    :options="options"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Tags"
    placeholder="Add a tag"
    :option-component="OptionTag"
    class="max-w-md"
    @select="tags = [...tags, $event]"
    @unselect="tags = tags.filter(item => item !== $event)"
  />

  <p class="text-sm text-description">
    Model: {{ tags }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'

import OptionTag from './parts/OptionTag.vue'

const options = [
  {id: 1, name: 'indoor'},
  {id: 2, name: 'edible'},
  {id: 3, name: 'pet-safe'},
  {id: 4, name: 'fragrant'},
  {id: 5, name: 'evergreen'},
]

const tags = ref<number[]>([2, 3])
</script>
