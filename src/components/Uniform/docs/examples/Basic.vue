<template>
  <WUniform
    :init-data="initData"
    :api-method="save"
    tag="div"
    class="grid max-w-md"
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="name"
        title="Name"
        required
      >
        <template #field="scopeField">
          <WInput
            v-bind="scopeField"
            required
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="email"
        title="Email"
        :validate="validateEmail"
        required
      >
        <template #field="scopeField">
          <WInput
            v-bind="scopeField"
            placeholder="Try taken@example.com"
            required
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="newsletter"
        title="Subscribe to the newsletter"
      >
        <template #field="scopeField">
          <WCheckbox
            v-bind="scopeField"
            class="mb-4"
          />
        </template>
      </WUniform>

      <WButton
        :disabled="!scope.hasChanges"
        :loading="scope.submitting"
        class="w-fit"
        @click="scope.submit?.()"
      >
        Save
      </WButton>
    </template>
  </WUniform>

  <p class="mt-4 text-sm text-gray-500">
    Last payload: {{ sent ? JSON.stringify(sent) : '—' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {ApiError} from 'eco-vue-js/dist/utils/api'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

type Profile = {name: string, email: string, newsletter: boolean}

const sent = ref<Partial<Profile>>()

let stored: Profile = {name: '', email: '', newsletter: false}

const initData = (value: Partial<Profile>): Profile => ({
  name: value.name ?? '',
  email: value.email ?? '',
  newsletter: value.newsletter ?? false,
})

const validateEmail = (value: unknown) => typeof value === 'string' && value && !value.includes('@') ? 'Enter a valid email' : undefined

// Stands in for an API call: gets only the changed fields and returns the whole saved object.
const save = (payload: Partial<Profile>) => new Promise<Profile>((resolve, reject) => {
  sent.value = payload

  setTimeout(() => {
    if (payload.email === 'taken@example.com') {
      reject(new ApiError({data: {email: ['This email is already taken']}, request: new Request('/profile')}))
    } else {
      stored = {...stored, ...payload}
      resolve(stored)
    }
  }, 800)
})
</script>
