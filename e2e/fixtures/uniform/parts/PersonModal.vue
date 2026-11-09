<template>
  <WModalWrapper class="w-modal-wrapper-w-120">
    <template #title>
      Edit person
    </template>

    <WUniform
      ref="form"
      :init-data="initData"
      :api-method="apiMethod"
      :async="autoSave"
      tag="div"
      class="grid"
    >
      <template #default="scope">
        <WTabs
          v-if="variant === 'stepper'"
          stepper
          stepper-controls
          no-header
        >
          <WTabsItem
            title="Name"
            name="name"
            require-save
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
            title="City"
            name="city"
          >
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
          </WTabsItem>
        </WTabs>

        <WUniform
          v-else
          v-bind="scope"
          field="name"
          title="Name"
          required
        >
          <template #field="scopeField">
            <WInput v-bind="scopeField" />
          </template>
        </WUniform>
      </template>
    </WUniform>

    <template
      v-if="variant === 'form'"
      #actions
    >
      <WButton
        :disabled="!formRef?.hasChanges"
        :loading="formRef?.submitting"
        @click="formRef?.submit?.()"
      >
        Save
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {useTemplateRef} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

type Person = {name: string, city: string}

defineProps<{
  variant: 'form' | 'stepper'
  autoSave: boolean
  apiMethod: (value: Partial<Person>) => Promise<Person> | Person
}>()

// It does not declare the `close:modal` emit, as content often does not: the overlay's listener falls through to WModalWrapper.

const formRef = useTemplateRef('form')

const initData = (value: Partial<Person>): Person => ({name: 'Ada', city: 'London', ...value})
</script>
