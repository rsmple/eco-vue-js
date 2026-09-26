---
group: Overlays
description: Opening modals with Modal.add and Modal.addConfirm, building a modal body with WModalWrapper, and closing it with close:modal.
---

# Modal

Modals are not placed in templates. They are opened from code, rendered by the single `WModal` container mounted at the app root (see [Getting started](/guide/getting-started#global-containers)), and stacked when several are open.

## Confirm

`Modal.addConfirm` opens a ready-made dialog with a title, description and up to three actions. `onAccept` may return a promise — the accept button shows a spinner until it resolves, then the modal closes. If it rejects, the modal stays open.

<!-- @example Modal/Confirm -->

<DocsDemo name="Modal/Confirm" />

```vue
<template>
  <WButton
    :semantic-type="SemanticType.NEGATIVE"
    @click="confirmDelete"
  >
    Delete project
  </WButton>

  <p class="mt-2 text-sm text-gray-500">
    {{ status }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const status = ref('Nothing happened yet.')

const confirmDelete = () => {
  Modal.addConfirm({
    title: 'Delete project?',
    description: 'The project and its history are removed for everyone.',
    acceptText: 'Delete',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: () => {
      status.value = 'Deleted.'
    },
    onCancel: () => {
      status.value = 'Cancelled.'
    },
  })
}
</script>
```

<!-- @example-end -->

## Custom modal

`Modal.add(component, props)` opens any component. Wrap its content in `WModalWrapper`, which provides the title, a scrolling body and a sticky footer with the actions. Its padding comes from `--w-modal-wrapper-padding`, set once for the app (`w-modal-wrapper-p---inner-margin` on `body`); on phones the body is edge to edge, so pad the content with `sm-not:px---inner-margin`. Give the action buttons `w-full` to share the footer width. The modal closes when it emits `close:modal`, when the backdrop's close button is clicked, or when the function returned by `Modal.add` is called.

Pass callbacks as props to get results back. Load the modal with `defineAsyncComponent`, so its code is fetched on first open, and wrap it in `markRaw`, as for every component passed as a prop.

<!-- @example Modal/Custom -->

<DocsDemo name="Modal/Custom" />

```vue
<template>
  <WButton @click="rename">
    Rename “{{ name }}”
  </WButton>
</template>

<script lang="ts" setup>
import {defineAsyncComponent, markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

// Loaded on first open, so the modal's code stays out of the page bundle.
const RenameModal = defineAsyncComponent(() => import('./parts/RenameModal.vue'))

const name = ref('Roadmap')

const rename = () => {
  Modal.add(markRaw(RenameModal), {
    name: name.value,
    onSave: (value: string) => name.value = value,
  })
}
</script>
```

<!-- @example-end -->

<!-- @source src/components/Modal/docs/examples/parts/RenameModal.vue -->

```vue [RenameModal.vue]
<template>
  <WModalWrapper>
    <template #title>
      Rename
    </template>

    <WInput
      v-model="value"
      title="Name"
      autofocus
      class="sm-not:px---inner-margin"
    />

    <template #actions>
      <WButton
        outline
        class="w-full"
        @click="$emit('close:modal')"
      >
        Cancel
      </WButton>

      <WButton
        :disabled="!value"
        class="w-full"
        @click="save"
      >
        Save
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'

const props = defineProps<{
  name: string
  onSave: (name: string) => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const value = ref<string | undefined>(props.name)

const save = () => {
  if (!value.value) return

  props.onSave(value.value)
  emit('close:modal')
}
</script>
```

<!-- @source-end -->

If the modal body contains a form with unsaved changes, exposing it as `formRef` with a `hasChanges` flag makes the close button ask before discarding them.

## API

<!-- @api WModalWrapper -->

### WModalWrapper

```ts
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maximized` | `boolean` | — | — |
| `actionsCol` | `boolean` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | — |
| `subtitle` | — | — |
| `default` | — | — |
| `actions` | — | — |

<!-- @api-end -->
