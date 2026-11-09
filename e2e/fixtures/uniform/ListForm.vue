<template>
  <WUniform
    :init-data="initData"
    :api-method="api.method"
    tag="div"
    class="grid max-w-md"
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="items"
        title="Items"
      >
        <template #default="scopeItems">
          <ul>
            <li
              v-for="(item, key) in scopeItems.modelValueList"
              :key="key"
              :title="key"
              class="flex gap-2"
            >
              <span>{{ item.name }}</span>

              <WButton
                :semantic-type="SemanticType.SECONDARY"
                @click="scopeItems.unselect(item)"
              >
                Remove {{ item.name }}
              </WButton>
            </li>
          </ul>

          <div class="flex gap-2">
            <WButton
              :semantic-type="SemanticType.SECONDARY"
              @click="scopeItems.select({name: nextName()})"
            >
              Add
            </WButton>

            <WButton
              :semantic-type="SemanticType.SECONDARY"
              @click="scopeItems.updateModelValue([...scopeItems.modelValue].reverse())"
            >
              Reverse
            </WButton>
          </div>

          <StateProbe
            name="items"
            :value="{...formState(scopeItems), keys: Object.keys(scopeItems.modelValueList)}"
          />
        </template>
      </WUniform>

      <WButton
        :disabled="!scope.hasChanges"
        @click="scope.submit?.()"
      >
        Save
      </WButton>

      <StateProbe
        name="form"
        :value="formState(scope)"
      />
    </template>
  </WUniform>

  <StateProbe
    name="calls"
    :value="api.calls.value"
  />
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import StateProbe from '../shared/StateProbe.vue'
import {formState, useMockApi} from '../shared/fixture'

type Item = {name: string}
type Model = {items: Item[]}

const INITIAL: Model = {items: [{name: 'a'}, {name: 'b'}, {name: 'c'}]}

const api = useMockApi<Model>(INITIAL)

let added = 0

const nextName = () => `new ${ ++added }`

const initData = (value: Partial<Model>): Model => ({items: (value.items ?? INITIAL.items).map(item => ({...item}))})
</script>
