---
group: Overlays
description: Opening modals with Modal.add and Modal.addConfirm, or useOverlay from a component — which also opens any component in a dropdown — anchoring a confirm to the element it is about, building a modal body with WModalWrapper, steps with WModalStepper, and closing it with close:modal.
---

# Modal

Modals are not placed in templates. They are opened from code, rendered by the single `WModal` container mounted at the app root (see [Getting started](/guide/getting-started#global-containers)), and stacked when several are open. The same container renders the menus of WButtonMore, so a confirm can take a menu's place.

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
    Delete bed
  </WButton>

  <p class="mt-2 text-sm text-description">
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
    title: 'Delete bed?',
    description: 'The bed and its planting history are removed for everyone.',
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

## Anchored confirm

A modal covers the page, so the user loses sight of the row or selection they are confirming for. Pass `anchor` and the same confirm opens as a dropdown under that element instead — a bottom sheet without the backdrop on phones. Use it for short yes-or-no questions; keep the modal for long descriptions and forms.

Open it with `useOverlay()`, called in setup, whose `add`, `addAutoclosable` and `addConfirm` work like `Modal` for the overlay the component is in:

- Opened from a menu — WButtonMore, or the More menu of a list's selection bar — the confirm takes the menu's place at the menu's anchor, without `anchor`: the `⋯` button, or the point where a row was right-clicked. The row stays highlighted until the confirm closes.
- Opened from a modal, it closes together with the modal, and a click beside the modal closes the confirm first.

- A click outside, Escape or a swipe down closes it and calls `onCancel`. Opening it again from the same anchor closes it too.
- While the `onAccept` promise is pending, clicks on the page are blocked, so the selection or filters it was confirmed for cannot change under it.
- When the anchor is no longer on the page, `addConfirm` opens the modal instead.

<!-- @example Modal/ConfirmAnchored -->

<DocsDemo name="Modal/ConfirmAnchored" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-2">
    <WButton
      :semantic-type="SemanticType.NEGATIVE"
      @click="confirmClear"
    >
      Clear bed
    </WButton>

    <WButtonMore>
      <WMenuClearBed @status="status = $event" />
    </WButtonMore>
  </div>

  <p class="mt-2 text-sm text-description">
    {{ status }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'

import WMenuClearBed from './parts/WMenuClearBed.vue'

const status = ref('Nothing happened yet.')

const overlay = useOverlay()

const confirmClear = (event: Event) => {
  overlay.addConfirm({
    title: 'Clear the bed?',
    description: 'Every plant in it is moved to the compost.',
    acceptText: 'Clear',
    acceptSemanticType: SemanticType.NEGATIVE,
    // The clicked button.
    anchor: event.currentTarget as Element,
    // The page is held still while the promise is pending.
    onAccept: () => new Promise<void>(resolve => setTimeout(resolve, 1000)).then(() => {
      status.value = 'Cleared.'
    }),
    onCancel: () => {
      status.value = 'Cancelled.'
    },
  })
}
</script>
```

<!-- @example-end -->

<!-- @source src/components/Modal/docs/examples/parts/WMenuClearBed.vue -->

```vue [WMenuClearBed.vue]
<template>
  <WButtonMoreItem
    text="Clear bed"
    :icon="markRaw(IconTrash)"
    :semantic-type="SemanticType.NEGATIVE"
    @click="confirmClear"
  />
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

const emit = defineEmits<{
  (e: 'status', value: string): void
}>()

// Opened from a menu, the confirm takes its place at the menu's anchor — the `⋯` button, or the point a row was right-clicked.
const overlay = useOverlay()

const confirmClear = () => {
  overlay.addConfirm({
    title: 'Clear the bed?',
    description: 'Every plant in it is moved to the compost.',
    acceptText: 'Clear',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: () => emit('status', 'Cleared from the menu.'),
    onCancel: () => emit('status', 'Cancelled.'),
  })
}
</script>
```

<!-- @source-end -->

## Dropdown or modal

`useOverlay()`, called in setup, opens any component and lets WModal frame it. Say how with `present`:

- `modal` — centered over the backdrop, stacked over other modals. The component brings its own frame, such as `WModalWrapper`.
- `dropdown` — at `anchor`, one at a time, and a bottom sheet on phones. It is centered on the anchor with a tip pointing at it, and near the edge of the screen the box shifts aside while the tip stays. `dropdown` options open it at a point instead (`cornered`) or aligned to the anchor without the tip (`align`, such as `HorizontalAlign.FILL` for a field's menu), set its box (`frameClass`), and whether a click inside closes it (`closeOnClick`). A layer opened from a dropdown with `closeOnClick` takes its place, as from a menu. Opened from any other dropdown, it stays over it — like a select's menu inside a filter, which closes first on Escape.

`open` returns a function that closes the layer, or `null` if nothing opened. The component closes the layer by emitting `close:modal`. Inside it:

- It sees the opener's injections, and its own `useOverlay()` opens what belongs to the same layer.
- `useOverlayFrame()` tells whether it is shown in a `modal`, a `dropdown` or a `sheet`, to adjust its layout.
- `useOverlayClose()` closes the layer it is in, as emitting `close:modal` does — for content deeper than the root, such as a step's own Cancel button.
- `useLayerBusy(() => loading.value)` keeps the layer open on Escape, outside clicks, swipes and a removed anchor while something runs.

A dropdown closes when the opener unmounts, unless it took a menu's place; a modal stays.

The frame owns the layout around the content. A component built on `WModalWrapper` opens as a modal, a dropdown or a bottom sheet unchanged: the frame takes its `title`, `subtitle` and `actions` and places them — a sticky header and footer in a modal, a compact heading and pinned buttons in a dropdown, a centered title and stacked buttons in a sheet — and pads the body by `--w-frame-padding`. The content brings no padding of its own; what reaches the edges, such as a list, takes `w-frame-bleed`. Outside an overlay, `WModalWrapper` lays the same parts out on the page. Content without it, such as a menu, is shown edge to edge; `useOverlayFrameOptions(() => ({padded: true}))` asks for the padding.

A `WUniform` with `api-method` keeps its layer open while it saves, and in a modal asks before the close button discards unsaved changes. A dropdown is dismissed without asking, as a menu is — keep forms in it small enough to fill again. `useLayerBusy` and `useLayerChanges` do the same for other content.

```ts
import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'

const overlay = useOverlay()

const openNotes = (event: MouseEvent) => {
  overlay.open({
    present: 'dropdown',
    anchor: event.currentTarget as Element,
    content: markRaw(WPlantNotes),
    props: {plantId: 42},
  })
}
```

## Custom modal

`Modal.add(component, props)` opens any component. Wrap its content in `WModalWrapper`, which provides the title, a scrolling body and a sticky footer with the actions. Its padding comes from `--w-modal-wrapper-padding`, set once for the app (`w-modal-wrapper-p---inner-margin` on `body`), and the frame pads the title, the body and the actions with it — the content brings no padding of its own. Content that reaches the edges, such as a list, takes `w-frame-bleed`; WTabs and WInfoCard do it on their own. Give the action buttons `w-full` to share the footer width. The modal closes when it emits `close:modal`, when the backdrop's close button is clicked, or when the function returned by `Modal.add` is called.

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

const name = ref('Herb bed')

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

## Steps

`WModalStepper` is a `WModalWrapper` with steps: its default slot takes `WTabsItem` items, one per step. The title is the current step's title, with a progress line under it, and the footer has Close or Back and Next or Submit. `validate` on an item runs before Next leaves it, and so do the Uniform fields inside the step — an error message is shown and the step stays open — and `requireSave` submits the form inside first. The last step's button emits `submit`; `submitText` names it. `loading` shows its spinner while the submit runs, and `disabledNext` disables it, e.g. until something is picked. A template ref gives `next()` and `previous()`, to move on after a pick.

<!-- @example Modal/Stepper -->

<DocsDemo name="Modal/Stepper" />

```vue
<template>
  <div class="flex flex-wrap items-center gap-4">
    <WButton @click="invite">
      Invite a member
    </WButton>

    <span
      v-if="invited"
      class="text-description"
    >
      Invited {{ invited }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import {defineAsyncComponent, markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const InviteModal = defineAsyncComponent(() => import('./parts/InviteModal.vue'))

const invited = ref<string>()

const invite = () => {
  Modal.add(markRaw(InviteModal), {
    onInvite: (email: string, role: string) => invited.value = `${ email } as ${ role }`,
  })
}
</script>
```

<!-- @example-end -->

<!-- @source src/components/Modal/docs/examples/parts/InviteModal.vue -->

```vue [InviteModal.vue]
<template>
  <WModalStepper
    :loading="sending"
    submit-text="Send invite"
    class="w-modal-wrapper-w-160"
    @close:modal="$emit('close:modal')"
    @submit="send"
    @update:has-changes="$emit('update:has-changes', $event)"
  >
    <WTabsItem
      title="Who to invite"
      name="email"
      :validate="() => email ? undefined : 'Enter an email to invite'"
    >
      <WInput
        v-model="email"
        title="Email"
        type="email"
        autofocus
        class="pt-4"
      />
    </WTabsItem>

    <WTabsItem
      title="Role"
      name="role"
    >
      <WButtonGroup
        v-model="role"
        :list="ROLES"
        title="Role"
        class="pt-4"
      >
        <template #option="{option}">
          {{ option }}
        </template>
      </WButtonGroup>
    </WTabsItem>

    <WTabsItem
      title="Check and send"
      name="summary"
    >
      <p class="pt-4">
        {{ email }} will join as {{ role }}.
      </p>
    </WTabsItem>
  </WModalStepper>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalStepper from 'eco-vue-js/dist/components/Modal/WModalStepper.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

const ROLES = ['Viewer', 'Editor', 'Admin']

const props = defineProps<{
  onInvite: (email: string, role: string) => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
  (e: 'update:has-changes', value: boolean): void
}>()

const email = ref<string>()
const role = ref('Viewer')
const sending = ref(false)

const send = () => {
  sending.value = true

  setTimeout(() => {
    props.onInvite(email.value!, role.value)
    emit('close:modal')
  }, 800)
}
</script>
```

<!-- @source-end -->

## Export and import

`WModalExport` and `WModalImport` are the modals behind the list's export and import. `WModalExport` loads every item of a query page by page — or with `apiMethod` in one request — with a progress bar, builds a JSON, CSV or Markdown file and offers it for download. `WModalImport` creates a list of items with `createMethod`, all at once, with a progress bar and a button that aborts the requests still running. Open them with `Modal.add` like any modal.

## API

<!-- @api WModalWrapper -->

### WModalWrapper

```ts
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maximized` | `boolean` | — | Fills the whole screen on small screens instead of floating with a margin. |
| `actionsCol` | `boolean` | — | Stacks the `actions` buttons vertically on every screen size, not only on small ones. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Heading of the dialog, also used as its accessible name. Stays pinned at the top while the content scrolls. |
| `subtitle` | — | Content under the heading, pinned with it. |
| `default` | — | Body of the modal. |
| `actions` | — | Buttons pinned at the bottom. |

<!-- @api-end -->

<!-- @api WModal -->

### WModal

```ts
import WModal from 'eco-vue-js/dist/components/Modal/WModal.vue'
```

#### Props

_No props._

<!-- @api-end -->

<!-- @api WModalStepper -->

### WModalStepper

```ts
import WModalStepper from 'eco-vue-js/dist/components/Modal/WModalStepper.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | — | Shows a spinner in the Next or Submit button and disables Back and Close, e.g. while the form submits. |
| `disabled` | `boolean` | — | Disables all the buttons. |
| `disabledNext` | `boolean` | — | Disables the Next or Submit button, e.g. until something is picked on the step. |
| `submitText` | `string` | — | Text of the submit button on the last step. Defaults to "Submit". |
| `disableMinHeight` | `boolean` | — | Lets the modal shrink to the current step's height. By default it keeps the height of the tallest step shown so far. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close:modal` | — | Close was clicked on the first step. |
| `submit` | — | Submit was clicked on the last step. |
| `update:has-changes` | `(value: boolean)` | Whether a form inside has unsaved changes, for the modal to ask before closing. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | The steps, as WTabsItem items. Their `validate`, `hasValue` and `requireSave` work as in a stepper WTabs. |
| `title` | — | Replaces the title, which is the current step's title by default. |

<!-- @api-end -->

<!-- @api WModalExport -->

### WModalExport

```ts
import WModalExport from 'eco-vue-js/dist/components/Modal/WModalExport.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `format` | `"json" \| "csv" \| "md"` | **required** | Format of the file: the items as JSON, rows of CSV, or Markdown sections. |
| `fileName` | `string` | — | Start of the file name, before the date. |
| `title` | `string \| ((count: number) => string)` | — | Title of the modal, or a function of the number of items. Defaults to one that names the format. |
| `cancelText` | `string` | — | Text of the close button. Defaults to "Close". |
| `downloadText` | `string` | — | Text of the download button. Defaults to "Download". |
| `useQueryFn` | `UseQueryDefault<PaginatedResponse<Model>, QueryParams> \| UseQueryDefault<Model[], QueryParams>` | — | Query the items are loaded with, page by page when it is paginated. |
| `initQueryParams` | `QueryParams` | **required** | Params of the query or `apiMethod`, such as the list's filters. |
| `apiMethod` | `((queryParams: QueryParams) => Promise<Model[]>)` | — | Loads all the items in one request, instead of `useQueryFn`. |
| `header` | `string[]` | — | Header row of the CSV. |
| `prepare` | `((item: Model, index: number) => string[][] \| Promise<string[][]>)` | — | Rows of the CSV for an item. Needed for `csv`. |
| `toMarkdown` | `((item: Model, index: number) => string)` | — | Markdown of an item. Needed for `md`. |
| `resolve` | `(() => void)` | — | Called once the file is downloaded. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close:modal` | — | The file was downloaded, or the modal was closed. |

<!-- @api-end -->

<!-- @api WModalImport -->

### WModalImport

```ts
import WModalImport from 'eco-vue-js/dist/components/Modal/WModalImport.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `createMethod` | `(item: Item, config: RequestConfig<RequestData>) => Promise<RequestResponse<unknown, RequestData>>` | **required** | Creates one item. All items are sent at once; `config.signal` aborts a request. |
| `items` | `Item[]` | **required** | Items to create. |
| `title` | `string` | — | Title of the modal. Defaults to "Importing N items". |
| `successText` | `string` | — | Text of the button once every item is sent. Defaults to "Done". |
| `abortText` | `string` | — | Text of the button while items are being sent. Defaults to "Abort upload". |
| `resolve` | `(() => void)` | — | Called when every item is sent, or when the modal is closed after that. |
| `reject` | `((length: number) => void)` | — | Called with the number of aborted requests when the upload is aborted. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `close:modal` | — | Every item was sent, or the button was clicked. |

<!-- @api-end -->
