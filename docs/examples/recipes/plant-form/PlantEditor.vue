<template>
  <div class="mb-8 flex flex-wrap items-end gap-4">
    <WSelectSingle
      v-model="plantId"
      :options="queryPlants.data.value ?? []"
      :value-getter="item => item.id"
      :search-fn="(item, search) => item.name.toLowerCase().includes(search)"
      :loading="queryPlants.isLoading.value"
      title="Plant on the page"
      class="min-w-60 grow"
      no-margin
    >
      <template #option="{option}">
        {{ option?.name }}
      </template>
    </WSelectSingle>

    <WButton
      :semantic-type="SemanticType.SECONDARY"
      :disabled="!isId(plantId)"
      @click="openModal(plantId)"
    >
      Edit in a modal
    </WButton>

    <WButton @click="openModal()">
      <IconAdd class="square-4" /> Add plant
    </WButton>
  </div>

  <!-- The same form on the page: each field saves as it changes. -->
  <PlantForm
    v-if="isId(plantId)"
    :plant-id="plantId"
    async
  />
</template>

<script lang="ts" setup>
import type {Plant} from '../plant-list/models/Plant'

import {defineAsyncComponent, markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {isId} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'

import PlantForm from './PlantForm.vue'

import {plantModelApi} from '../plant-list/api/Plant'

const PlantFormModal = defineAsyncComponent(() => import('./PlantFormModal.vue'))

const queryPlants = plantModelApi.list.use()

const plantId = ref<number | undefined>(1)

/** Edits the plant, or walks through adding one when there is no id. A new plant opens on the page. */
const openModal = (id?: number) => {
  Modal.add(markRaw(PlantFormModal), {
    plantId: id,
    onSaved: (plant: Plant) => plantId.value = plant.id,
  })
}
</script>
