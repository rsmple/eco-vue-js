<template>
  <WButtonGroup
    v-model="state"
    :list="['editable', 'readonly', 'disabled', 'skeleton']"
    class="mb-6"
  >
    <template #option="{option}">
      {{ option }}
    </template>
  </WButtonGroup>

  <WUniform
    :init-data="initData"
    :readonly="state === 'readonly'"
    :disabled="state === 'disabled'"
    :skeleton="state === 'skeleton'"
    tag="div"
    class="grid max-w-md"
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="title"
        title="Title"
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="priority"
        title="Priority"
      >
        <template #field="scopeField">
          <WButtonGroup
            v-bind="scopeField"
            :list="['low', 'medium', 'high']"
          >
            <template #option="{option}">
              {{ option }}
            </template>
          </WButtonGroup>
        </template>
      </WUniform>
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

const state = ref('editable')

const initData = () => ({title: 'Repot the monstera', priority: 'medium'})
</script>
