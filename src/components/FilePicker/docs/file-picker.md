---
group: Controls
description: WFilePicker — a drop zone with a browse button for one or several files, with a placeholder for a file that is already saved.
---

# File picker

`WFilePicker` is a drop zone with a browse button. Dropped or picked files replace the model; each one shows with its name and a button to remove it. Without `multiple`, only the first dropped file is taken. `accept` limits what the browse dialog offers, but not what can be dropped — check the files before uploading them.

`placeholder` shows a file that is already saved, such as the current avatar, by its name, until another file is picked. Removing it emits `clear:placeholder`. The `positive` and `negative` slots replace the file's icon, e.g. with a preview of an image.

The drop zone lights up while a file is dragged anywhere over the page, once the app has called `preventDragFile()` at startup — which also stops the browser from opening a file dropped beside the zone. See [Helpers](/utilities/helpers#browser).

<!-- @example FilePicker/Basic -->

<DocsDemo name="FilePicker/Basic" />

```vue
<template>
  <div class="grid max-w-xl gap-4">
    <WFilePicker
      v-model="files"
      title="Attachments"
      accept="image/*,.pdf"
      multiple
    />

    <WFilePicker
      v-model="avatar"
      title="Avatar"
      :placeholder="current"
      accept="image/*"
      @update:model-value="current = undefined"
      @clear:placeholder="current = undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WFilePicker from 'eco-vue-js/dist/components/FilePicker/WFilePicker.vue'

const files = ref<File[]>([])

// The file that is already saved, shown until a new one is picked or it is removed.
const avatar = ref<File[]>([])
const current = ref<string | undefined>('avatar.png')
</script>
```

<!-- @example-end -->

## API

<!-- @api WFilePicker -->

### WFilePicker

```ts
import WFilePicker from 'eco-vue-js/dist/components/FilePicker/WFilePicker.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `File[]` | **required** | Picked files. |
| `placeholder` | `string` | — | Name of a file that is already saved, such as the current avatar, shown while no file is picked. Removing it emits `clear:placeholder`. |
| `multiple` | `boolean` | — | Lets several files be picked at once. |
| `accept` | `string` | — | File types the browse dialog offers, as in the input's `accept` attribute, e.g. `image/*,.pdf`. |
| `errorMessage` | `string` | — | Error shown under the drop zone. The files get a cross instead of a check. |
| `title` | `string` | — | Label above the drop zone. |
| `skeleton` | `boolean` | — | Shows a placeholder for the title and stops picking. When unset, inherits the skeleton state provided by a parent. |
| `readonly` | `boolean` | — | Stops picking. When unset, inherits the readonly state provided by a parent. |
| `disabled` | `boolean` | — | Stops picking. When unset, inherits the disabled state provided by a parent. |
| `required` | `boolean` | — | Marks the title with a red asterisk. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `clear:placeholder` | — | The `placeholder` file was removed. |
| `update:model-value` | `(value: File[])` | Files picked with the dialog or dropped, replacing the previous ones, or the files left after one is removed. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `positive` | `{ file?: File \| undefined; }` | Icon of a file, replacing the check. `file` is unset for the `placeholder`. |
| `negative` | `{ file?: File \| undefined; }` | Icon of a file while there is an error, replacing the cross. `file` is unset for the `placeholder`. |

<!-- @api-end -->
