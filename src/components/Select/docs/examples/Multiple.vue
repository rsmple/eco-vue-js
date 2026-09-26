<template>
  <WSelect
    :model-value="tags"
    :options="options"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Tags"
    placeholder="Add a tag"
    class="max-w-md"
    @select="tags = [...tags, $event]"
    @unselect="tags = tags.filter(item => item !== $event)"
  >
    <template #option="{option}">
      {{ option?.name }}
    </template>
  </WSelect>

  <p class="text-sm text-gray-500">
    Model: {{ tags }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'

const options = [
  {id: 1, name: 'urgent'},
  {id: 2, name: 'backend'},
  {id: 3, name: 'frontend'},
  {id: 4, name: 'design'},
  {id: 5, name: 'docs'},
]

const tags = ref<number[]>([2, 3])
</script>
