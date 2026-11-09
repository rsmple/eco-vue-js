<template>
  <WUniform
    ref="form"
    :init-data="initData"
    :api-method="api.method"
    :full-payload="hasParam('fullPayload')"
    :no-init="hasParam('noInit')"
    :readonly="state === 'readonly'"
    :disabled="state === 'disabled'"
    :skeleton="state === 'skeleton'"
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

      <div
        v-if="hasParam('spacer')"
        class="h-[200vh]"
      />

      <WUniform
        v-bind="scope"
        field="email"
        title="Email"
        :validate="[validateEmail, validateNotReserved]"
        required
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
          <StateProbe
            name="email"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="nickname"
        title="Nickname"
        :validate="validateNickname"
        mandatory
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
          <StateProbe
            name="nickname"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="address"
        title="Address"
        :full-payload="hasParam('addressFull')"
      >
        <template #default="scopeAddress">
          <WUniform
            v-bind="scopeAddress"
            field="city"
            title="City"
            required
          >
            <template #field="scopeField">
              <WInput v-bind="scopeField" />
              <StateProbe
                name="city"
                :value="fieldState(scopeField)"
              />
            </template>
          </WUniform>

          <WUniform
            v-bind="scopeAddress"
            field="zip"
            title="Zip"
          >
            <template #field="scopeField">
              <WInput v-bind="scopeField" />
              <StateProbe
                name="zip"
                :value="fieldState(scopeField)"
              />
            </template>
          </WUniform>

          <StateProbe
            name="address"
            :value="formState(scopeAddress)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="tags"
        title="Tags"
      >
        <template #field="scopeField">
          <div class="flex gap-2">
            <WButton
              v-for="tag in ['math', 'poetry', 'engines']"
              :key="tag"
              :semantic-type="scopeField.modelValue.includes(tag) ? SemanticType.PRIMARY : SemanticType.SECONDARY"
              @click="scopeField.modelValue.includes(tag) ? scopeField.onUnselect(tag) : scopeField.onSelect(tag)"
            >
              tag {{ tag }}
            </WButton>
          </div>
          <StateProbe
            name="tags"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="token"
        title="Token"
        no-changes
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
          <StateProbe
            name="token"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <div class="flex gap-2">
        <WButton
          :disabled="!scope.hasChanges"
          :loading="scope.submitting"
          @click="scope.submit?.()"
        >
          Save
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="scope.doValidate()"
        >
          Validate
        </WButton>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          @click="scope.initModel()"
        >
          Keep as initial
        </WButton>
      </div>

      <StateProbe
        name="form"
        :value="{...formState(scope), hasValue: (scope as unknown as {hasValue: boolean | null}).hasValue}"
      />
    </template>
  </WUniform>

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
import {reactive, ref, useTemplateRef} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import StateProbe from '../shared/StateProbe.vue'
import {exposeControls, fieldState, fixtureParams, formState, hasParam, useMockApi} from '../shared/fixture'

type Profile = {
  name: string
  email: string
  nickname: string
  address: {city: string, zip: string}
  tags: string[]
  token: string
}

const INITIAL: Profile = {
  name: 'Ada',
  email: 'ada@example.com',
  nickname: '',
  address: {city: 'London', zip: ''},
  tags: ['math'],
  token: 'abc',
}

const api = useMockApi<Profile>(INITIAL)

const events = reactive<unknown[]>([])

const state = ref(fixtureParams().get('state') ?? 'editable')

const formRef = useTemplateRef('form')

exposeControls({
  setState: (value: string) => state.value = value,
  /** Submits through the template ref, as a button outside the form does — also while the Save button is disabled. */
  submit: () => formRef.value?.submit?.(),
})

const initData = (value: Partial<Profile>): Profile => ({
  ...INITIAL,
  ...value,
  address: {...INITIAL.address, ...value.address},
  tags: [...value.tags ?? INITIAL.tags],
})

const validateEmail = (value: unknown) => typeof value === 'string' && value && !value.includes('@') ? 'Enter a valid email' : undefined

const validateNotReserved = (value: unknown) => typeof value === 'string' && value.startsWith('admin') ? 'This email is reserved' : undefined

const validateNickname = (value: unknown) => typeof value === 'string' && value && value.length < 3 ? 'At least 3 characters' : undefined
</script>
