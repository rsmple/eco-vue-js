<template>
  <div class="flex gap-2">
    <WButton @click="open('form')">
      Open form
    </WButton>

    <WButton @click="open('stepper')">
      Open stepper
    </WButton>
  </div>

  <StateProbe
    name="calls"
    :value="api.calls.value"
  />
  <StateProbe
    name="closed"
    :value="closed"
  />
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

import PersonModal from './parts/PersonModal.vue'

import StateProbe from '../shared/StateProbe.vue'
import {hasParam, useMockApi} from '../shared/fixture'

const api = useMockApi<{name: string, city: string}>({name: 'Ada', city: 'London'})

const closed = ref(0)

const open = (variant: 'form' | 'stepper') => {
  Modal.add(markRaw(PersonModal), {
    variant,
    autoSave: hasParam('async'),
    apiMethod: api.method as (value: unknown) => Promise<{name: string, city: string}>,
  }, () => closed.value++)
}
</script>
