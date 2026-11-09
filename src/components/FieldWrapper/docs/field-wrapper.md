---
group: Controls
description: WFieldWrapper — the frame every control is built on, with title, description, messages, changes marker and states, used on its own for read-only values and for controls of your own.
---

# Field wrapper

`WFieldWrapper` is the frame under every control: title (with `required` and `titleIcon`), `description`, error message, unsaved-changes dot (`hasChanges`), length counter (`maxLength`) and tooltip, with inherited skeleton, disabled and readonly states.

On its own it shows a read-only value, like a record detail. `modelValue` is formatted (thousands separators, `null` as "N / A"), or the default slot replaces it (e.g. with a chip). `allowCopy` adds a copy button, `mono` a monospace font.

The `field` slot replaces the field, giving your own control (here a slider) the kit's title and messages. It gets an `id` for labelling and `setFocused` for the counter.

<!-- @example FieldWrapper/Basic -->

<DocsDemo name="FieldWrapper/Basic" />

```vue
<template>
  <div class="grid gap-8 md:grid-cols-2">
    <div>
      <WFieldWrapper
        title="Sensor"
        model-value="greenhouse-2/moisture-07"
        mono
        allow-copy
      />

      <WFieldWrapper
        title="Seeds sown"
        :model-value="12840"
        description="Across all beds."
      />

      <WFieldWrapper
        title="Caretaker"
        :model-value="null"
      />
    </div>

    <div>
      <WFieldWrapper
        title="Moisture threshold"
        :has-changes="threshold !== 7"
        description="The sprinklers start below it."
        required
      >
        <template #field>
          <WSlider
            v-model="threshold"
            :min="1"
            :max="10"
          >
            <template #right>
              <span class="w-6 text-right font-semibold">{{ threshold }}</span>
            </template>
          </WSlider>
        </template>
      </WFieldWrapper>

      <WFieldWrapper title="Status">
        <WChip
          text="Thriving"
          :semantic-type="SemanticType.POSITIVE"
        />
      </WFieldWrapper>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WFieldWrapper from 'eco-vue-js/dist/components/FieldWrapper/WFieldWrapper.vue'
import WSlider from 'eco-vue-js/dist/components/Slider/WSlider.vue'

const threshold = ref(7)
</script>
```

<!-- @example-end -->

## Layout

- `subgrid` places title and field on the parent grid's columns so titles align; the parent needs those columns.
- `seamless` hides the title and frame until hover or focus, for in-place editing (e.g. table cells). `embedded` fits inside another component, without title or margin.
- `filterField` adds a title button toggling the value as a query param — e.g. from a plant's bed to that bed's plant list.
- `noMargin` drops the bottom space, `topText` moves messages above, `leftError` left-aligns the error.

## API

<!-- @api WFieldWrapper -->

### WFieldWrapper

```ts
import WFieldWrapper from 'eco-vue-js/dist/components/FieldWrapper/WFieldWrapper.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| boolean \| null` | — | Value shown in the field — numbers with thousands separators and `null` as "N / A". Also what `allowCopy` copies. |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `maxLength` | `number` | — | Shows a `length / maxLength` counter under the field while it is focused. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
| `readonly` | `boolean` | — | Shows the value without allowing changes. When unset, inherits the readonly state provided by a parent. |
| `required` | `boolean` | — | Adds an asterisk to the title. |
| `noMargin` | `boolean` | — | Drops the default bottom margin. |
| `allowCopy` | `boolean` | — | Adds a button that copies the value. |
| `leftError` | `boolean` | — | Aligns the error message to the left instead of the right. |
| `filterField` | `string` | — | Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. |
| `filterValue` | `unknown` | — | Value the filter button puts in the query. Defaults to `modelValue`. |
| `subgrid` | `boolean` | — | Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. |
| `seamless` | `boolean` | — | Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. |
| `topText` | `boolean` | — | Moves the counter and messages above the field instead of below it. |
| `allowDropFile` | `boolean` | — | Accepts files dropped onto the field. |
| `hideTitle` | `boolean` | — | Hides the title while keeping the rest of the layout. |
| `embedded` | `boolean` | — | For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. |
| `noLabelFor` | `boolean` | — | Renders the title without `for`, for a field that is not a form control, such as a contenteditable — clicking the title still focuses the field. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The field was clicked. |
| `drop` | `(value: DataTransferItemList)` | Items were dropped onto the field, with `allowDropFile`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | — | Content to the right of the field. |
| `bottom` | — | Content between the field and the description. |
| `field` | `{ id: string; focused: boolean; setFocused: (value: boolean) => void; isDragover: boolean; }` | The whole field, replacing the value row — for a control of your own. `id` labels it, and `setFocused` shows the length counter while it is focused. |
| `default` | `{ id: string; focused: boolean; setFocused: (value: boolean) => void; isDragover: boolean; }` | Content of the value row, replacing the formatted `modelValue`. The copy button stays after it. |

<!-- @api-end -->
