<template>
  <WTabs switch-to-new>
    <WTabsItem
      v-for="tab in tabs"
      :key="tab.id"
      :name="String(tab.id)"
      :title="tab.title"
      v-bind="tabs.length > 1 ? {onClose: () => remove(tab.id)} : {}"
    >
      <p>Contents of {{ tab.title }}.</p>
    </WTabsItem>

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      class="ml-2 self-center"
      @click="add"
    >
      <IconAdd class="square-4" />
    </WButton>
  </WTabs>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'

let nextId = 3

const tabs = ref([
  {id: 1, title: 'Query 1'},
  {id: 2, title: 'Query 2'},
])

const add = () => {
  tabs.value.push({id: nextId, title: `Query ${ nextId }`})
  nextId++
}

const remove = (id: number) => {
  tabs.value = tabs.value.filter(tab => tab.id !== id)
}
</script>
