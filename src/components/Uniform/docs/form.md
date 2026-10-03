---
group: Controls
order: 5
description: WUniform — forms built from nested WUniform fields, with validation, saving only the changed fields, auto-save, loading the model with a query, and readonly, disabled and skeleton states.
---

# Form

Forms are built from one component, `WUniform`, used at two levels:

- The **form** holds the model and saves it. Its default slot gives a scope for the fields.
- Each **field** is a nested `WUniform` that gets the form's scope with `v-bind="scope"` and a `field` key. Its `field` slot renders the control, which gets its value, title, error message and states with `v-bind="scopeField"`.

The kit's controls — WInput, WSelect, WCheckbox, WToggle, WButtonGroup and the others — take the field scope as it is.

## Submit

With `initData`, the form keeps its own copy of the model, built from the given or loaded value. `submit` from the scope, or from the form's template ref, validates the fields and calls `apiMethod`:

- If a field is invalid, nothing is sent: the errors show on the fields, a warning lists them, and the page scrolls to the first one. The list in the warning is a `WUniformErrorMessage`, which can also show a validation result elsewhere.
- Only the changed fields are sent. `fullPayload` sends the whole model.
- The result of `apiMethod` becomes the new initial model, so `hasChanges` resets, and is emitted with `success`.
- When `apiMethod` rejects with an `ApiError`, the field errors in its response show on the matching fields. Try `taken@example.com` below.

`validate` takes one function or a list, each returning an error message or `undefined`. Errors appear after a submit attempt — on each change with `async` — and clear as soon as the value is valid. `required` is checked first.

<!-- @example Uniform/Basic -->

<DocsDemo name="Uniform/Basic" />

```vue
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

  <p class="mt-4 text-sm text-description">
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
```

<!-- @example-end -->

A form in a modal usually has its buttons in the modal's `actions` slot, outside the scope. There, a template ref gives the same `submit` and `submitting` — see [Modal](/components/modal).

## Auto-save

`async` saves every change right away, one field at a time. The changed field shows a spinner while it is saved, and the rest of the form stays editable. `confimGetter` asks before a change is applied — the change is dropped on cancel.

Only the changed fields are validated and sent. An invalid one shows its error at once and keeps its value without being saved, and changes to other fields are still saved. The value is sent once it is fixed. A change made while a save is in progress is sent when that save ends. When `apiMethod` returns nothing, the sent values become the initial ones for their fields. Fields that weren't sent keep their unsaved changes. `fullPayload` sends the whole model instead and waits until every field is valid.

<!-- @example Uniform/Async -->

<DocsDemo name="Uniform/Async" />

```vue
<template>
  <WUniform
    :init-data="initData"
    :api-method="save"
    tag="div"
    class="grid max-w-md"
    async
  >
    <template #default="scope">
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
        </template>
      </WUniform>

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
        </template>
      </WUniform>
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

type Settings = {notifications: boolean, theme: string}

let stored: Settings = {notifications: true, theme: 'system'}

const initData = (): Settings => ({...stored})

// Stands in for an API call.
const save = (payload: Partial<Settings>) => new Promise<Settings>(resolve => {
  setTimeout(() => {
    stored = {...stored, ...payload}
    resolve(stored)
  }, 800)
})

const confirmDisable = (value: boolean): ConfirmProps | undefined => value ? undefined : {
  title: 'Turn off notifications?',
  description: 'You will stop getting emails about new comments.',
  acceptText: 'Turn off',
}
</script>
```

<!-- @example-end -->

## Loading the model

`useQueryFn` loads the model with a query when no `modelValue` is given, with `queryParams` for its params or `noParams` when it takes none. The fields show skeletons until it loads, and `initData` turns the loaded value into the editable model:

```vue
<WUniform
  :use-query-fn="settingsApi.use"
  :query-params="projectId"
  :init-data="getModel"
  :api-method="settingsApi.update"
>
  <template #default="scope">
    ...
  </template>
</WUniform>
```

## Nested objects

A nested `WUniform` with a default slot instead of a `field` slot edits an object inside the model. Its fields bind its own scope:

```vue
<WUniform
  v-bind="scope"
  field="address"
>
  <template #default="scopeAddress">
    <WUniform
      v-bind="scopeAddress"
      field="city"
      title="City"
    >
      <template #field="scopeField">
        <WInput v-bind="scopeField" />
      </template>
    </WUniform>
  </template>
</WUniform>
```

Changes, errors and `fullPayload` work per field as for top-level ones.

## Readonly, disabled and skeleton

`readonly`, `disabled` and `skeleton` set on the form reach every field with the scope. While a form without `async` is submitting, its fields are disabled.

<!-- @example Uniform/States -->

<DocsDemo name="Uniform/States" />

```vue
<template>
  <WButtonGroup
    v-model="state"
    :list="['editable', 'readonly', 'disabled', 'skeleton']"
    class="mb-6"
  >
    <template #option="{option}">
      {{ option }}
    </template>
  </WButtonGroup>

  <WUniform
    :init-data="initData"
    :readonly="state === 'readonly'"
    :disabled="state === 'disabled'"
    :skeleton="state === 'skeleton'"
    tag="div"
    class="grid max-w-md"
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="title"
        title="Title"
      >
        <template #field="scopeField">
          <WInput v-bind="scopeField" />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="priority"
        title="Priority"
      >
        <template #field="scopeField">
          <WButtonGroup
            v-bind="scopeField"
            :list="['low', 'medium', 'high']"
          >
            <template #option="{option}">
              {{ option }}
            </template>
          </WButtonGroup>
        </template>
      </WUniform>
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

const state = ref('editable')

const initData = () => ({title: 'Repot the monstera', priority: 'medium'})
</script>
```

<!-- @example-end -->

To set a state for a whole area — every form and control in a page, for a user without edit rights — provide it from a parent component instead. Controls use the provided value when their own prop is unset:

```ts
import {useProvideReadonly} from 'eco-vue-js/dist/utils/provide'

useProvideReadonly(computed(() => !canEdit.value))
```

`useProvideDisabled` and `useProvideSkeleton` work the same way.

## With tabs

Forms inside [WTabs](/components/tabs) report their `hasChanges`, `hasValue` and errors to their tab, which marks its button. The tabs switch to a tab that gets an error. `mandatory` counts a field in `hasValue` without making it required, and `initHasValue` and `initHasError` set these states while a tab's fields are not mounted.

## API

<!-- @api WUniform -->

### WUniform

```ts
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Key the form registers under with its parent form and with tabs. Generated when unset. |
| `modelValue` | `Model` | — | The model to edit. A field gets its parent's model with the scope and reads the value at `field`. |
| `modelValueInit` | `Model` | — | Initial model that `hasChanges` compares against, when the form has no copy of its own. |
| `field` | `Field` | — | Key in the parent's model that this form or field edits. |
| `initData` | `((value: InnerModel) => ResultModel)` | — | Builds the editable model from the given or loaded value. With it, the form keeps its own copy of the model instead of emitting `update:model-value`. |
| `apiMethod` | `((value: Partial<ResultModel>) => void \| InnerModel \| Promise<RequestResponse<InnerModel, RequestData>> \| Promise<InnerModel> \| undefined)` | — | Saves the model on submit. Gets only the changed fields unless `fullPayload`. The result becomes the new initial model and is emitted with `success`; the field errors of a rejected `ApiError` are shown on the fields. |
| `readonly` | `boolean` | — | Passed to the slots, and with the scope to every field of the form. |
| `disabled` | `boolean` | — | Passed to the slots, and with the scope to every field of the form. |
| `tag` | `string` | — | Element to wrap the content in. Renders no wrapper when unset. |
| `title` | `string` | — | Title of the field, passed to the `field` slot. Also names the field in validation messages. |
| `required` | `boolean` | — | The field must have a value. Checked before `validate` and passed to the `field` slot. |
| `mandatory` | `boolean` | — | Counts the field in the form's `hasValue`, which tabs show with `showHasValue`, without making it required. |
| `skeleton` | `boolean` | — | Passed to the slots, and with the scope to every field of the form. Set on its own while `useQueryFn` loads. |
| `async` | `boolean` | — | Saves every change right away. The changed field shows a spinner instead of the whole form being disabled. Only changed fields are checked and sent: an invalid one shows its error and waits until it is fixed, while the rest are saved. A change made while saving is sent once the save ends. |
| `validate` | `ValidateFn \| ValidateFn[]` | — | Functions returning an error message for an invalid value. Errors show after a submit attempt, or on each change with `async`, and clear as soon as the value is valid. |
| `submitting` | `boolean` | — | Submitting state of a parent form, received with the scope. |
| `noInit` | `boolean` | — | Keeps the current model after a successful submit instead of taking the result as the new initial model. |
| `fullPayload` | `boolean` | — | Submits the whole model instead of only the changed fields. On a field, sends its whole object when anything in it changed. |
| `initHasValue` | `boolean \| null` | — | Overrides the `hasValue` state reported to the parent, e.g. while the fields are not mounted. |
| `initHasError` | `boolean` | — | Overrides the error state reported to the parent, e.g. while the fields are not mounted. |
| `noChanges` | `boolean` | — | Never reports unsaved changes. |
| `confimGetter` | `((payload: ResultModel, data: Model) => ConfirmProps \| Promise<ConfirmProps \| undefined> \| undefined)` | — | Returns the props of a confirm modal to show before a change is applied. The change is dropped on cancel; returning nothing applies it at once. |
| `useQueryFn` | `UseQueryDefault<InnerModel, QueryParams> \| UseQueryDefault<InnerModel, undefined>` | — | Query that loads the model when `modelValue` is not given. The form shows skeletons until it loads. |
| `queryParams` | `QueryParams` | — | Params of `useQueryFn`. |
| `noParams` | `true` | — | `useQueryFn` takes no params. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(ResultModel, (string \| number)[])` | A changed value and the path of keys to it, from a form without its own copy of the model. |
| `success` | `(InnerModel)` | `apiMethod` resolved, with its result or, when it returned nothing, the submitted payload. |
| `unmounted` | `(string)` | The form was unmounted, with its `id`. |
| `init-model` | — | Asks the parent to take the current model as the initial one, from a form without its own copy of the model. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `field` | `UniformScopeField<ResultModel>` | Renders the control of a field. Spread the scope onto it with `v-bind`: it carries the model, title, error message and states. |
| `default` | `UniformScope<ResultModel, InnerModel>` | Renders the fields of a form. Spread the scope onto each nested WUniform with `v-bind`; it also has `submit`, `submitting` and `hasChanges`. |

<!-- @api-end -->

<!-- @api WUniformErrorMessage -->

### WUniformErrorMessage

```ts
import WUniformErrorMessage from 'eco-vue-js/dist/components/Uniform/WUniformErrorMessage.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string \| ValidateResponse` | **required** | Validation result of a form: a message, or the messages of its fields by title, nested for nested forms. |

<!-- @api-end -->
