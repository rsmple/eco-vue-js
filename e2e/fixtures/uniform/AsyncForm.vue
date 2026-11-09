<template>
  <WUniform
    :init-data="initData"
    :api-method="api.method"
    :full-payload="hasParam('fullPayload')"
    tag="div"
    class="grid max-w-md"
    async
    @success="events.push({success: $event})"
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="theme"
        title="Theme"
      >
        <template #field="scopeField">
          <WButtonGroup
            v-bind="scopeField"
            :list="['light', 'dark', 'system']"
          >
            <template #option="{option}">
              {{ option }}
            </template>
          </WButtonGroup>
          <StateProbe
            name="theme"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="notifications"
        title="Email notifications"
        :confim-getter="confirmDisable"
      >
        <template #field="scopeField">
          <WToggle
            v-bind="scopeField"
            class="mb-4"
          />
          <StateProbe
            name="notifications"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="nickname"
        title="Nickname"
        :validate="validateNickname"
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
        field="bio"
        title="Bio"
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
          <StateProbe
            name="bio"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="email"
        title="Email"
        :confim-getter="confirmEmail"
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
          <StateProbe
            name="email"
            :value="fieldState(scopeField)"
          />
        </template>
      </WUniform>

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
    name="events"
    :value="events"
  />
</template>

<script lang="ts" setup>
import {reactive} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import StateProbe from '../shared/StateProbe.vue'
import {fieldState, fixtureParams, formState, hasParam, useMockApi} from '../shared/fixture'

type Settings = {theme: string, notifications: boolean, nickname: string, bio: string, email: string}

const INITIAL: Settings = {theme: 'system', notifications: true, nickname: 'ada', bio: '', email: 'ada@example.com'}

const api = useMockApi<Settings>(INITIAL)

const events = reactive<unknown[]>([])

const initData = (value: Partial<Settings>): Settings => ({...INITIAL, ...value})

const validateNickname = (value: unknown) => typeof value === 'string' && value.length < 3 ? 'At least 3 characters' : undefined

const confirmProps = (value: boolean): ConfirmProps | undefined => value ? undefined : {
  title: 'Turn off notifications?',
  description: 'You will stop getting emails.',
  acceptText: 'Turn off',
}

const confirmEmail = (): ConfirmProps => ({title: 'Change the email?', description: 'A confirmation link goes to the new address.', acceptText: 'Change'})

// `?confirm=async` resolves the props a moment later, as a getter that asks the API first.
const confirmDisable = fixtureParams().get('confirm') === 'async'
  ? (value: boolean) => new Promise<ConfirmProps | undefined>(resolve => setTimeout(() => resolve(confirmProps(value)), 50))
  : confirmProps
</script>
