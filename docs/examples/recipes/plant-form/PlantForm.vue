<template>
  <!--
    The form brings its own title and buttons: the frame it opens in — a modal, a dropdown, a bottom sheet — places them. On a page, there are none.
    Creating, the stepper brings its own instead: the step's title, the progress, and Back, Next and Add plant.
  -->
  <WModalWrapper
    maximized
    class="sm:w-modal-wrapper-w-160"
  >
    <template
      v-if="!async && !isCreate"
      #title
    >
      {{ formRef?.modelValue.name || 'Plant' }}
    </template>

    <WUniform
      ref="form"
      :use-query-fn="plantModelApi.item.use"
      :query-params="plantId ?? 0"
      :init-data="getModel"
      :api-method="save"
      :full-payload="!isId(plantId)"
      :async="async"
      :readonly="readonly"
      @success="$emit('saved', $event); async || $emit('close:modal')"
    >
      <template #default="scope">
        <!-- One set of tabs, three layouts: steps when creating, tabs when editing, every tab under its title on a page. -->
        <WTabs
          :stepper="isCreate"
          :no-header="isCreate"
          :flat="async"
          submit-text="Add plant"
          stepper-controls
        >
          <WTabsItem
            title="Plant"
            name="plant"
          >
            <div class="py-2">
              <WUniform
                v-bind="scope"
                field="name"
                title="Name"
                required
              >
                <template #field="scopeField">
                  <WInput
                    v-bind="scopeField"
                    :max-length="100"
                    :autofocus="isCreate"
                    required
                  />
                </template>
              </WUniform>

              <WUniform
                v-bind="scope"
                field="species"
                title="Species"
                required
              >
                <template #field="scopeField">
                  <WInput
                    v-bind="scopeField"
                    :max-length="100"
                    placeholder="Monstera deliciosa"
                    required
                  />
                </template>
              </WUniform>

              <WUniform
                v-bind="scope"
                field="kind"
                title="Kind"
                required
              >
                <template #field="scopeField">
                  <WButtonGroup
                    v-bind="scopeField"
                    :list="Object.values(Kind)"
                    wrap
                  >
                    <template #option="{option}">
                      <component
                        :is="kindDisplay[option].icon"
                        class="square-[1.25em]"
                      />
                      {{ kindDisplay[option].name }}
                    </template>
                  </WButtonGroup>
                </template>
              </WUniform>

              <WUniform
                v-bind="scope"
                field="height"
                title="Height, cm"
                :validate="validatePositive"
              >
                <template #field="scopeField">
                  <WInput
                    v-bind="scopeField"
                    type="number"
                  />
                </template>
              </WUniform>
            </div>
          </WTabsItem>

          <WTabsItem
            title="Care"
            name="care"
          >
            <div class="py-2">
              <WInfoCard class="mb-6">
                Light and watering are for a typical room — set them for where the plant stands.
              </WInfoCard>

              <WUniform
                v-bind="scope"
                field="light"
                title="Light"
              >
                <template #field="scopeField">
                  <WButtonGroup
                    v-bind="scopeField"
                    :list="Object.values(Light)"
                    wrap
                  >
                    <template #option="{option}">
                      <component
                        :is="lightDisplay[option].icon"
                        class="square-[1.25em]"
                      />
                      {{ lightDisplay[option].name }}
                    </template>
                  </WButtonGroup>
                </template>
              </WUniform>

              <div class="grid grid-cols-2 gap-4">
                <WUniform
                  v-bind="scope"
                  field="water"
                  title="Water per watering, ml"
                  :validate="validatePositive"
                >
                  <template #field="scopeField">
                    <WInput
                      v-bind="scopeField"
                      type="number"
                    />
                  </template>
                </WUniform>

                <WUniform
                  v-bind="scope"
                  field="humidity"
                  title="Humidity, %"
                  :validate="validatePercent"
                >
                  <template #field="scopeField">
                    <WInput
                      v-bind="scopeField"
                      type="number"
                    />
                  </template>
                </WUniform>
              </div>

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
                  />
                </template>
              </WUniform>
            </div>
          </WTabsItem>

          <WTabsItem
            title="Tasks"
            name="tasks"
          >
            <div class="py-2">
              <!--
                The task list is saved as a whole. On the page it is a form of its own, with Save and Cancel,
                so a half-typed task is not sent; elsewhere it is a part of the form it is in.
              -->
              <WUniform
                v-bind="{...scope, async: false}"
                field="tasks"
                :init-data="async ? copyTasks : undefined"
                :api-method="async ? (value => value as Task[]) : undefined"
                full-payload
                @success="scope.updateModelValueInner($event, ['tasks'] as const)"
              >
                <template #default="scopeTasks">
                  <WUniform
                    v-for="(item, key, index) in scopeTasks.modelValueList"
                    :key="key"
                    v-bind="scopeTasks"
                    :field="index"
                  >
                    <template #default="scopeTask">
                      <div class="grid grid-cols-[1fr_10rem_auto] items-end gap-2">
                        <WUniform
                          v-bind="scopeTask"
                          field="title"
                          title="Task"
                          required
                        >
                          <template #field="scopeField">
                            <WInput
                              v-bind="scopeField"
                              :hide-title="index !== 0"
                              required
                            />
                          </template>
                        </WUniform>

                        <WUniform
                          v-bind="scopeTask"
                          field="due"
                          title="Due"
                          required
                        >
                          <template #field="scopeField">
                            <WInputDate
                              v-bind="scopeField"
                              :hide-title="index !== 0"
                              required
                            />
                          </template>
                        </WUniform>

                        <WButton
                          :semantic-type="SemanticType.SECONDARY"
                          :disabled="scopeTasks.readonly || scopeTasks.submitting || scopeTasks.skeleton"
                          class="mb-4 w-(--w-input-height)"
                          @click="scopeTasks.unselect(item)"
                        >
                          <IconClose class="square-4" />
                        </WButton>
                      </div>
                    </template>
                  </WUniform>

                  <div class="flex flex-wrap gap-4">
                    <WButton
                      v-if="!scopeTasks.readonly"
                      :semantic-type="SemanticType.SECONDARY"
                      :disabled="scopeTasks.skeleton || scopeTasks.submitting"
                      @click="scopeTasks.select({title: '', due: getStartOfDay()})"
                    >
                      <IconAdd class="square-4" /> Add task
                    </WButton>

                    <template v-if="async && scopeTasks.hasChanges">
                      <WButton
                        :semantic-type="SemanticType.SECONDARY"
                        :disabled="scopeTasks.submitting"
                        class="ml-auto"
                        @click="scopeTasks.initModel()"
                      >
                        Cancel
                      </WButton>

                      <WButton
                        :loading="scopeTasks.submitting"
                        @click="scopeTasks.submit?.()"
                      >
                        Save tasks
                      </WButton>
                    </template>
                  </div>
                </template>
              </WUniform>
            </div>
          </WTabsItem>
        </WTabs>
      </template>
    </WUniform>

    <!-- Editing gets Cancel and Save on every tab. -->
    <template
      v-if="!async && !isCreate"
      #actions
    >
      <WButton
        :disabled="formRef?.submitting"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="$emit('close:modal')"
      >
        {{ formRef?.hasChanges ? 'Cancel' : 'Close' }}
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
import {computed, markRaw, useTemplateRef} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'
import {isId} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInfoCard from 'eco-vue-js/dist/components/InfoCard/WInfoCard.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WInputDate from 'eco-vue-js/dist/components/Input/WInputDate.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
import IconClose from 'eco-vue-js/dist/assets/icons/IconClose'

import {gardeners} from '../../shared/Gardener'
import OptionGardener from '../../shared/OptionGardener.vue'
import {type PlantPayload, plantModelApi} from '../plant-list/api/Plant'
import {Kind, Light, type Plant, type Task} from '../plant-list/models/Plant'
import {kindDisplay, lightDisplay} from '../plant-list/models/PlantDisplay'

/** What the form edits: the plant's own fields, with the caretaker by id, as the API takes it. */
type PlantFormData = Pick<Plant, 'name' | 'species' | 'kind' | 'height' | 'light' | 'water' | 'humidity' | 'tasks'> & {
  caretaker: number | undefined
}

const props = defineProps<{
  /** The plant to edit. Without it, the form creates a plant. */
  plantId?: number
  /** Saves each field as it changes, for editing on a page. */
  async?: boolean
  readonly?: boolean
}>()

defineEmits<{
  (e: 'saved', value: Plant): void
  (e: 'close:modal'): void
}>()

const formRef = useTemplateRef<ComponentInstance<typeof WUniform<PlantFormData, number, undefined, Plant, PlantFormData>>>('form')

const isCreate = computed(() => !props.async && !isId(props.plantId))

/** Builds the editable model from the loaded plant. It gets `{}` until the plant loads, and when creating. */
const getModel = (plant: Partial<Plant>): PlantFormData => ({
  name: plant.name ?? '',
  species: plant.species ?? '',
  kind: plant.kind ?? Kind.TROPICAL,
  height: plant.height ?? 10,
  light: plant.light ?? Light.BRIGHT,
  water: plant.water ?? 200,
  humidity: plant.humidity ?? 50,
  caretaker: plant.caretaker?.id,
  tasks: copyTasks(plant.tasks),
})

const copyTasks = (tasks: Task[] | undefined): Task[] => tasks?.map(task => ({...task})) ?? []

/** Creates the plant with the whole model, or updates it with the changed fields only. */
const save = (payload: Partial<PlantFormData>) => {
  return isId(props.plantId)
    ? plantModelApi.item.actions.update(props.plantId, payload as PlantPayload)
    : plantModelApi.list.actions.create(payload as PlantPayload)
}

const validatePositive = (value: unknown) => typeof value === 'number' && value < 0 ? 'Must not be negative' : undefined

const validatePercent = (value: unknown) => typeof value === 'number' && (value < 0 || value > 100) ? 'Must be from 0 to 100' : undefined
</script>
