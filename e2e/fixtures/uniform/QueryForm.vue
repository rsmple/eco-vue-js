<template>
  <div class="mb-4 flex gap-2">
    <WButton
      v-for="id in [1, 2]"
      :key="id"
      :semantic-type="itemId === id ? SemanticType.PRIMARY : SemanticType.SECONDARY"
      @click="itemId = id"
    >
      Item {{ id }}
    </WButton>
  </div>

  <WUniform
    :use-query-fn="usePlant"
    :query-params="itemId"
    :init-data="initData"
    :api-method="save"
    :async="hasParam('async')"
    tag="div"
    class="grid max-w-md"
    @success="events.push({success: $event})"
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="name"
        title="Name"
        required
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
        field="color"
        title="Color"
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
          <StateProbe
            name="color"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <!-- A form with its own copy of a part of the model, saved on its own. -->
      <WUniform
        v-bind="scope"
        field="care"
        :init-data="copyCare"
        :api-method="careApi.method"
      >
        <template #default="scopeCare">
          <WUniform
            v-bind="scopeCare"
            field="note"
            title="Care note"
          >
            <template #field="scopeField">
              <WInput v-bind="scopeField" />
              <StateProbe
                name="note"
                :value="fieldState(scopeField)"
              />
            </template>
          </WUniform>

          <WButton
            :disabled="!scopeCare.hasChanges"
            @click="scopeCare.submit?.()"
          >
            Save care
          </WButton>
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
  <StateProbe
    name="careCalls"
    :value="careApi.calls.value"
  />
  <StateProbe
    name="loads"
    :value="loads"
  />
  <StateProbe
    name="events"
    :value="events"
  />
</template>

<script lang="ts" setup>
import {useQueryClient} from '@tanstack/vue-query'
import {reactive, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {createDefaultQuery} from 'eco-vue-js/dist/utils/useDefaultQuery'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import StateProbe from '../shared/StateProbe.vue'
import {exposeControls, fieldState, formState, hasParam, useMockApi} from '../shared/fixture'

type Plant = {id: number, name: string, color: string, care: {note: string}}

const db: Record<number, Plant> = {
  1: {id: 1, name: 'Monstera', color: 'green', care: {note: 'Water weekly'}},
  2: {id: 2, name: 'Cactus', color: 'grey', care: {note: 'Rarely'}},
}

const copy = <Value>(value: Value): Value => JSON.parse(JSON.stringify(value)) as Value

// Each load waits for `fixture.load()`, so the tests see the form while an item loads.
const loads = ref<{id: number, status: 'pending' | 'done'}[]>([])
const pendingLoads: {index: number, id: number, resolve: (value: Plant) => void}[] = []

const usePlant = createDefaultQuery(
  'fixture-plant',
  'single',
  undefined,
  ({queryKey}) => new Promise<Plant>(resolve => {
    const id = queryKey[2] as number

    loads.value.push({id, status: 'pending'})
    pendingLoads.push({index: loads.value.length - 1, id, resolve})
  }),
  (value: unknown): value is number => typeof value === 'number',
)

const queryClient = useQueryClient()

const itemId = ref(1)

const api = useMockApi<Plant>(db[1]!)
const careApi = useMockApi<Plant['care']>(db[1]!.care, 'care.')

const events = reactive<unknown[]>([])

/** Saves into the db, and with `?cacheUpdate` writes the saved item to the cache before the save resolves, as an API layer that updates the cache does. */
const save = (payload: Partial<Plant>) => {
  const id = itemId.value
  const saved = {...copy(db[id]!), ...payload} as Plant

  db[id] = saved

  if (hasParam('cacheUpdate')) usePlant.setData(copy(saved), id, queryClient)

  return api.method(payload) as Promise<Plant>
}

const initData = (value: Plant): Plant => copy(value)

const copyCare = (value: Plant['care']): Plant['care'] => ({note: value?.note ?? ''})

exposeControls({
  load: () => {
    const item = pendingLoads.shift()

    if (!item) throw new Error('No pending load')

    loads.value[item.index]!.status = 'done'
    item.resolve(copy(db[item.id]!))
  },
  /** Another view saved the item: the cache gets its new value. */
  setCache: (id: number, patch: Partial<Plant>) => {
    db[id] = {...db[id]!, ...patch}
    usePlant.setData(copy(db[id]), id, queryClient)
  },
})
</script>
