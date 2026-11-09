---
group: Recipes
order: 1
description: One WUniform form component split into WTabs, used as a step-by-step wizard to create an item, as tabs in a modal to edit it, and on a page where every field saves on its own — with its title and buttons in WModalWrapper, which the frame it opens in places.
---

# Form in three modes

**Problem:** an item is created in a wizard, edited in a modal, and edited on its own page with instant saves. Three separate forms drift: fields go missing, validation differs.

**Pattern:** one form component with fields split into tabs; two props pick the mode:

| Mode | Props | What changes |
| --- | --- | --- |
| Create, in a modal | no `plantId` | Tabs become steps without buttons (`stepper`, `no-header`), with their own title, progress line and Back/Next/Add plant (`stepper-controls`). Next validates the step. The whole model is sent at the end (`full-payload`). |
| Edit, in a modal | `plantId` | Tabs get buttons. Changed fields are sent on Save. |
| Edit, on a page | `plantId`, `async` | All tabs shown under their titles (`flat`). Each field saves on change. |

The pieces:

| Piece | What it is |
| --- | --- |
| A model | `createRestModelApi` with an item query, an `update` action, and a `create` action on the list. |
| The form | A `WUniform` loading via `useQueryFn`, around a `WTabs`, inside a `WModalWrapper` holding the title and buttons. |
| The modal | The form itself, opened with `Modal.add`; the frame places title and buttons. |
| The page | The form with `async` in a `WSection`; outside an overlay, `WModalWrapper` lays out inline without title or buttons. |

<!-- @example recipes/plant-form/PlantEditor page -->

<DocsDemo name="recipes/plant-form/PlantEditor" page />

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

  <!-- The same form on the page, in a section of its own: each field saves as it changes. -->
  <WSection v-if="isId(plantId)">
    <PlantForm
      :plant-id="plantId"
      async
    />
  </WSection>
</template>

<script lang="ts" setup>
import type {Plant} from '../plant-list/models/Plant'

import {markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {isId} from 'eco-vue-js/dist/utils/utils'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
import WSection from 'eco-vue-js/dist/components/Surface/WSection.vue'

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

Pick a plant, change a field and leave it — it saves. Edit the same plant in the modal and the page updates. Task rows save as a whole with their own Save. Try Add plant with empty fields. Data is in memory, behind the same model API a real endpoint would use.

## The code

### Model

The plant model from [List with fields](/recipes/list-with-fields), plus:

- A `list` query with a `create` action that calls `set` to cache the new plant and `invalidate` to refetch lists.
- A payload type: the API takes the caretaker by id, so `update` and `create` accept `PlantPayload`, not `Partial<Plant>`.

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

- `useQueryFn` and `queryParams` load the plant. Without `plantId` the params are `0`, which `isId` rejects, so the form starts blank.
- `initData` maps the plant to the form model. It gets `{}` before loading and when creating, so default every key. It's also where shapes differ: the plant has a caretaker object, the form edits its id.
- `apiMethod` creates or updates. `full-payload` only when creating, so updates send changed fields only.
- `async` comes from the prop: each field saves on change.

One `WTabs` takes its layout from the mode: `stepper` + `no-header` when creating, `flat` on a page, plain tabs in a modal. Each field is written once.

A stepper validates a step before moving on: errors show, a warning lists them, the step stays. `required` is all a field needs. Submit validates every step and opens the first with an error.

Tasks are an array edited as a nested form: `modelValueList` gives each row a stable key, `select`/`unselect` add and remove rows. On a page, saving half-typed rows per keystroke would be wrong, so the task list is its own form there:

- `v-bind="{...scope, async: false}"` disables save-on-change for this form only.
- `init-data` keeps its own copy; `api-method` returns the value and `@success` writes it into the plant model, which saves it like any field.
- In a modal or wizard both are unset, and tasks are part of the plant form.

Title and buttons come from:

- Creating: the stepper's `stepper-controls` — step title, progress line, Close/Back and Next/Add plant (`submit-text`). Add plant validates the last step and submits.
- Editing: `WModalWrapper` — the plant name as title, and Cancel/Save from the `WUniform`'s template ref.
- With `async` on a page: neither.

The form doesn't know where it's shown. A frame (modal, or dropdown/bottom sheet for small forms) takes the title and buttons from `WModalWrapper`, pads the fields and scrolls between. On a page, `WModalWrapper` lays out in place. The `WUniform` tells the frame when it's saving (stay open) and has unsaved changes (confirm before close).

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
                      <div class="grid grid-cols-[1fr_10rem_auto] items-end gap-2 mb-4">
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
                              no-margin
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
                              no-margin
                            />
                          </template>
                        </WUniform>

                        <WButton
                          :semantic-type="SemanticType.SECONDARY"
                          :disabled="scopeTasks.readonly || scopeTasks.submitting || scopeTasks.skeleton"
                          class="w-(--w-input-height)"
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

The form is the modal: `Modal.add(markRaw(PlantForm), {plantId, onSaved})`. `saved` returns the plant to the opener (here, to open it on the page); after saving in an overlay the form emits `close:modal`. Use `defineAsyncComponent` so its code loads on first open.

Steps belong to the form's own `WTabs`, not the modal's, since the form also renders them as tabs and on a page. `stepper-controls` hands title, progress and buttons to the frame only in stepper mode.

### The page

On a page: `<WSection><PlantForm :plant-id="id" async /></WSection>`. Page and modal read the same item query, so a save in one updates the other. Unsaved field values survive another field's save.

## Why it is built this way

- **One set of fields.** Fields, validation and controls are written once; modes differ only in layout and send timing, both set by props on `WTabs` and `WUniform`.
- **The frame places the form's parts.** Title and buttons render once in `WModalWrapper`; each frame positions and pads them.
- **The cache is the shared state.** Every open view of the plant stays current without passing data.
- **The form edits its own shape.** `initData` maps API to form; the payload maps back.

## Variations

- **Pick a template first**: a first step with preset cards calls `scope.initModel(preset)` then `next()`.
- **Save mid-wizard**: `requireSave` on a step submits before moving on, e.g. when a later step needs the id. Afterwards the form updates the created item: build the id from `plantId` or the saved model's id, and pass `full-payload` only while neither exists.
- **Side tabs**: `side` on `WTabs` stacks the tab buttons in a column for wide modals.
- **Read-only users**: pass `readonly`, or provide it page-wide with `useProvideReadonly`.
- **From the list**: a row menu item opening `PlantForm` with the row's id; the row updates from the cache.
