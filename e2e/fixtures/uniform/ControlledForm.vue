<template>
  <!-- No `initData`: the form edits the parent's model through `update:model-value` and compares it with `model-value-init`. -->
  <WUniform
    :model-value="model"
    :model-value-init="init"
    :api-method="api.method"
    tag="div"
    class="grid max-w-md"
    @update:model-value="update"
    @init-model="initModel"
    @success="events.push({success: $event})"
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="name"
        title="Name"
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
          <StateProbe
            name="name"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="address"
      >
        <template #default="scopeAddress">
          <WUniform
            v-bind="scopeAddress"
            field="city"
            title="City"
          >
            <template #field="scopeField">
              <WInput v-bind="scopeField" />
              <StateProbe
                name="city"
                :value="fieldState(scopeField)"
              />
            </template>
          </WUniform>

          <WButton
            :semantic-type="SemanticType.SECONDARY"
            @click="scopeAddress.updateModelValueInner('Baker St' as never, ['street'])"
          >
            Set street
          </WButton>
        </template>
      </WUniform>

      <div class="flex gap-2">
        <WButton
          :disabled="!scope.hasChanges"
          @click="scope.submit?.()"
        >
          Save
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="scope.onInitModel()"
        >
          Keep as initial
        </WButton>
      </div>

      <StateProbe
        name="form"
        :value="formState(scope)"
      />
    </template>
  </WUniform>

  <StateProbe
    name="model"
    :value="model"
  />
  <StateProbe
    name="calls"
    :value="api.calls.value"
  />
  <StateProbe
    name="events"
    :value="events"
  />
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import StateProbe from '../shared/StateProbe.vue'
import {fieldState, formState, useMockApi} from '../shared/fixture'

type Person = {name: string, address: {city: string, street?: string}}

const copy = <Value>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value

const INITIAL: Person = {name: 'Ada', address: {city: 'London'}}

const model = ref<Person>(copy(INITIAL))
const init = ref<Person>(copy(INITIAL))

const api = useMockApi<Person>(INITIAL)

const events = reactive<unknown[]>([])

/** Sets the value at the path of keys the form emitted, as a parent that keeps the model does. */
const update = (value: unknown, fields: (string | number)[]) => {
  events.push({update: value, fields})

  if (!fields.length) {
    model.value = value as Person
    return
  }

  const next = copy(model.value) as Record<string | number, unknown>
  let target = next

  for (const key of fields.slice(0, -1)) target = (target[key] ??= {}) as Record<string | number, unknown>

  target[fields[fields.length - 1]!] = value
  model.value = next as Person
}

const initModel = () => {
  events.push('init-model')
  init.value = copy(model.value)
}
</script>
