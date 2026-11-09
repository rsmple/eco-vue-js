---
group: Overlays
description: Opening modals with Modal.add and Modal.addConfirm, or useOverlay from a component — which also opens any component in a dropdown — anchoring a confirm to the element it is about, building a modal body with WModalWrapper, steps with a stepper WTabs, and closing it with close:modal.
---

# Modal

Modals are opened from code, not templates. The single `WModal` container at the app root (see [Getting started](/guide/getting-started#global-containers)) renders and stacks them, along with WButtonMore's menus — so a confirm can replace a menu.

## Confirm

`Modal.addConfirm` opens a dialog with a title, description and up to three actions. If `onAccept` returns a promise, the button spins until it resolves and the modal closes; on reject it stays open.

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

A modal hides the row or selection being confirmed. Pass `anchor` to open the confirm as a dropdown under that element instead (a backdrop-less bottom sheet on phones). Use it for short yes/no questions; keep modals for long text and forms.

Open it with `useOverlay()` (called in setup); its `add`, `addAutoclosable` and `addConfirm` work like `Modal` for the component's overlay:

- From a menu (WButtonMore, or a selection bar's More), the confirm replaces the menu at its anchor without `anchor` — the `⋯` button or the right-click point. The row stays highlighted until it closes.
- From a modal, it closes with the modal; a click beside the modal closes the confirm first.

- Click outside, Escape or swipe down closes it and calls `onCancel`; so does reopening from the same anchor.
- While `onAccept` is pending, page clicks are blocked so the confirmed selection can't change.
- If the anchor is gone, `addConfirm` opens a modal instead.

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

`useOverlay()` (in setup) opens any component framed by WModal. `present` picks how:

- `modal` — centered over the backdrop, stacked. The component brings its own frame, e.g. `WModalWrapper`.
- `dropdown` — at `anchor`, one at a time, a bottom sheet on phones. Centered on the anchor with a tip; near screen edges the box shifts while the tip stays. Options: `cornered` (open at a point), `align` (align without tip, e.g. `HorizontalAlign.FILL` for a field menu), `frameClass`, `closeOnClick`. A layer opened from a `closeOnClick` dropdown replaces it, like from a menu; from any other dropdown it stacks on top (Escape closes the top first).

`open` returns a close function, or `null` if nothing opened. The component closes itself by emitting `close:modal`. Inside it:

- It sees the opener's injections; its own `useOverlay()` opens into the same layer.
- `useOverlayFrame()` returns `modal`, `dropdown` or `sheet`, for layout tweaks.
- `useOverlayClose()` closes the layer from nested content, e.g. a step's Cancel.
- `useLayerBusy(() => loading.value)` keeps the layer open against Escape, outside clicks, swipes and a removed anchor.

Dropdowns close when the opener unmounts (unless they replaced a menu); modals stay.

The frame owns the layout. A `WModalWrapper` component opens unchanged as modal, dropdown or sheet: the frame places its `title`, `subtitle` and `actions` (sticky header/footer in a modal, compact heading and pinned buttons in a dropdown, centered title and stacked buttons in a sheet) and pads the body by `--w-frame-padding`. Content brings no padding; edge-to-edge parts like lists take `w-frame-bleed`. Outside an overlay, `WModalWrapper` lays out on the page. Content without it (e.g. a menu) is edge to edge; `useOverlayFrameOptions(() => ({padded: true}))` requests padding.

A `WUniform` with `api-method` keeps its layer open while saving and, in a modal, confirms before discarding unsaved changes. Dropdowns dismiss without asking, like menus — keep their forms small. `useLayerBusy` and `useLayerChanges` do the same for other content.

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

`Modal.add(component, props)` opens any component. Wrap its content in `WModalWrapper` for a title, scrolling body and sticky action footer. Padding comes from `--w-modal-wrapper-padding`, set once for the app (`w-modal-wrapper-p---inner-margin` on `body`); content brings none. Edge-to-edge content takes `w-frame-bleed` (WTabs and WInfoCard do it themselves). Give action buttons `w-full` to share the footer. The modal closes on `close:modal`, the backdrop's close button, or the function `Modal.add` returns.

Pass callbacks as props to get results. Load the modal with `defineAsyncComponent` and wrap it in `markRaw`, as with any component prop.

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

Expose the body's form as `formRef` with a `hasChanges` flag, and the close button asks before discarding.

## Steps

A stepper `WTabs` with `stepper-controls` inside a `WModalWrapper` is a wizard, one `WTabsItem` per step. It gives the modal the step title, a progress line and buttons: Close (Cancel once changed) or Back, and Next or submit. Before Next, the item's `validate` and the step's Uniform fields run (errors keep the step open), and `requireSave` submits the inner form first. The last button submits the surrounding `api-method` form or emits `submit`; `submitText` labels it. `submitting` shows a spinner during `submit`; `disabledNext` disables it. The template ref exposes `next()` and `previous()`. Button texts come from `setTexts`.

`WModalStepper` is deprecated — the same wizard with its own buttons, without Cancel or form submit. Migrate to `WModalWrapper` around `WTabs stepper no-header stepper-controls`:

| WModalStepper | Instead |
| --- | --- |
| `loading` | `submitting` on WTabs, or nothing inside a form with `api-method` |
| `disabledNext`, `submitText`, `disableMinHeight` | the same props on WTabs |
| `disabled` | `submitting`, or `disabled` on the items |
| `@submit` | `@submit` on WTabs, or the form's `api-method` |
| `@close:modal` on the first step | not needed: Close closes the modal |
| `#title` | `#title` on WModalWrapper, above the step title |
| `next()`, `previous()` | the same methods of WTabs |

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
  <!-- The stepper brings the title, the progress and the buttons; the wrapper hands them to the modal. -->
  <WModalWrapper
    maximized
    class="w-modal-wrapper-w-160"
  >
    <WTabs
      :submitting="sending"
      submit-text="Send invite"
      stepper
      no-header
      stepper-controls
      @submit="send"
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
    </WTabs>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
import WTabs from 'eco-vue-js/dist/components/Tabs/WTabs.vue'
import WTabsItem from 'eco-vue-js/dist/components/Tabs/WTabsItem.vue'

const ROLES = ['Viewer', 'Editor', 'Admin']

const props = defineProps<{
  onInvite: (email: string, role: string) => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
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

`WModalExport` and `WModalImport` back the list's export and import. `WModalExport` loads every item page by page (or in one `apiMethod` request) with a progress bar and downloads JSON, CSV or Markdown. `WModalImport` creates items with `createMethod` in parallel, with a progress bar and an abort button. Open them with `Modal.add`.

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
