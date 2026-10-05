---
group: Display
description: WImageViewer — an image URL as a thumbnail with its file name that opens the full image in a modal.
---

# Image viewer

`WImageViewer` shows an image URL as a thumbnail, under an optional `title`. Hovering it shows the file name, taken from the end of the URL, and a click opens the full image in a modal, which closes on Escape or a click outside. Without a `modelValue`, or with `skeleton`, it shows a placeholder of the same size.

The modal opens with the [modal manager](/components/modal), so the app needs its [global containers](/guide/getting-started#global-containers).

<!-- @example ImageViewer/Basic -->

<DocsDemo name="ImageViewer/Basic" />

```vue
<template>
  <div class="flex flex-wrap gap-6">
    <WImageViewer
      :model-value="monstera"
      title="Photo"
    />

    <WImageViewer
      :model-value="monstera"
      title="Loading"
      skeleton
    />
  </div>
</template>

<script lang="ts" setup>
import WImageViewer from 'eco-vue-js/dist/components/ImageViewer/WImageViewer.vue'

import monstera from './images/monstera.svg?url&no-inline'
</script>
```

<!-- @example-end -->

## API

<!-- @api WImageViewer -->

### WImageViewer

```ts
import WImageViewer from 'eco-vue-js/dist/components/ImageViewer/WImageViewer.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string` | — | URL of the image. Clicking the thumbnail opens it full size in a modal. Without it, a placeholder is shown. |
| `title` | `string` | — | Label above the thumbnail. |
| `skeleton` | `boolean` | — | Shows placeholders for the title and the thumbnail. |

<!-- @api-end -->
