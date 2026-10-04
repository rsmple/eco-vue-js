---
group: Controls
order: 2
description: WSelectSingle, WSelect and their async variants — searchable selects over a static list or a paginated query, with a custom option template.
---

# Select

Selects pick values out of a list of objects. The model holds only the values — ids, codes — and the select finds the objects behind them to display.

| Component | Model | Options come from |
| --- | --- | --- |
| `WSelectSingle` | one value or `null` | `options` array, or a `useQueryFnOptions` query returning an array |
| `WSelect` | array of values | same as above |
| `WSelectAsyncSingle` | one value or `null` | a paginated query, searched and paged on the server |
| `WSelectAsync` | array of values | same as above |

Every select needs:

- `valueGetter` — picks the model value out of an option.
- An `option` slot or an `optionComponent` to render an option. There is no default label; the slot receives `option`, `selected` and `model` (`true` when rendering the chosen value in the field rather than in the dropdown). Put a `w-option` class on the option's root, so it takes the height and rounding of a line in the field; add `w-option-has-bg` when the option has a background of its own, like a tag, so the background covers the field's left padding instead of sitting inside it. Such options are best made an `optionComponent`, which can hold the unselect button inside the background — see [Multiple](#multiple).
- `searchFn` for the static selects — the async ones send the search text to the query instead.

## Single

<!-- @example Select/Single -->

<DocsDemo name="Select/Single" />

```vue
<template>
  <WSelectSingle
    v-model="soil"
    :options="soils"
    :value-getter="item => item.code"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Soil"
    placeholder="Pick a soil"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  >
    <template #option="{option}">
      <div class="w-option flex items-center">
        {{ option?.name }}
      </div>
    </template>
  </WSelectSingle>

  <p class="text-sm text-description">
    Model: {{ soil ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

const soils = [
  {id: 1, code: 'loam', name: 'Loam'},
  {id: 2, code: 'sand', name: 'Sandy'},
  {id: 3, code: 'clay', name: 'Clay'},
  {id: 4, code: 'peat', name: 'Peat'},
]

const soil = ref<string | null>('loam')
</script>
```

<!-- @example-end -->

With `allowClear` the value can be cleared. `clearValue` sets what clearing emits — `null`, `undefined` or `''` — and passing it explicitly also narrows the emitted type to match your model.

## Multiple

`WSelect` has no `v-model`: it emits `select` and `unselect` with the value, and leaves adding and removing to the parent. That way the parent can save each change, and show a spinner on the option until it's done with `loading`.

<!-- @example Select/Multiple -->

<DocsDemo name="Select/Multiple" />

```vue
<template>
  <WSelect
    :model-value="tags"
    :options="options"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Tags"
    placeholder="Add a tag"
    :option-component="OptionTag"
    class="max-w-md"
    @select="tags = [...tags, $event]"
    @unselect="tags = tags.filter(item => item !== $event)"
  />

  <p class="text-sm text-description">
    Model: {{ tags }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'

import OptionTag from './parts/OptionTag.vue'

const options = [
  {id: 1, name: 'indoor'},
  {id: 2, name: 'edible'},
  {id: 3, name: 'pet-safe'},
  {id: 4, name: 'fragrant'},
  {id: 5, name: 'evergreen'},
]

const tags = ref<number[]>([2, 3])
</script>
```

<!-- @example-end -->

The tags are drawn by an `optionComponent` rather than the `option` slot. The select passes its unselect button to the component's default slot, so the component can put it inside the tag's background; with the slot, the button sits next to the tag. The same component renders the tags in the dropdown, without a button.

<!-- @source src/components/Select/docs/examples/parts/OptionTag.vue -->

```vue [OptionTag.vue]
<template>
  <WSkeleton
    v-if="skeleton"
    class="w-option"
  />

  <div
    v-else
    class="tone-primary w-option w-option-has-bg bg-tone/10 text-tone grid max-w-max grid-cols-[1fr_auto] items-center gap-1 font-semibold"
  >
    <div class="truncate">
      {{ option?.name ?? search }}
    </div>

    <!-- The select puts its unselect button here, for a chosen tag in the field. -->
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<SelectOptionProps<{id: number, name: string}>>()
</script>
```

<!-- @source-end -->

## Async

`WSelectAsyncSingle` and `WSelectAsync` take `useQueryFnOptions` — a paginated query made with the kit's query helpers — and `queryParamsOptions`. The search text goes into the query params as `search` (`searchField` renames it), and more pages load as the dropdown scrolls.

To show the chosen value before the user opens the dropdown, the select requests it by id: the same query with `id__in` set to the model values (`valueQueryKey` renames it). The endpoint has to support that filter.

<!-- @example Select/Async -->

<DocsDemo name="Select/Async" />

```vue
<template>
  <WSelectAsyncSingle
    v-model="plantId"
    :use-query-fn-options="plantModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Plant"
    placeholder="Search by name or species"
    :option-component="OptionPlant"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Model: {{ plantId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'

import OptionPlant from './parts/OptionPlant.vue'

// The `use` of any paginated query — here the plant model from the list recipe.
import {plantModelApi} from '../../../../../docs/examples/recipes/plant-list/api/Plant'

const plantId = ref<number | null>(3)
</script>
```

<!-- @example-end -->

Until the selected plant loads by id, the select renders its option with `skeleton` — give the option a `WSkeleton` branch, or the field stays blank for that moment. Options on menu pages that are still loading get it too.

<!-- @source src/components/Select/docs/examples/parts/OptionPlant.vue OptionPlant.vue -->

```vue [OptionPlant.vue]
<template>
  <!-- Shown while the selected plant loads by id, and for options on pages still loading. -->
  <WSkeleton
    v-if="skeleton"
    class="w-option w-skeleton-w-48"
  />

  <div
    v-else
    class="w-option grid grid-cols-[auto_1fr_auto] items-center gap-2"
  >
    <span
      class="bg-tone-fill size-2.5 rounded-full"
      :class="option ? kindToneMap[option.kind] : 'tone-data-gray'"
    />

    <span class="truncate">
      {{ option?.name ?? search }} <span
        v-if="option"
        class="text-description italic"
      >{{ option.species }}</span>
    </span>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {Kind, type Plant} from '../../../../../../docs/examples/recipes/plant-list/models/Plant'

defineProps<SelectOptionProps<Plant>>()

const kindToneMap: Record<Kind, string> = {
  [Kind.TROPICAL]: 'tone-data-green',
  [Kind.SUCCULENT]: 'tone-data-orange',
  [Kind.FERN]: 'tone-data-teal',
  [Kind.HERB]: 'tone-data-violet',
}
</script>
```

<!-- @source-end -->

## Option layouts

An option is any markup, so it can carry as much as a card. The same component draws an option in three places, and its props tell them apart:

- **In the field** — `model` is `true`. Keep it to one line of `w-option` height, so the input does not grow. In a multiple select, the default slot holds the unselect button: place it inside the option's background.
- **In the menu** — `model` is falsy and there is room: add more rows, and a `py-1` to space them. `selected` is set for picked options.
- **While loading** — `skeleton` is `true` and `option` may be `undefined`. Draw a `WSkeleton` the size of what it stands for.
- **The "New:" row** of `createOption` — `option` is empty and `search` holds the typed text, which the option shows instead.

Extra props of an option component, like a display variant, are passed with `optionComponentProps`.

### Tags with their own color

Each option carries its tone, and the tag paints a soft background with it — `w-option-has-bg` stretches it to the field's edge. A typed light level is created with the tag icon and a gray tone.

<!-- @example Select/Light -->

<DocsDemo name="Select/Light" />

```vue
<template>
  <WSelect
    :model-value="light"
    :options="options"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search)"
    :create-option="createLight"
    title="Light it tolerates"
    placeholder="Add a light level"
    :option-component="OptionToneTag"
    class="max-w-md"
    @select="light = [...light, $event]"
    @unselect="light = light.filter(item => item !== $event)"
  />

  <p class="text-sm text-description">
    Model: {{ light }}
  </p>
</template>

<script lang="ts" setup>
import {markRaw, reactive, ref} from 'vue'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'

import IconCloud from 'eco-vue-js/dist/assets/icons/IconCloud'
import IconCloudSun from 'eco-vue-js/dist/assets/icons/IconCloudSun'
import IconCloudSunPartial from 'eco-vue-js/dist/assets/icons/IconCloudSunPartial'
import IconMoon from 'eco-vue-js/dist/assets/icons/IconMoon'
import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import OptionToneTag, {type ToneTag} from '../../../../../docs/examples/shared/OptionToneTag.vue'

const options = reactive<ToneTag[]>([
  {id: 'full-sun', name: 'Full sun', tone: 'tone-data-amber', icon: markRaw(IconSun)},
  {id: 'bright-indirect', name: 'Bright indirect', tone: 'tone-data-orange', icon: markRaw(IconCloudSun)},
  {id: 'part-shade', name: 'Part shade', tone: 'tone-data-teal', icon: markRaw(IconCloudSunPartial)},
  {id: 'shade', name: 'Shade', tone: 'tone-data-cyan', icon: markRaw(IconCloud)},
  {id: 'low-light', name: 'Low light', tone: 'tone-data-violet', icon: markRaw(IconMoon)},
])

const light = ref<string[]>(['bright-indirect', 'part-shade'])

// In an app, a POST that answers with the saved option. Without an icon, the option shows a tag.
const createLight = (search: string): ToneTag => {
  const option = {id: search.toLowerCase().replaceAll(' ', '-'), name: search, tone: 'tone-data-gray'}

  options.push(option)

  return option
}
</script>
```

<!-- @example-end -->

<!-- @source docs/examples/shared/OptionToneTag.vue OptionToneTag.vue -->

```vue [OptionToneTag.vue]
<template>
  <WSkeleton
    v-if="skeleton"
    class="w-option"
  />

  <!-- Each option brings its own tone; a typed one, not created yet, has no option and falls back to the search text. -->
  <div
    v-else
    class="w-option w-option-has-bg bg-tone-soft text-tone grid max-w-max grid-cols-[auto_1fr_auto] items-center gap-1.5 font-semibold"
    :class="option?.tone ?? 'tone-data-gray'"
  >
    <component
      :is="option?.icon ?? IconTag"
      class="square-[1.25em] shrink-0"
    />

    <span class="truncate">{{ option?.name ?? search }}</span>

    <!-- The select puts its unselect button here, for a chosen tag in the field. -->
    <slot />
  </div>
</template>

<script lang="ts" setup generic="Id extends string">
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconTag from 'eco-vue-js/dist/assets/icons/IconTag'

export type ToneTag<Id extends string = string> = {
  id: Id
  name: string
  tone: string
  /** Without one, the tag icon is shown. */
  icon?: SVGComponent
}

defineProps<SelectOptionProps<ToneTag<Id>>>()
</script>
```

<!-- @source-end -->

### Avatar and details

One line in the field; in the menu, the option fills the row with a larger avatar, the role on a second line and the last week of watering pushed to the right, one bar a day. Each person carries their avatar tone, so they look the same everywhere — the home page and the [List with fields](/recipes/list-with-fields) recipe use the same people and option.

<!-- @example Select/Gardener -->

<DocsDemo name="Select/Gardener" />

```vue
<template>
  <WSelectSingle
    v-model="gardenerId"
    :options="gardeners"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search) || item.role.toLowerCase().includes(search)"
    title="On watering duty"
    placeholder="Pick a gardener"
    :option-component="OptionGardener"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Model: {{ gardenerId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

import {gardeners} from '../../../../../docs/examples/shared/Gardener'
import OptionGardener from '../../../../../docs/examples/shared/OptionGardener.vue'

const gardenerId = ref<number | null>(1)
</script>
```

<!-- @example-end -->

<!-- @source docs/examples/shared/OptionGardener.vue OptionGardener.vue -->

```vue [OptionGardener.vue]
<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- In the field it is one line, so the input keeps its height; the menu adds the role and the last week of watering. -->
  <div
    v-else
    class="w-option grid grid-cols-[auto_1fr_auto] items-center gap-2"
    :class="model ? 'w-option-has-bg' : undefined"
  >
    <span
      class="surface-fill flex shrink-0 items-center justify-center rounded-full font-semibold option-shift"
      :class="[option.tone, model ? 'size-5 text-[0.625rem]' : 'size-8 text-xs']"
    >
      {{ initials(option.name) }}
    </span>

    <span
      v-if="model"
      class="truncate"
    >{{ option.name }}</span>

    <template v-else>
      <span class="grid min-w-0">
        <span class="truncate">{{ option.name }}</span>
        <span class="text-description truncate text-xs">{{ option.role }}</span>
      </span>

      <!-- One bar a day, filled on the days they watered. -->
      <span
        class="flex items-end gap-0.5"
        :class="option.tone"
        :title="`Watered ${ option.week.filter(Boolean).length } of the last 7 days`"
      >
        <span
          v-for="(watered, day) in option.week"
          :key="day"
          class="w-1 rounded-full"
          :class="watered ? 'bg-tone-fill h-4' : 'bg-line h-1.5'"
        />
      </span>
    </template>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {Gardener} from './Gardener'

import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {initials} from './Gardener'

defineProps<SelectOptionProps<Gardener>>()
</script>

<style>
.option-shift {
  margin-left: max(-0.5rem, calc(var(--w-option-padding) / -2));
}
</style>
```

<!-- @source-end -->

<!-- @source docs/examples/shared/Gardener.ts Gardener.ts -->

```ts [Gardener.ts]
/** A person who looks after the plants. Shared by the docs examples, so the same people show up everywhere. */
export type Gardener = {
  id: number
  name: string
  role: string
  /** Tone class of the avatar. */
  tone: string
  /** The last seven days, oldest first: whether they watered that day. */
  week: boolean[]
}

export const gardeners: Gardener[] = [
  {id: 1, name: 'Carl Linnaeus', role: 'Head gardener', tone: 'tone-data-green', week: [true, true, false, true, true, true, true]},
  {id: 2, name: 'Gregor Mendel', role: 'Gardener', tone: 'tone-data-violet', week: [true, false, true, true, false, true, true]},
  {id: 3, name: 'Barbara McClintock', role: 'Gardener', tone: 'tone-data-pink', week: [false, true, true, true, true, false, true]},
  {id: 4, name: 'Luther Burbank', role: 'Volunteer', tone: 'tone-data-amber', week: [false, false, true, false, false, true, false]},
  {id: 5, name: 'Beatrix Potter', role: 'Greenhouse', tone: 'tone-data-teal', week: [true, true, true, false, true, true, false]},
  {id: 6, name: 'George Washington Carver', role: 'Seedlings', tone: 'tone-data-cyan', week: [false, true, false, true, true, true, true]},
  {id: 7, name: 'Joseph Banks', role: 'Gardener', tone: 'tone-data-blue', week: [true, true, true, true, false, false, true]},
  {id: 8, name: 'Alexander von Humboldt', role: 'Volunteer', tone: 'tone-data-orange', week: [false, true, false, false, true, false, false]},
  {id: 9, name: 'Marianne North', role: 'Greenhouse', tone: 'tone-data-fuchsia', week: [true, false, true, true, true, false, true]},
  {id: 10, name: 'Jane Colden', role: 'Herbs', tone: 'tone-data-red', week: [true, true, false, true, false, true, true]},
  {id: 11, name: 'Asa Gray', role: 'Gardener', tone: 'tone-data-gray', week: [false, true, true, true, true, true, false]},
  {id: 12, name: 'John Bartram', role: 'Orchard', tone: 'tone-data-green', week: [true, false, false, true, true, false, true]},
  {id: 13, name: 'Ynes Mexia', role: 'Seedlings', tone: 'tone-data-violet', week: [true, true, true, true, true, true, false]},
  {id: 14, name: 'Joseph Dalton Hooker', role: 'Greenhouse', tone: 'tone-data-pink', week: [false, false, true, true, false, true, true]},
  {id: 15, name: 'Charles Darwin', role: 'Volunteer', tone: 'tone-data-amber', week: [false, true, false, false, false, true, false]},
  {id: 16, name: 'Maria Sibylla Merian', role: 'Herbs', tone: 'tone-data-teal', week: [true, true, false, true, true, false, true]},
  {id: 17, name: 'Gertrude Jekyll', role: 'Gardener', tone: 'tone-data-cyan', week: [true, true, true, false, true, true, true]},
  {id: 18, name: 'Vita Sackville-West', role: 'Gardener', tone: 'tone-data-blue', week: [false, true, true, true, false, true, true]},
  {id: 19, name: 'Kate Brandegee', role: 'Seedlings', tone: 'tone-data-orange', week: [true, false, true, false, true, true, false]},
  {id: 20, name: 'Eloise Butler', role: 'Volunteer', tone: 'tone-data-fuchsia', week: [false, false, false, true, false, true, true]},
  {id: 21, name: 'Liberty Hyde Bailey', role: 'Orchard', tone: 'tone-data-red', week: [true, true, false, false, true, true, true]},
  {id: 22, name: 'David Douglas', role: 'Gardener', tone: 'tone-data-gray', week: [true, false, true, true, true, true, false]},
  {id: 23, name: 'Ernest Wilson', role: 'Greenhouse', tone: 'tone-data-green', week: [false, true, true, false, true, false, true]},
  {id: 24, name: 'Frank Kingdon-Ward', role: 'Volunteer', tone: 'tone-data-violet', week: [true, false, false, false, true, false, false]},
  {id: 25, name: 'Janaki Ammal', role: 'Seedlings', tone: 'tone-data-pink', week: [true, true, true, true, false, true, true]},
  {id: 26, name: 'Agnes Arber', role: 'Herbs', tone: 'tone-data-amber', week: [false, true, true, false, true, true, false]},
  {id: 27, name: 'Nikolai Vavilov', role: 'Seedlings', tone: 'tone-data-teal', week: [true, false, true, true, false, true, true]},
  {id: 28, name: 'Masanobu Fukuoka', role: 'Orchard', tone: 'tone-data-cyan', week: [false, false, true, true, true, false, true]},
  {id: 29, name: 'Katherine Esau', role: 'Greenhouse', tone: 'tone-data-blue', week: [true, true, false, true, true, true, false]},
  {id: 30, name: 'John Muir', role: 'Volunteer', tone: 'tone-data-orange', week: [false, true, false, true, false, false, true]},
  {id: 31, name: 'Rachel Carson', role: 'Gardener', tone: 'tone-data-fuchsia', week: [true, true, true, false, false, true, true]},
  {id: 32, name: 'Norman Borlaug', role: 'Seedlings', tone: 'tone-data-red', week: [true, false, true, true, true, true, true]},
  {id: 33, name: 'Wangari Maathai', role: 'Orchard', tone: 'tone-data-gray', week: [true, true, false, true, false, true, false]},
  {id: 34, name: 'Piet Oudolf', role: 'Gardener', tone: 'tone-data-green', week: [false, true, true, true, true, false, true]},
  {id: 35, name: 'Lancelot Brown', role: 'Gardener', tone: 'tone-data-violet', week: [true, false, false, true, true, true, false]},
  {id: 36, name: 'Hildegard of Bingen', role: 'Herbs', tone: 'tone-data-pink', week: [false, true, true, false, true, true, true]},
]

/** First and last initials, which fit the round avatar. */
export const initials = (name: string) => {
  const parts = name.split(' ')

  return parts.length > 1 ? parts[0]![0]! + parts.at(-1)![0]! : name.slice(0, 2)
}
```

<!-- @source-end -->

### Joined segments

Three segments, each a `w-option-has-bg` with its own background: the name, the humidity colored by range, and the kind on a gradient that holds the unselect button. The option's own `textOnly` prop, passed through `optionComponentProps`, drops the backgrounds and keeps the colored text — for a plain list or a table cell.

<!-- @example Select/Passport -->

<DocsDemo name="Select/Passport" />

```vue
<template>
  <WSelectAsync
    :model-value="plantIds"
    :use-query-fn-options="plantModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Shelf by the window"
    placeholder="Add a plant"
    :option-component="OptionPassport"
    :option-component-props="{textOnly}"
    class="max-w-xl"
    @select="plantIds = [...plantIds, $event]"
    @unselect="plantIds = plantIds.filter(item => item !== $event)"
    @update:model-value="plantIds = $event"
  />

  <WCheckbox
    v-model="textOnly"
    title="Text only"
  />

  <p class="text-sm text-description">
    Model: {{ plantIds }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WCheckbox from 'eco-vue-js/dist/components/Checkbox/WCheckbox.vue'
import WSelectAsync from 'eco-vue-js/dist/components/Select/WSelectAsync.vue'

import OptionPassport from './parts/OptionPassport.vue'

import {plantModelApi} from '../../../../../docs/examples/recipes/plant-list/api/Plant'

const plantIds = ref<number[]>([1, 2, 3, 4])

const textOnly = ref(false)
</script>
```

<!-- @example-end -->

<!-- @source src/components/Select/docs/examples/parts/OptionPassport.vue OptionPassport.vue -->

```vue [OptionPassport.vue]
<template>
  <WSkeleton
    v-if="skeleton"
    class="w-option w-skeleton-w-48"
  />

  <!-- Three joined segments, each with its own background, so each is a `w-option-has-bg`. -->
  <div
    v-else
    class="w-option flex w-max max-w-full overflow-hidden"
  >
    <div
      class="w-option-has-bg text-accent flex min-w-0 items-center rounded-l-[inherit]"
      :class="{'bg-surface border-line-subtle border-y border-l': !textOnly}"
    >
      <span class="truncate">{{ option?.name ?? search }}</span>
    </div>

    <div
      v-if="option"
      class="w-option-has-bg text-tone flex items-center font-semibold tabular-nums"
      :class="[humidityTone, {'surface-soft border-y border-line-subtle': !textOnly}]"
      :title="`Prefers ${ option.humidity }% air humidity`"
    >
      <IconDrop class="square-[1em] mr-1" />
      {{ option.humidity }}%
    </div>

    <div
      class="w-option-has-bg grid grid-cols-[1fr_auto] items-center gap-1 rounded-r-[inherit] font-semibold capitalize"
      :class="textOnly ? ['text-tone', kindStyle.tone] : ['surface-fill bg-linear-to-r', kindStyle.tone, kindStyle.gradient]"
    >
      <span class="truncate">{{ option?.kind ?? 'new' }}</span>

      <!-- The unselect button lands in the last segment, on the gradient. -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'

import {Kind, type Plant} from '../../../../../../docs/examples/recipes/plant-list/models/Plant'

const props = defineProps<SelectOptionProps<Plant> & {
  /** Colors the text only, without backgrounds — for a plain list or a table cell. */
  textOnly?: boolean
}>()

/** `surface-fill` takes the tone for the text and the unselect button; the gradient paints over its flat fill. */
const kindStyleMap: Record<Kind, {tone: string, gradient: string}> = {
  [Kind.TROPICAL]: {tone: 'tone-data-green', gradient: 'from-data-green to-data-teal'},
  [Kind.SUCCULENT]: {tone: 'tone-data-orange', gradient: 'from-data-orange to-data-pink'},
  [Kind.FERN]: {tone: 'tone-data-teal', gradient: 'from-data-teal to-data-cyan'},
  [Kind.HERB]: {tone: 'tone-data-violet', gradient: 'from-data-violet to-data-fuchsia'},
}

const kindStyle = computed(() => props.option ? kindStyleMap[props.option.kind] : {tone: 'tone-data-gray', gradient: 'from-data-gray to-data-gray'})

const humidityTone = computed(() => {
  if (!props.option || props.option.humidity < 50) return 'tone-data-amber'
  if (props.option.humidity <= 65) return 'tone-data-green'
  return 'tone-data-cyan'
})
</script>
```

<!-- @source-end -->

### Compact in the field, a card in the menu

The first line is the whole option in the field: the bed, the date and how many seedlings sprouted and were lost. The menu adds the crops and a bar of how the tray is doing. The skeleton follows the same split.

<!-- @example Select/Batch -->

<DocsDemo name="Select/Batch" />

```vue
<template>
  <WSelectAsyncSingle
    v-model="batchId"
    :use-query-fn-options="batchModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Seed tray"
    placeholder="Search by bed or crop"
    :option-component="OptionBatch"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Model: {{ batchId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'

import {batchModelApi} from './api/garden'
import OptionBatch from './parts/OptionBatch.vue'

const batchId = ref<number | null>(3)
</script>
```

<!-- @example-end -->

<!-- @source src/components/Select/docs/examples/parts/OptionBatch.vue OptionBatch.vue -->

```vue [OptionBatch.vue]
<template>
  <!-- The placeholder takes the shape of what it stands for: one line in the field, a card in the menu. -->
  <WSkeleton
    v-if="skeleton && model"
    class="w-option w-skeleton-w-56"
  />

  <div
    v-else-if="skeleton"
    class="grid gap-1.5 py-1"
  >
    <WSkeleton class="w-skeleton-h-5" />
    <WSkeleton class="w-skeleton-h-5 w-skeleton-w-32" />
    <WSkeleton class="w-skeleton-h-1.5 w-skeleton-w-full" />
  </div>

  <div
    v-else-if="option"
    class="w-option grid content-center gap-1.5"
  >
    <!-- The first line is the whole option in the field. -->
    <div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
      <span class="text-accent truncate">
        <span class="font-semibold">{{ option.bed }}</span> · sown {{ dateFormatter.format(option.sownAt) }}
      </span>

      <span class="tone-data-green text-tone text-xs font-semibold tabular-nums">+{{ option.sprouted }}</span>
      <span
        class="text-xs font-semibold tabular-nums"
        :class="option.lost ? 'tone-data-red text-tone' : 'text-subtle'"
      >−{{ option.lost }}</span>

      <slot />
    </div>

    <template v-if="!model">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="crop in option.crops"
          :key="crop"
          class="bg-tone-soft text-tone rounded-full px-2 text-xs font-semibold"
          :class="cropToneMap[crop]"
        >
          {{ crop }}
        </span>
      </div>

      <!-- How the tray is doing: sprouted, still waiting, lost. -->
      <div class="flex h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          v-for="part in parts"
          :key="part.label"
          :class="part.class"
          :style="{width: `${ part.value / total * 100 }%`}"
        />
      </div>

      <div class="text-description flex gap-3 text-xs">
        <span
          v-for="part in parts"
          :key="part.label"
          class="flex items-center gap-1"
        >
          <span
            class="size-2 rounded-full"
            :class="part.class"
          />
          {{ part.value }} {{ part.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {type Batch, cropToneMap} from '../api/garden'

const props = defineProps<SelectOptionProps<Batch>>()

const dateFormatter = Intl.DateTimeFormat('en', {day: 'numeric', month: 'short'})

const parts = computed(() => props.option
  ? [
    {label: 'sprouted', value: props.option.sprouted, class: 'bg-data-green'},
    {label: 'waiting', value: props.option.waiting, class: 'bg-data-amber'},
    {label: 'lost', value: props.option.lost, class: 'bg-data-red'},
  ]
  : [])

const total = computed(() => parts.value.reduce((sum, part) => sum + part.value, 0) || 1)
</script>
```

<!-- @source-end -->

### A dense card

A seed variety with its crop, flags drawn as icons and a sowing calendar — twelve cells colored for sowing, harvest, or both. The legend sits above the options in the `content` slot. In the field it collapses to a colored tag.

<!-- @example Select/Variety -->

<DocsDemo name="Select/Variety" />

```vue
<template>
  <WSelectAsync
    :model-value="varietyIds"
    :use-query-fn-options="varietyModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Seeds to order"
    placeholder="Search by variety or crop"
    :option-component="OptionVariety"
    class="max-w-xl"
    @select="varietyIds = [...varietyIds, $event]"
    @unselect="varietyIds = varietyIds.filter(item => item !== $event)"
  >
    <!-- A legend for the calendar strip, above the options. -->
    <template #content>
      <div class="text-description flex gap-3 px---w-select-option-padding pt-2 text-xs">
        <span class="flex items-center gap-1"><span class="bg-data-teal size-2 rounded-full" /> Sow</span>
        <span class="flex items-center gap-1"><span class="bg-data-amber size-2 rounded-full" /> Harvest</span>
      </div>
    </template>
  </WSelectAsync>

  <p class="text-sm text-description">
    Model: {{ varietyIds }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsync from 'eco-vue-js/dist/components/Select/WSelectAsync.vue'

import {varietyModelApi} from './api/garden'
import OptionVariety from './parts/OptionVariety.vue'

const varietyIds = ref<number[]>([1, 9])
</script>
```

<!-- @example-end -->

<!-- @source src/components/Select/docs/examples/parts/OptionVariety.vue OptionVariety.vue -->

```vue [OptionVariety.vue]
<template>
  <WSkeleton
    v-if="skeleton && model"
    class="w-option"
  />

  <div
    v-else-if="skeleton"
    class="grid gap-1.5 py-1"
  >
    <WSkeleton class="w-skeleton-h-5" />
    <WSkeleton class="w-skeleton-h-4 w-skeleton-w-48" />
    <WSkeleton class="w-skeleton-h-4 w-skeleton-w-full" />
  </div>

  <!-- In the field: the name with a crop tag, and the unselect button inside it. -->
  <div
    v-else-if="model"
    class="w-option w-option-has-bg bg-tone-soft text-tone grid max-w-max grid-cols-[auto_1fr_auto] items-center gap-1.5"
    :class="option ? cropToneMap[option.crop] : 'tone-data-gray'"
  >
    <span class="bg-tone-fill size-2 rounded-full" />
    <span class="truncate font-semibold">{{ option?.name ?? search }}</span>

    <slot />
  </div>

  <div
    v-else-if="option"
    class="grid max-w-full gap-1 py-1"
  >
    <div class="flex min-w-0 items-center gap-2">
      <span class="text-accent truncate font-semibold">{{ option.name }}</span>

      <span
        class="bg-tone-soft text-tone shrink-0 rounded-full px-2 text-xs font-semibold"
        :class="cropToneMap[option.crop]"
      >{{ option.crop }}</span>

      <span
        v-if="option.heirloom"
        class="tone-data-amber text-tone ml-auto flex shrink-0 items-center gap-1 text-xs font-semibold"
      >
        <IconStar class="square-[1.25em]" />
        Heirloom
      </span>
    </div>

    <div class="text-description text-xs">
      Germinates in {{ option.germination[0] }}–{{ option.germination[1] }} days · first harvest at {{ option.harvest }} days
    </div>

    <div class="flex gap-3 text-xs">
      <span
        class="flex items-center gap-1"
        :class="option.organic ? 'tone-data-green text-tone' : 'text-description'"
      >
        <IconPlant class="square-[1.25em]" />
        {{ option.organic ? 'Organic' : 'Conventional' }}
      </span>

      <span
        class="flex items-center gap-1"
        :class="option.frostHardy ? 'tone-data-cyan text-tone' : 'text-description'"
      >
        <IconSnowflake class="square-[1.25em]" />
        {{ option.frostHardy ? 'Frost-hardy' : 'Frost-tender' }}
      </span>
    </div>

    <!-- The year at a glance: when to sow, when to harvest, and months that are both. -->
    <div class="mt-0.5 flex gap-0.5">
      <span
        v-for="(month, monthIndex) in MONTHS"
        :key="monthIndex"
        class="flex h-4 items-center justify-center rounded-sm text-[0.5625rem] font-semibold px-2"
        :class="monthClass(monthIndex)"
      >
        {{ month }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconPlant from 'eco-vue-js/dist/assets/icons/IconPlant'
import IconSnowflake from 'eco-vue-js/dist/assets/icons/IconSnowflake'
import IconStar from 'eco-vue-js/dist/assets/icons/IconStar'

import {type Variety, cropToneMap} from '../api/garden'

const props = defineProps<SelectOptionProps<Variety>>()

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const monthClass = (month: number) => {
  const sow = props.option?.sowMonths.includes(month)
  const harvest = props.option?.harvestMonths.includes(month)

  // `surface-fill` picks a readable text color for the tone; the split gradient paints over its fill.
  if (sow && harvest) return 'tone-data-teal surface-fill bg-linear-to-br from-data-teal from-50% to-data-amber to-50%'
  if (sow) return 'tone-data-teal surface-fill'
  if (harvest) return 'tone-data-amber surface-fill'
  return 'bg-surface-muted text-subtle'
}
</script>
```

<!-- @source-end -->

The batches and varieties come from a mock API, built the same way as the plants:

<!-- @source src/components/Select/docs/examples/api/garden.ts api/garden.ts -->

```ts [api/garden.ts]
import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'

export enum Crop {
  TOMATO = 'Tomato',
  PEPPER = 'Pepper',
  SQUASH = 'Squash',
  BEAN = 'Bean',
  KALE = 'Kale',
  CUCUMBER = 'Cucumber',
  EGGPLANT = 'Eggplant',
  BEET = 'Beet',
  RADISH = 'Radish',
  CARROT = 'Carrot',
}

/** Each crop gets one of the theme's data colors, used as a tone: `text-tone`, `bg-tone-soft`, `surface-fill`. */
export const cropToneMap: Record<Crop, string> = {
  [Crop.TOMATO]: 'tone-data-red',
  [Crop.PEPPER]: 'tone-data-orange',
  [Crop.SQUASH]: 'tone-data-amber',
  [Crop.BEAN]: 'tone-data-green',
  [Crop.KALE]: 'tone-data-teal',
  [Crop.CUCUMBER]: 'tone-data-cyan',
  [Crop.EGGPLANT]: 'tone-data-violet',
  [Crop.BEET]: 'tone-data-fuchsia',
  [Crop.RADISH]: 'tone-data-pink',
  [Crop.CARROT]: 'tone-data-orange',
}

/** A tray of seeds sown into a bed on one day. */
export type Batch = {
  id: number
  bed: string
  sownAt: Date
  crops: Crop[]
  sprouted: number
  waiting: number
  lost: number
}

/** A seed variety from the catalogue. Months are 0-based. */
export type Variety = {
  id: number
  name: string
  crop: Crop
  heirloom: boolean
  organic: boolean
  frostHardy: boolean
  /** Days to germinate, from and to. */
  germination: [number, number]
  /** Days from sowing to the first harvest. */
  harvest: number
  sowMonths: number[]
  harvestMonths: number[]
}

type QueryParams = {
  page?: number
  search?: string
  /** Comma-separated ids — how async selects look up the items behind their model value. */
  id__in?: string
}

const batches: Batch[] = ([
  ['Bed 1', [2, 3], [Crop.TOMATO, Crop.PEPPER], 18, 4, 2],
  ['Bed 2', [2, 9], [Crop.KALE], 22, 0, 1],
  ['Bed 3', [2, 17], [Crop.BEET, Crop.RADISH, Crop.CARROT], 31, 12, 5],
  ['Bed 4', [2, 24], [Crop.BEAN], 9, 14, 0],
  ['Bed 5', [3, 1], [Crop.SQUASH, Crop.CUCUMBER], 6, 8, 4],
  ['Greenhouse A', [3, 6], [Crop.EGGPLANT, Crop.PEPPER], 12, 2, 0],
  ['Greenhouse B', [3, 14], [Crop.TOMATO], 24, 6, 3],
  ['Bed 6', [3, 21], [Crop.RADISH], 40, 0, 2],
  ['Bed 7', [4, 2], [Crop.BEAN, Crop.SQUASH], 3, 20, 1],
  ['Cold frame', [4, 11], [Crop.KALE, Crop.BEET], 0, 16, 0],
] as const).map(([bed, [month, day], crops, sprouted, waiting, lost], index) => ({
  id: index + 1,
  bed,
  sownAt: new Date(2026, month, day),
  crops: [...crops],
  sprouted,
  waiting,
  lost,
}))

const months = (from: number, to: number) => Array.from({length: to - from + 1}, (_, index) => from + index)

const varieties: Variety[] = ([
  ['Cherokee Purple', Crop.TOMATO, true, true, false, [6, 14], 80, months(2, 3), months(6, 8)],
  ['Sungold', Crop.TOMATO, false, false, false, [5, 10], 65, months(2, 3), months(6, 9)],
  ['Brandywine', Crop.TOMATO, true, true, false, [6, 14], 90, months(2, 3), months(7, 8)],
  ['California Wonder', Crop.PEPPER, true, false, false, [8, 21], 75, months(1, 2), months(7, 9)],
  ['Early Jalapeño', Crop.PEPPER, false, true, false, [8, 16], 65, months(1, 2), months(6, 9)],
  ['Waltham Butternut', Crop.SQUASH, true, true, false, [5, 10], 100, months(4, 5), months(8, 9)],
  ['Blue Lake', Crop.BEAN, true, false, false, [6, 10], 58, months(4, 6), months(6, 8)],
  ['Kentucky Wonder', Crop.BEAN, true, true, false, [6, 12], 65, months(4, 6), months(7, 9)],
  ['Lacinato', Crop.KALE, true, true, true, [5, 8], 60, [2, 3, 6, 7], [5, 6, 9, 10, 11]],
  ['Red Russian', Crop.KALE, true, false, true, [5, 8], 50, [2, 3, 7], [4, 5, 9, 10, 11]],
  ['Marketmore 76', Crop.CUCUMBER, false, true, false, [4, 10], 68, months(4, 5), months(6, 8)],
  ['Listada de Gandia', Crop.EGGPLANT, true, true, false, [7, 14], 85, months(1, 2), months(7, 8)],
  ['Detroit Dark Red', Crop.BEET, true, false, true, [5, 12], 60, months(2, 6), months(5, 9)],
  ['Chioggia', Crop.BEET, true, true, true, [5, 12], 55, months(2, 6), months(5, 9)],
  ['French Breakfast', Crop.RADISH, true, true, true, [3, 7], 25, [2, 3, 4, 7, 8], [3, 4, 5, 8, 9]],
  ['Cherry Belle', Crop.RADISH, false, false, true, [3, 7], 24, [2, 3, 4, 7, 8], [3, 4, 5, 8, 9]],
  ['Danvers', Crop.CARROT, true, true, true, [10, 21], 75, months(2, 5), months(6, 10)],
] as const).map(([name, crop, heirloom, organic, frostHardy, germination, harvest, sowMonths, harvestMonths], index) => ({
  id: index + 1,
  name,
  crop,
  heirloom,
  organic,
  frostHardy,
  germination: [...germination],
  harvest,
  sowMonths: [...sowMonths],
  harvestMonths: [...harvestMonths],
}))

/** Stands in for a request to the API: answers after a moment with a copy of the data. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 600)
})

/** Searches the given fields and filters by `id__in`, as a backend would. */
const filterList = <Item extends {id: number}>(list: Item[], queryParams: QueryParams | undefined, fields: (item: Item) => string[]) => {
  const search = queryParams?.search?.trim().toLowerCase()
  const ids = queryParams?.id__in?.split(',').map(Number)

  return list
    .filter(item => !search || fields(item).some(field => field.toLowerCase().includes(search)))
    .filter(item => !ids || ids.includes(item.id))
}

const isQueryParams = (value: unknown): value is QueryParams | undefined => value === undefined || value instanceof Object

export const batchModelApi = createRestModelApi({
  modelKey: 'Batch',
  model: {} as Batch,
  queries: {
    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Batch>,
      isQueryParams,
      // In an app, a GET to `/batches/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterList(batches, queryKey[2], item => [item.bed, ...item.crops]), queryKey[2]?.page, 6)),
    },
  },
})

export const varietyModelApi = createRestModelApi({
  modelKey: 'Variety',
  model: {} as Variety,
  queries: {
    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Variety>,
      isQueryParams,
      // In an app, a GET to `/varieties/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterList(varieties, queryKey[2], item => [item.name, item.crop]), queryKey[2]?.page, 6)),
    },
  },
})
```

<!-- @source-end -->

## Other forms

- **`WSelectStringified`** is a `WSelect` whose model is one string — the values joined by `divider`, such as `"high,critical"` for a query param, or a JSON array with `divider="json"`.
- **`WSelectAsyncList`** shows the options of a paginated query as a list that is always open, in a scrolling box, with the picked ones checked — for picking from a long list inside a form or a modal. It emits `select` and `unselect` instead of a model; `selectOnly` and `unselectOnly` allow only one of them.

## API

<!-- @api WSelectSingle -->

### WSelectSingle

```ts
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| ClearValue \| null \| undefined` | **required** | Selected value. |
| `allowClear` | `AllowClear` | — | Adds a button that clears the value, emitting `clearValue`. |
| `clearValue` | `ClearValue` | — | Value emitted when cleared. Defaults to `null`; set it explicitly to emit `undefined` or `''`. |
| `createdData` | `Data` | — | Option to add to the loaded ones — for a selected value the query does not return, such as one created elsewhere. |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. |
| `queryParamsOptions` | `QueryParamsOptions` | — | Parameters for `useQueryFnOptions`. |
| `options` | `Data[]` | — | Static list of options, instead of loading them with `useQueryFnOptions`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | Tells whether an option matches the typed search, which is trimmed and lowercased. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `useFirstDefault` | `boolean` | — | Selects the first loaded option while nothing is selected, and emits `init-model`. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `filterOptions` | `((option: Data) => boolean)` | — | Hides options for which it returns `false`. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
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

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(EmitType, Data \| undefined)` | The new value, with its option — `clearValue` when cleared. |
| `update:query-options-error` | `(string \| undefined)` | Error detail from a failed `useQueryFnOptions`, or `undefined` once it loads. |
| `init-model` | — | A default value was selected by `useQueryFnDefault` or `useFirstDefault`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | — | Content to the right of the field. |
| `prefix` | — | Replaces the selected chips. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `content` | — | Content at the top of the menu, above the options. |

<!-- @api-end -->

<!-- @api WSelect -->

### WSelect

```ts
import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model[] \| undefined` | **required** | Selected values. The component does not change it — update it from `select` and `unselect`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | Tells whether an option matches the typed search, which is trimmed and lowercased. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `useFirstDefault` | `boolean` | — | Selects the first loaded option while nothing is selected, and emits `init-model`. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `disableClear` | `boolean` | — | Hides the remove button on the selected chips. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `filterOptions` | `((option: Data) => boolean)` | — | Hides options for which it returns `false`. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `createdData` | `Data[]` | — | Options to add to the loaded ones — for selected values the query does not return, such as ones created elsewhere. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `cursorSelected` | `boolean` | — | Puts the cursor on the first selected option when the menu opens, so Enter toggles it — by default the menu only scrolls to it. Always set in the single selects. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. |
| `queryParamsOptions` | `QueryParamsOptions` | — | Parameters for `useQueryFnOptions`. |
| `options` | `Data[]` | — | Static list of options, instead of loading them with `useQueryFnOptions`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
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

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model, Data)` | An option was picked. Add it to `modelValue`. |
| `unselect` | `(Model, Data \| undefined)` | An option was removed, from its chip or the menu. Remove it from `modelValue`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |
| `update:query-options-error` | `(string \| undefined)` | Error detail from a failed `useQueryFnOptions`, or `undefined` once it loads. |
| `init-model` | — | A default value was selected by `useQueryFnDefault` or `useFirstDefault`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `right` | — | Content to the right of the field. |
| `prefix` | — | Replaces the selected chips. |
| `content` | — | Content at the top of the menu, above the options. |

<!-- @api-end -->

<!-- @api WSelectAsyncSingle -->

### WSelectAsyncSingle

```ts
import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| ClearValue \| null` | **required** | Selected value. |
| `allowClear` | `AllowClear` | — | Adds a button that clears the value, emitting `clearValue`. |
| `clearValue` | `ClearValue` | — | Value emitted when cleared. Defaults to `null`; set it explicitly to emit `undefined` or `''`. |
| `previewData` | `Data` | — | Selected option, shown in the field instead of loading it. |
| `createdData` | `Data` | — | Option to add to the loaded ones — for a selected value the query does not return, such as one created elsewhere. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `useQueryFnOptions` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query that loads the options, page by page as the menu scrolls. The search text is sent in `searchField`. |
| `queryParamsOptions` | `QueryParams` | **required** | Parameters for `useQueryFnOptions`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `useQueryFnPrefix` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | Paginated query that loads the selected options for the chips. Defaults to `useQueryFnOptions`. |
| `searchField` | `keyof QueryParams` | — | Query parameter that receives the search text. Defaults to `search`. |
| `valueQueryKey` | `string` | — | Query parameter that receives the selected values, comma-separated, when loading the chips. |
| `prefixText` | `string` | — | Word after the count shown instead of chips when more than `prefixMax` values are selected. Defaults to "items". |
| `prefixMax` | `number` | — | Most selected values shown as chips; above it, a count with a clear-all button is shown instead. |
| `reverse` | `boolean` | — | Shows the check mark on options that are not selected instead of those that are — for a select that picks what to exclude. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
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

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(EmitType, Data \| undefined)` | The new value, with its option — `clearValue` when cleared. |
| `init-model` | — | A default value was selected by `useQueryFnDefault`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | `Record<string, never>` | Content to the right of the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `content` | — | Content at the top of the menu, above the options. |
| `prefix` | — | Replaces the selected chips. |

<!-- @api-end -->

<!-- @api WSelectAsync -->

### WSelectAsync

```ts
import WSelectAsync from 'eco-vue-js/dist/components/Select/WSelectAsync.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `useQueryFnOptions` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query that loads the options, page by page as the menu scrolls. The search text is sent in `searchField`. |
| `useQueryFnPrefix` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | Paginated query that loads the selected options for the chips. Defaults to `useQueryFnOptions`. |
| `queryParamsOptions` | `QueryParams` | **required** | Parameters for `useQueryFnOptions`. |
| `searchField` | `keyof QueryParams` | — | Query parameter that receives the search text. Defaults to `search`. |
| `previewData` | `Data[]` | — | Selected options, used for the chips instead of loading them. |
| `valueQueryKey` | `string` | `"id__in"` | Query parameter that receives the selected values, comma-separated, when loading the chips. |
| `prefixText` | `string` | — | Word after the count shown instead of chips when more than `prefixMax` values are selected. Defaults to "items". |
| `prefixMax` | `number` | `8` | Most selected values shown as chips; above it, a count with a clear-all button is shown instead. |
| `reverse` | `boolean` | — | Shows the check mark on options that are not selected instead of those that are — for a select that picks what to exclude. |
| `modelValue` | `Model[] \| undefined` | **required** | Selected values. The component does not change it — update it from `select` and `unselect`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `emptyStub` | `string` | `"No match"` | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `disableClear` | `boolean` | — | Hides the remove button on the selected chips. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `createdData` | `Data[]` | — | Options to add to the loaded ones — for selected values the query does not return, such as ones created elsewhere. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `cursorSelected` | `boolean` | — | Puts the cursor on the first selected option when the menu opens, so Enter toggles it — by default the menu only scrolls to it. Always set in the single selects. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
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

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model, Data)` | An option was picked. Add it to `modelValue`. |
| `unselect` | `(Model, Data \| undefined)` | An option was removed, from its chip or the menu. Remove it from `modelValue`. |
| `update:model-value` | `(Model[])` | Emits `[]` from the clear-all button shown with the count, when more than `prefixMax` values are selected. |
| `init-model` | — | A default value was selected by `useQueryFnDefault`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | `Record<string, never>` | Content to the right of the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `content` | — | Content at the top of the menu, above the options. |
| `prefix` | `{ modelValue: Model[]; }` | Replaces the selected chips. |

<!-- @api-end -->

<!-- @api WSelectStringified -->

### WSelectStringified

```ts
import WSelectStringified from 'eco-vue-js/dist/components/Select/WSelectStringified.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| null \| undefined` | **required** | Picked values in one string, joined by `divider`. |
| `divider` | `string` | **required** | Separator between the values, e.g. `,`, or `json` for a JSON array of strings. |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. |
| `queryParamsOptions` | `QueryParamsOptions` | — | Parameters for `useQueryFnOptions`. |
| `options` | `Data[]` | — | Static list of options, instead of loading them with `useQueryFnOptions`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | Tells whether an option matches the typed search, which is trimmed and lowercased. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `useFirstDefault` | `boolean` | — | Selects the first loaded option while nothing is selected, and emits `init-model`. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `disableClear` | `boolean` | — | Hides the remove button on the selected chips. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `filterOptions` | `((option: Data) => boolean)` | — | Hides options for which it returns `false`. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `createdData` | `Data[]` | — | Options to add to the loaded ones — for selected values the query does not return, such as ones created elsewhere. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `cursorSelected` | `boolean` | — | Puts the cursor on the first selected option when the menu opens, so Enter toggles it — by default the menu only scrolls to it. Always set in the single selects. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
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

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(Model)` | The picked values, joined into one string. |
| `update:query-options-error` | `(string \| undefined)` | Error message of the options query, or `undefined` once it loads. |
| `init-model` | — | The options loaded. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | — | Content to the right of the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Content of an option, in the menu and in the chips. |
| `content` | — | Content at the top of the menu. |

<!-- @api-end -->

<!-- @api WSelectAsyncList -->

### WSelectAsyncList

```ts
import WSelectAsyncList from 'eco-vue-js/dist/components/Select/WSelectAsyncList.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the list. |
| `emptyStub` | `string` | — | Text shown when the query returns no options. |
| `modelValue` | `Model[]` | **required** | Picked values. |
| `useQueryFn` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query of the options, loaded page by page as the list scrolls. |
| `queryParams` | `QueryParams` | **required** | Params of the query, such as a search. |
| `skeleton` | `boolean` | — | Shows placeholders instead of the list. When unset, inherits the skeleton state provided by a parent. |
| `excludeParams` | `(keyof QueryParams)[]` | — | Params whose change refetches the loaded pages instead of starting from the first one. |
| `selectOnly` | `boolean` | — | Only allows picking options, not unpicking them. |
| `unselectOnly` | `boolean` | — | Only allows unpicking options, not picking them. |
| `hideOptionIcon` | `boolean` | — | Hides the check icon of the options. |
| `valueGetter` | `((data: Data) => Model)` | `(data as unknown as {     id: Model; }).id` | Value of an option. Defaults to its `id`. |
| `queryOptions` | `Partial<DefaultQueryOptions<PaginatedResponse<Data>> \| undefined>` | — | Options for every page query. |
| `disabled` | `boolean` | — | Stops picking. When unset, inherits the disabled state provided by a parent. |
| `readonly` | `boolean` | — | Stops picking. When unset, inherits the readonly state provided by a parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model)` | An option was picked. |
| `unselect` | `(Model)` | An option was unpicked. |
| `update:count` | `(number)` | Total number of options, from the query's `count`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `PartialNot<SelectOptionProps<Data>>` | Content of an option, with `skeleton` while its page loads. |

<!-- @api-end -->
