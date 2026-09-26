---
group: Overlays
description: Showing success, warning and error notifications with Notify.success, Notify.warn and Notify.error — title, caption, the user's input and a link, merged when repeated.
---

# Notify

Notifications are shown from code, from anywhere — setup, a store, a query's error handler. `Notify.success`, `Notify.warn` and `Notify.error` add one to the `WNotify` container mounted once at the app root (see [Getting started](/guide/getting-started#global-containers)); before it is mounted, the calls do nothing.

<!-- @example Notify/Basic -->

<DocsDemo name="Notify/Basic" />

```vue
<template>
  <div class="flex flex-wrap gap-4">
    <WButton
      :semantic-type="SemanticType.POSITIVE"
      @click="Notify.success({title: 'Project saved'})"
    >
      Success
    </WButton>

    <WButton
      :semantic-type="SemanticType.WARNING"
      @click="Notify.warn({title: 'Form contains invalid values', caption: 'Name is required.'})"
    >
      Warning
    </WButton>

    <WButton
      :semantic-type="SemanticType.NEGATIVE"
      @click="Notify.error({title: 'Upload failed', caption: 'The file is larger than 10 MB.', userInput: 'annual-report-final-v2.pdf'})"
    >
      Error
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
</script>
```

<!-- @example-end -->

Each call takes:

| Field | What it is |
| --- | --- |
| `title` | The message, as a string or a VNode. |
| `caption` | A second line with details. |
| `userInput` | What the user typed or picked, shown after the caption and broken anywhere to fit — a file name, a search term. |
| `to` | A route; the notification links to it, titled with the route's `meta.title`. |

A notification closes after 5 seconds. The same notification shown again while one is on screen doesn't stack: the one on screen stays, gets a counter, and its 5 seconds start over. Clicking the same failing button five times shows one error with a 5 on it.

The kit shows notifications itself in a few places: copying and pasting, invalid form values when leaving a tab or submitting a form, a `validate` error in `WToggle`, and failed requests made through its API helpers.
