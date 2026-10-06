---
group: Recipes
aside: false
description: One WUniform form component split into WTabs, used as a step-by-step wizard to create an item, as tabs in a modal to edit it, and on a page where every field saves on its own — with its title and buttons in WModalWrapper, which the frame it opens in places.
---

# Form in three modes

**Problem:** an item is created in a wizard, edited in a modal, and edited again on its own page, where each change saves at once. Three forms drift apart: a field added to one is missing from the others, and the validation differs.

**Pattern:** one form component holds the fields, split into tabs, and two props pick the mode:

| Mode | Props | What changes |
| --- | --- | --- |
| Create, in a modal | no `plantId` | The tabs become steps without tab buttons (`stepper`, `no-header`), bringing their own title, progress line and Back, Next and Add plant (`stepper-controls`). Next checks the step's fields. The whole model is sent once, at the end (`full-payload`). |
| Edit, in a modal | `plantId` | The tabs get their buttons. Only the changed fields are sent, on Save. |
| Edit, on a page | `plantId`, `async` | Every tab is shown under its title (`flat`). Each field saves when it changes. |

The pieces:

| Piece | What it is |
| --- | --- |
| A model | `createRestModelApi` with an item query that loads the plant, an `update` action on it, and a `create` action on the list. |
| The form | A `WUniform` that loads the model with `useQueryFn`, around a `WTabs`, inside a `WModalWrapper` that holds the title and the buttons when editing. |
| The modal | The form itself, opened with `Modal.add`. The modal's frame places the title and the buttons. |
| The page | The form with `async`. Outside an overlay, `WModalWrapper` lays it out in the flow of the page, without a title or buttons. |

<!-- @example recipes/plant-form/PlantEditor -->

<DocsDemo name="recipes/plant-form/PlantEditor" />

```vue
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

import {markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {isId} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'

import PlantForm from './PlantForm.vue'

import {plantModelApi} from '../plant-list/api/Plant'

const queryPlants = plantModelApi.list.use()

const plantId = ref<number | undefined>(1)

/** Opens the same form as a modal: it edits the plant, or walks through adding one when there is no id. A new plant opens on the page. */
const openModal = (id?: number) => {
  Modal.add(markRaw(PlantForm), {
    plantId: id,
    onSaved: (plant: Plant) => plantId.value = plant.id,
  })
}
</script>
```

<!-- @example-end -->

Pick a plant, change a field and leave it: it saves on its own. Open the same plant in the modal, change it there and save, and the page shows the change. In the tasks, add a row: the list is saved as a whole, with its own Save. Then try Add plant with the fields left empty. The data is in memory here, behind the same model API a real endpoint would use.

## The code

### Model

The form uses the plant model from [List with fields](/recipes/list-with-fields), with two more pieces:

- A `list` query with a `create` action. The action calls `set` to cache the new plant for its item query, and `invalidate` to refetch the lists it may now appear in.
- A payload type. The API takes the caretaker by id, as most APIs take a related item, so `update` and `create` accept `PlantPayload` rather than `Partial<Plant>`.

```ts
list: {
  scope: 'list',
  dataType: [] as Plant[],
  queryFn: () => apiClient.get<Plant[]>(PLANT_PATH).then(response => response.data),
  actions: {
    create: ({set, invalidate}, payload: PlantPayload) => apiClient
      .post<Plant>(PLANT_PATH, payload)
      .then(response => {
        set(response.data)
        invalidate()

        return response.data
      }),
  },
},
```

### The form

One `WUniform` holds the model in every mode:

- `useQueryFn` and `queryParams` load the plant. Without a `plantId` the params are `0`, which the item query's `isId` guard holds back, so nothing loads and the form starts blank.
- `initData` turns the loaded plant into the model the fields edit. It gets `{}` until the plant loads, and when creating, so read every key with a default. This is also where the API's shape and the form's differ: the plant has a caretaker object, the form edits its id.
- `apiMethod` creates the plant or updates it. `full-payload` is set only when creating, so a create sends every field and an update only the changed ones.
- `async` comes straight from the prop. Each field then saves on its own when it changes.

Inside it, one `WTabs` takes the layout from the mode: `stepper` and `no-header` when creating, `flat` on a page, plain tabs when editing in a modal. Every field is written once and shows up in all three.

A stepper checks the fields of a step before it moves on. Invalid ones show their errors, a warning lists them, and the step stays open, so required fields need nothing beyond `required`. A submit checks every step and opens the first one with an error.

The tasks are an array, edited as a nested form with one row per item: `modelValueList` gives each row a stable key, and `select` and `unselect` add and remove rows. On a page, saving each keystroke of a half-typed row would be wrong, so the task list is a form of its own there:

- `v-bind="{...scope, async: false}"` turns off saving on change, for this form only.
- `init-data` makes it keep its own copy of the tasks. Its `api-method` only returns the value, and `@success` writes it into the plant's model, which then saves the field as any other.
- In a modal or a wizard, both are left unset, and the tasks are a part of the plant's form.

What the form shows outside its fields comes from two places:

- Creating, the stepper brings it with `stepper-controls`: the step's title, a progress line under it, and Close or Back with Next or Add plant (`submit-text`). Add plant checks the last step and submits the `WUniform` around it.
- Editing, `WModalWrapper` holds the plant's name as the title, and Cancel and Save, built from the `WUniform`'s template ref.
- With `async`, on a page, there are neither: each field saves on its own.

The form does not know where it is shown. The frame it opens in — a modal, or a dropdown and a bottom sheet for a small form — takes the title and the buttons from `WModalWrapper` and places them, pads the fields, and scrolls them between. On a page there is no frame, and `WModalWrapper` lays everything out in place. The `WUniform` tells the frame it is saving, which keeps it open, and that it has unsaved changes, so a modal asks before closing.

<!-- @source docs/examples/recipes/plant-form/PlantForm.vue PlantForm.vue -->

```vue [PlantForm.vue]
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
```

<!-- @source-end -->

### Opening it

The form is the modal: `Modal.add(markRaw(PlantForm), {plantId, onSaved})`. `saved` passes the saved plant back to whoever opened it — here it opens the new plant on the page — and after a save in an overlay the form emits `close:modal`. Load it with `defineAsyncComponent` where it is only opened, so its code is fetched on first open.

The steps belong to the form, which also renders them as tabs and on a page, so the form keeps them in its own `WTabs` rather than in a modal's. With `stepper-controls` the stepper hands its title, progress and buttons to the frame only while it is one; as tabs and on a page it has none.

### The page

On a page, the form is all there is: `<PlantForm :plant-id="id" async />`. Everything shown on the page and in the modal comes from the same item query, so a save in one updates the other through the cache. A field changed but not yet saved keeps its value when another one is saved.

## Why it is built this way

- **One set of fields.** A field, its validation and its control are written once. The modes differ only in layout and in when the model is sent, and both come from props on `WTabs` and `WUniform`.
- **The frame places the form's parts.** The form renders its title and buttons once, in `WModalWrapper`, and does not know where it is shown. A modal, a dropdown, a bottom sheet and a page each put them where their layout needs, with their own padding.
- **The cache is the shared state.** The form loads the plant with the item query, and the model's actions write to it. Every open view of the plant stays current without passing data around.
- **The form edits its own shape.** `initData` turns the API's plant into what the controls need, and the payload is shaped back the way the API takes it.

## Variations

- **Pick a template first**: a first step with cards for common setups calls `scope.initModel(preset)` and then `next()`, so the next steps start from the preset.
- **Save in the middle of the wizard**: `requireSave` on a step submits the form before moving past it, e.g. when a later step needs the saved id. After that save, the form updates the item it created: build the id from `plantId` or the saved model's id, and pass `full-payload` only while neither exists.
- **Side tabs**: `side` on `WTabs` puts the tab buttons in a column, for a form with many tabs in a wide modal.
- **Read-only users**: pass `readonly` to the form, or provide it for the whole page with `useProvideReadonly`.
- **From the list**: a row menu item that opens `PlantForm` with the row's id edits the plant from [the list](/recipes/list-with-fields), and the list's row updates from the cache.
