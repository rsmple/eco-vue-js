<template>
  <!--
    A small form, opened as a dropdown at the button — a bottom sheet on phones — or as a modal: the frame places its title and buttons.
    The select is embedded, as in a filter: its search field is pinned under the title, and the caretakers are listed in place of a menu.
  -->
  <WModalWrapper>
    <template #title>
      Change caretaker of {{ countText }}
    </template>

    <WUniform
      ref="form"
      :init-data="() => ({caretaker: undefined})"
      :api-method="save"
      full-payload
      @success="$emit('close:modal')"
    >
      <template #default="scope">
        <WUniform
          v-bind="scope"
          field="caretaker"
          title="Caretaker"
          required
        >
          <template #field="scopeField">
            <WSelectSingle
              v-bind="scopeField"
              :options="gardeners"
              :value-getter="item => item.id"
              :search-fn="(item, search) => item.name.toLowerCase().includes(search)"
              :option-component="markRaw(OptionGardener)"
              placeholder="Search caretakers"
              required
              embedded
            />
          </template>
        </WUniform>
      </template>
    </WUniform>

    <template #actions>
      <WButton
        :disabled="formRef?.submitting"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="$emit('close:modal')"
      >
        Cancel
      </WButton>

      <WButton
        :disabled="!formRef?.hasChanges"
        :loading="formRef?.submitting"
        class="w-full"
        @click="formRef?.submit?.()"
      >
        Save
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {markRaw, useTemplateRef} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import {Notify} from '@/utils/Notify'
import {numberFormatter} from '@/utils/utils'

import {type QueryParamsPlants, plantModelApi} from './api/Plant'

import {gardeners} from '../../shared/Gardener'
import OptionGardener from '../../shared/OptionGardener.vue'

type CaretakerFormData = {
  caretaker: number | undefined
}

const props = defineProps<{
  /** The plants to change: the list's filters and selection, or one plant by id. */
  queryParams: QueryParamsPlants
  count: number
  /** Called once saved, such as to clear the selection. */
  onSaved?: () => void
}>()

defineEmits<{
  (e: 'close:modal'): void
}>()

const formRef = useTemplateRef('form')

const countText = `${ numberFormatter.format(props.count) } plant${ props.count === 1 ? '' : 's' }`

const save = (payload: Partial<CaretakerFormData>) => {
  return plantModelApi.paginated.actions.updateMany(props.queryParams, {caretaker: payload.caretaker})
    .then(() => {
      Notify.success({title: `Caretaker changed for ${ countText }`})
      props.onSaved?.()
    })
}
</script>
