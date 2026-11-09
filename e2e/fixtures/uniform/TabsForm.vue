<template>
  <WUniform
    :init-data="initData"
    :api-method="api.method"
    tag="div"
    class="grid max-w-md"
  >
    <template #default="scope">
      <WTabs
        show-has-value
        :no-switch-on-invalid="hasParam('noSwitch')"
        @update:current="current = $event"
      >
        <WTabsItem
          title="Profile"
          name="profile"
        >

          <WUniform
            v-bind="scope"
            field="name"
            title="Name"
            required
          >
            <template #field="scopeField">
              <WInput v-bind="scopeField" />
            </template>
          </WUniform>
        </WTabsItem>

        <WTabsItem
          title="Address"
          name="address"
        >
          <template #title="tabScope">
            Address

            <StateProbe
              name="tab-address"
              :value="tabScope"
            />
          </template>

          <WUniform
            v-bind="scope"
            field="city"
            title="City"
            required
          >
            <template #field="scopeField">
              <WInput v-bind="scopeField" />
            </template>
          </WUniform>

          <WUniform
            v-bind="scope"
            field="zip"
            title="Zip"
            mandatory
          >
            <template #field="scopeField">
              <WInput v-bind="scopeField" />
            </template>
          </WUniform>
        </WTabsItem>

        <!-- Its fields are not mounted: the form reports the states it is given. -->
        <WTabsItem
          title="Extra"
          name="extra"
        >

          <WUniform
            :init-has-value="extraHasValue"
            :init-has-error="extraHasError"
          >
            <template #default>
              <p>Extra</p>
            </template>
          </WUniform>
        </WTabsItem>
      </WTabs>

      <WButton @click="scope.submit?.()">
        Save
      </WButton>
    </template>
  </WUniform>

  <StateProbe
    name="current"
    :value="current"
  />
  <StateProbe
    name="calls"
    :value="api.calls.value"
  />
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import StateProbe from '../shared/StateProbe.vue'
import {exposeControls, hasParam, useMockApi} from '../shared/fixture'

type Model = {name: string, city: string, zip: string}

const INITIAL: Model = {name: 'Ada', city: '', zip: ''}

const api = useMockApi<Model>(INITIAL)

const current = ref('profile')

const extraHasValue = ref<boolean | null>(null)
const extraHasError = ref(false)

exposeControls({
  setExtra: (hasValue: boolean | null, hasError: boolean) => {
    extraHasValue.value = hasValue
    extraHasError.value = hasError
  },
})

const initData = (value: Partial<Model>): Model => ({...INITIAL, ...value})
</script>
