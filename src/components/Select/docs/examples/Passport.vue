<template>
  <WSelectAsync
    :model-value="plantIds"
    :use-query-fn-options="plantModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Shelf by the window"
    placeholder="Add a plant"
    :option-component="OptionPassport"
    :option-component-props="{textOnly}"
    class="max-w-xl"
    @select="plantIds = [...plantIds, $event]"
    @unselect="plantIds = plantIds.filter(item => item !== $event)"
    @update:model-value="plantIds = $event"
  />

  <WCheckbox
    v-model="textOnly"
    title="Text only"
  />

  <p class="text-sm text-description">
    Model: {{ plantIds }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WSelectAsync from 'eco-vue-js/dist/components/Select/WSelectAsync.vue'

import OptionPassport from './parts/OptionPassport.vue'

import {plantModelApi} from '../../../../../docs/examples/recipes/plant-list/api/Plant'

const plantIds = ref<number[]>([1, 2, 3, 4])

const textOnly = ref(false)
</script>
