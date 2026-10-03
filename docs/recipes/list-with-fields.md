---
group: Recipes
aside: false
description: Build a paginated, sortable, searchable WList on a createRestModelApi model, with one component per column, filters kept in the URL, an expansion row and a row menu that calls the model's actions — the pattern used for every data table in eco-vue-js apps.
---

# List with fields

**Problem:** a paginated collection needs a table on desktop and cards on mobile, sortable and resizable columns the user can show, hide and reorder, filters, per-row actions, and an expandable detail row — without each list re-implementing any of that.

**Pattern:** `WList` owns layout, pagination, selection, column settings and ordering. You supply:

| Piece | What it is |
| --- | --- |
| A model | `createRestModelApi` with a paginated query, whose `use` is the list's `useQueryFn`, and the actions that change an item. |
| Query params | `createUseQueryParams`, which keeps the user's search, filters and ordering in the URL. |
| Filter components | One `.vue` per filter for `WListFilter`. The component renders the control; its exported `meta` declares the title, icon and the params it sets. |
| Field components | One `.vue` per column. The component renders the cell; its exported `meta` declares the label, width, title and sort field. |
| A fields index | The ordered tuple of field modules plus the default column config. |
| Menu components | Row actions, typed with `MenuProps<T>` / `MenuEmits<T>`. |
| An expansion component | Optional detail row, opened from the field marked `allow-open`. |

<!-- @example recipes/plant-list/PlantList overflow -->

<DocsDemo name="recipes/plant-list/PlantList" overflow />

```vue
<template>
  <!-- The filters edit the same query params the list reads. -->
  <WUniform
    :model-value="queryParams"
    @update:model-value="updateQueryParams"
  >
    <template #default="scope">
      <WListFilter
        :scope="scope"
        :filter="listFilterPlant"
        search
        class="sticky left---left-inner mb-2 w---width-inner"
      />
    </template>
  </WUniform>

  <WList
    :use-query-fn="plantModelApi.paginated.use"
    :query-params="queryParams"
    :fields="listFieldsPlant"
    :default-config-map="defaultFieldConfigMapPlant"
    config-key="w-list-docs-plant"
    :expansion="markRaw(PlantContent)"
    :menu="[
      markRaw(WMenuPlantToggle),
      markRaw(WMenuPlantDelete),
    ]"
    selection-title="plant"
    :select-all-text-getter="selectAllTextGetter"
    :card-columns="(['2fr', '1fr', 'auto'] as const)"
    :card-areas="[
      ['name', 'name', 'area_select'],
      ['species','species', 'area_more'],
      ['kind', 'light', 'light'],
      ['health', 'growth', 'growth'],
      ['watered', 'due', 'due'],
      ['height', 'humidity', 'humidity'],
      ['water', 'seeds', 'seeds'],
      ['caretaker', 'caretaker', 'caretaker'],
    ]"
    card-class="list:h-11 card:gap-1 sm:card:p-4 sm-not:card:py-3 sm:card:w-list-rounded-xl sm:card:border sm:card:shadow-sm border-line-subtle"
    card-wrapper-class="card:self-start"
    min-height
    class="card:w-list-gap-3"
    @update:query-params="updateQueryParams"
  />
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import WList from 'eco-vue-js/dist/components/List/WList.vue'
import WListFilter from 'eco-vue-js/dist/components/List/WListFilter.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import PlantContent from './PlantContent.vue'
import {plantModelApi, useQueryParamsPlants} from './api/Plant'
import {defaultFieldConfigMapPlant, listFieldsPlant} from './fields'
import {listFilterPlant} from './filter'
import WMenuPlantDelete from './menu/WMenuPlantDelete.vue'
import WMenuPlantToggle from './menu/WMenuPlantToggle.vue'

// The docs have no router, so the filters stay in the page. In an app, keep them in the URL: `useQueryParamsPlants(useRoute())`.
const {queryParams, updateQueryParams} = useQueryParamsPlants.useQueryParamsLocal()

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } plants`
</script>
```

<!-- @example-end -->

Try adding a filter, sorting by a few columns from the sort menu, resizing Name, hiding columns from the header settings, switching to cards, expanding a row and using the `⋯` menu. The data is in memory here, behind the same model API a real endpoint would use.

## The code

### Model and filters

The model is the only piece that knows where data comes from — see [Data layer](/guide/data-layer) for the whole API. `WList` calls `plantModelApi.paginated.use` with `{...queryParams, page}` for each page and expects a `PaginatedResponse<T>`. Here each request is answered from an array in memory; in an app it goes through your `apiClient`.

The item query holds the actions the menu calls. `update` puts the saved plant into every cached page that holds it, and `delete` returns `() => null` to drop the plant from them.

`useQueryParamsPlants` declares the params the user sets: `search`, `ordering` and one per filter — `kind__in`, `light__in`, `watered` and `caretaker`. Each gets a parse function that reads it back from the URL and drops what does not parse, so a hand-edited link cannot put an unknown kind into the query. Leave `page` out — the list adds it to each page's query. The docs have no router, so the demo keeps the filters in the page with `useQueryParamsLocal()`. In an app, pass the route, and the filters live in the URL:

```ts
const {queryParams, updateQueryParams} = useQueryParamsPlants(useRoute())
```

::: code-group

<!-- @source docs/examples/recipes/plant-list/models/Plant.ts models/Plant.ts -->

```ts [models/Plant.ts]
import {addDay, addMonth, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import {type Gardener, gardeners} from '../../../shared/Gardener'

export enum Kind {
  TROPICAL = 'tropical',
  SUCCULENT = 'succulent',
  FERN = 'fern',
  HERB = 'herb',
}

export enum Light {
  FULL_SUN = 'full_sun',
  BRIGHT = 'bright',
  PARTIAL = 'partial',
  SHADE = 'shade',
}

export type Task = {
  title: string
  due: Date
}

export type Plant = {
  id: number
  name: string
  species: string
  kind: Kind
  /** Grown height, in centimetres. */
  height: number
  watered: boolean
  /** Air humidity the plant prefers, in percent. */
  humidity: number
  /** How many seeds are in stock. */
  seeds: number
  /** Water per watering, in millilitres. */
  water: number
  /** When a thirsty plant needs water by; `null` while it is watered. */
  waterBy: Date | null
  light: Light
  /** Health score, from 0 to 100. */
  health: number
  /** Height a month apart over the last six months, oldest first; the last is today's. */
  growth: {date: number, height: number}[]
  /** Days it was watered over the last four weeks, newest first. */
  waterings: Date[]
  /** Temperature range it is happy in, in °C. */
  temperature: [number, number]
  caretaker: Gardener
  tasks: Task[]
  description: string
}

const LIGHTS = [Light.BRIGHT, Light.FULL_SUN, Light.PARTIAL, Light.SHADE] as const

/** Days between waterings. */
const INTERVAL: Record<Kind, number> = {
  [Kind.TROPICAL]: 5,
  [Kind.SUCCULENT]: 10,
  [Kind.FERN]: 3,
  [Kind.HERB]: 2,
}

const TEMPERATURE: Record<Kind, [number, number]> = {
  [Kind.TROPICAL]: [18, 29],
  [Kind.SUCCULENT]: [10, 32],
  [Kind.FERN]: [16, 24],
  [Kind.HERB]: [12, 26],
}

const SOURCE: [string, string, Kind, number][] = [
  ['Monstera', 'Monstera deliciosa', Kind.TROPICAL, 300],
  ['Aloe vera', 'Aloe barbadensis', Kind.SUCCULENT, 60],
  ['Boston fern', 'Nephrolepis exaltata', Kind.FERN, 90],
  ['Basil', 'Ocimum basilicum', Kind.HERB, 60],
  ['Fiddle-leaf fig', 'Ficus lyrata', Kind.TROPICAL, 300],
  ['Jade plant', 'Crassula ovata', Kind.SUCCULENT, 90],
  ['Maidenhair fern', 'Adiantum raddianum', Kind.FERN, 45],
  ['Rosemary', 'Salvia rosmarinus', Kind.HERB, 150],
  ['Rubber plant', 'Ficus elastica', Kind.TROPICAL, 250],
  ['Snake plant', 'Dracaena trifasciata', Kind.SUCCULENT, 90],
  ['Bird\'s nest fern', 'Asplenium nidus', Kind.FERN, 90],
  ['Thyme', 'Thymus vulgaris', Kind.HERB, 30],
  ['Golden pothos', 'Epipremnum aureum', Kind.TROPICAL, 200],
  ['Zebra haworthia', 'Haworthiopsis attenuata', Kind.SUCCULENT, 15],
  ['Staghorn fern', 'Platycerium bifurcatum', Kind.FERN, 90],
  ['Mint', 'Mentha spicata', Kind.HERB, 60],
  ['Heartleaf philodendron', 'Philodendron hederaceum', Kind.TROPICAL, 120],
  ['Echeveria', 'Echeveria elegans', Kind.SUCCULENT, 15],
  ['Rabbit\'s foot fern', 'Davallia fejeensis', Kind.FERN, 45],
  ['Lavender', 'Lavandula angustifolia', Kind.HERB, 60],
  ['Peace lily', 'Spathiphyllum wallisii', Kind.TROPICAL, 60],
  ['String of pearls', 'Curio rowleyanus', Kind.SUCCULENT, 90],
  ['Blue star fern', 'Phlebodium aureum', Kind.FERN, 60],
  ['Sage', 'Salvia officinalis', Kind.HERB, 60],
  ['Calathea', 'Goeppertia orbifolia', Kind.TROPICAL, 90],
  ['Panda plant', 'Kalanchoe tomentosa', Kind.SUCCULENT, 45],
  ['Kangaroo fern', 'Microsorum diversifolium', Kind.FERN, 45],
  ['Oregano', 'Origanum vulgare', Kind.HERB, 45],
  ['Prayer plant', 'Maranta leuconeura', Kind.TROPICAL, 30],
  ['Burro\'s tail', 'Sedum morganianum', Kind.SUCCULENT, 60],
  ['Holly fern', 'Cyrtomium falcatum', Kind.FERN, 60],
  ['Parsley', 'Petroselinum crispum', Kind.HERB, 30],
  ['Bird of paradise', 'Strelitzia reginae', Kind.TROPICAL, 180],
  ['Golden barrel cactus', 'Echinocactus grusonii', Kind.SUCCULENT, 60],
  ['Button fern', 'Pellaea rotundifolia', Kind.FERN, 30],
  ['Chives', 'Allium schoenoprasum', Kind.HERB, 30],
  ['Areca palm', 'Dypsis lutescens', Kind.TROPICAL, 250],
  ['Christmas cactus', 'Schlumbergera bridgesii', Kind.SUCCULENT, 30],
  ['Lemon button fern', 'Nephrolepis cordifolia', Kind.FERN, 30],
  ['Coriander', 'Coriandrum sativum', Kind.HERB, 50],
  ['Parlour palm', 'Chamaedorea elegans', Kind.TROPICAL, 120],
  ['Bunny ear cactus', 'Opuntia microdasys', Kind.SUCCULENT, 60],
  ['Silver lace fern', 'Pteris ensiformis', Kind.FERN, 45],
  ['Dill', 'Anethum graveolens', Kind.HERB, 90],
  ['Chinese evergreen', 'Aglaonema commutatum', Kind.TROPICAL, 90],
  ['Ponytail palm', 'Beaucarnea recurvata', Kind.SUCCULENT, 180],
  ['Asparagus fern', 'Asparagus setaceus', Kind.FERN, 90],
  ['Lemon balm', 'Melissa officinalis', Kind.HERB, 60],
  ['Anthurium', 'Anthurium andraeanum', Kind.TROPICAL, 60],
  ['ZZ plant', 'Zamioculcas zamiifolia', Kind.SUCCULENT, 90],
  ['Japanese painted fern', 'Athyrium niponicum', Kind.FERN, 45],
  ['Tarragon', 'Artemisia dracunculus', Kind.HERB, 90],
  ['Elephant ear', 'Alocasia amazonica', Kind.TROPICAL, 120],
  ['Living stones', 'Lithops lesliei', Kind.SUCCULENT, 5],
  ['Ostrich fern', 'Matteuccia struthiopteris', Kind.FERN, 150],
  ['Chamomile', 'Matricaria chamomilla', Kind.HERB, 60],
  ['Croton', 'Codiaeum variegatum', Kind.TROPICAL, 150],
  ['Hens and chicks', 'Sempervivum tectorum', Kind.SUCCULENT, 15],
  ['Tree fern', 'Dicksonia antarctica', Kind.FERN, 450],
  ['Lemongrass', 'Cymbopogon citratus', Kind.HERB, 150],
  ['Moth orchid', 'Phalaenopsis amabilis', Kind.TROPICAL, 60],
  ['Century plant', 'Agave americana', Kind.SUCCULENT, 180],
  ['Hart\'s tongue fern', 'Asplenium scolopendrium', Kind.FERN, 60],
  ['Bay laurel', 'Laurus nobilis', Kind.HERB, 300],
  ['Swiss cheese vine', 'Monstera adansonii', Kind.TROPICAL, 90],
  ['Paddle plant', 'Kalanchoe luciae', Kind.SUCCULENT, 45],
  ['Cinnamon fern', 'Osmundastrum cinnamomeum', Kind.FERN, 120],
  ['Fennel', 'Foeniculum vulgare', Kind.HERB, 150],
  ['Dragon tree', 'Dracaena marginata', Kind.TROPICAL, 200],
  ['Ghost plant', 'Graptopetalum paraguayense', Kind.SUCCULENT, 20],
  ['Lady fern', 'Athyrium filix-femina', Kind.FERN, 90],
  ['Marjoram', 'Origanum majorana', Kind.HERB, 45],
  ['Cast iron plant', 'Aspidistra elatior', Kind.TROPICAL, 60],
  ['String of hearts', 'Ceropegia woodii', Kind.SUCCULENT, 120],
  ['Royal fern', 'Osmunda regalis', Kind.FERN, 150],
  ['Catnip', 'Nepeta cataria', Kind.HERB, 90],
  ['Banana plant', 'Musa acuminata', Kind.TROPICAL, 300],
  ['Moon cactus', 'Gymnocalycium mihanovichii', Kind.SUCCULENT, 10],
  ['Bracken', 'Pteridium aquilinum', Kind.FERN, 120],
  ['Sorrel', 'Rumex acetosa', Kind.HERB, 60],
]

/** In-memory stand-in for a REST collection. */
export const plants: Plant[] = SOURCE.map(([name, species, kind, height], index) => {
  const today = getStartOfDay()
  // The kinds repeat every four rows, so `round` steps each kind through every light level and caretaker in turn.
  const round = index + Math.floor(index / 4)
  const watered = index % 3 !== 0
  // Some thirsty plants are overdue.
  const waterBy = watered ? null : addDay(today, index * 5 % 10 - 4)
  // Plants that grow fast gained up to a third of their height in six months.
  const gain = 0.08 + index * 7 % 25 / 100
  // The last watering was a while ago for thirsty plants.
  const lastWatered = (watered ? index % INTERVAL[kind] : INTERVAL[kind] + 1 + index % 3)

  return {
    id: index + 1,
    name,
    species,
    kind,
    height,
    watered,
    humidity: 40 + index * 13 % 41,
    seeds: 40 + index * 7919 % 4800,
    water: 50 * (1 + index * 7 % 16),
    waterBy,
    light: LIGHTS[round % LIGHTS.length]!,
    health: Math.max(12, 60 + index * 17 % 41 - (waterBy && waterBy < today ? 35 : 0)),
    growth: Array.from({length: 6}, (_, month) => ({
      date: +addMonth(today, month - 5),
      height: month === 5 ? height : Math.round(height * (1 - gain * (5 - month) / 5) * (1 + (month * index % 3 - 1) / 100)),
    })),
    waterings: Array.from({length: 28}, (_, day) => addDay(today, -day))
      .filter((_, day) => day >= lastWatered && (day - lastWatered) % INTERVAL[kind] === 0),
    temperature: TEMPERATURE[kind],
    caretaker: gardeners[round % gardeners.length]!,
    tasks: [
      {title: 'Fertilize', due: addDay(today, index * 3 % 14 - 2)},
      {title: 'Prune', due: addDay(today, 7 + index * 5 % 30)},
      {title: 'Repot', due: addDay(today, 20 + index * 11 % 90)},
    ],
    description: `${ name } (${ species }), a ${ kind } plant that grows to about ${ height } cm.`,
  }
})
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/api/Plant.ts api/Plant.ts -->

```ts [api/Plant.ts]
import {createUseQueryParams} from 'eco-vue-js/dist/utils/api'
import {Order, parseOrdering} from 'eco-vue-js/dist/utils/order'
import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'
import {isId, parseBoolean, parseId, parseString, parseStringList} from 'eco-vue-js/dist/utils/utils'

import {Kind, Light, type Plant, plants} from '../models/Plant'

/** Parses a comma-separated list, dropping values that are not in `values`, such as ones edited into the URL by hand. */
const parseEnumList = <Value extends string>(values: Value[]): ParseFn<Value[]> => value => {
  return parseStringList(value)?.filter((item): item is Value => (values as string[]).includes(item))
}

/** The filters a user sets on the list. In an app they are kept in the URL. */
export const useQueryParamsPlants = createUseQueryParams({
  search: parseString,
  ordering: parseString,
  kind__in: parseEnumList(Object.values(Kind)),
  light__in: parseEnumList(Object.values(Light)),
  watered: parseBoolean,
  caretaker: parseId,
})

export type QueryParamsPlants = typeof useQueryParamsPlants['QueryParams'] & {
  page?: number
  /** Comma-separated ids — how async selects look up the items behind their model value. */
  id__in?: string
}

let source = plants

/** Stands in for a request to the API: answers after a moment with a copy of the data. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 300)
})

const toSortable = (value: Plant[keyof Plant]) => value instanceof Date ? value.getTime() : value

/** Sorts in `direction`, with empty values last either way. */
const compare = (a: Plant, b: Plant, field: keyof Plant, direction: 1 | -1) => {
  const left = toSortable(a[field])
  const right = toSortable(b[field])

  if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1

  return direction * (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right)))
}

/** Filters and sorts by the same query params a backend would receive. */
const filterPlants = (queryParams: QueryParamsPlants | undefined) => {
  const {kind__in, light__in, watered, caretaker} = queryParams ?? {}
  const search = queryParams?.search?.trim().toLowerCase()
  const ids = queryParams?.id__in?.split(',').map(Number)
  let result = search
    ? source.filter(plant => plant.name.toLowerCase().includes(search) || plant.species.toLowerCase().includes(search))
    : source

  if (ids) result = result.filter(plant => ids.includes(plant.id))
  if (kind__in) result = result.filter(plant => kind__in.includes(plant.kind))
  if (light__in) result = result.filter(plant => light__in.includes(plant.light))
  if (watered !== undefined) result = result.filter(plant => plant.watered === watered)
  if (caretaker) result = result.filter(plant => plant.caretaker.id === caretaker)

  if (queryParams?.ordering) {
    const ordering = parseOrdering<keyof Plant>(queryParams.ordering)

    // Each next field breaks the ties of the ones before it.
    result = result.toSorted((a, b) => {
      for (const {field, order} of ordering) {
        const difference = compare(a, b, field, order === Order.DESC ? -1 : 1)

        if (difference !== 0) return difference
      }

      return 0
    })
  }

  return result
}

export const plantModelApi = createRestModelApi({
  modelKey: 'Plant',
  model: {} as Plant,
  queries: {
    item: {
      scope: 'item',
      dataType: {} as Plant,
      isQueryParams: isId,
      queryFn: ({queryKey}) => respond(() => source.find(plant => plant.id === queryKey[2])!),
      actions: {
        // In an app, a PATCH to `/plants/<id>/`.
        update: ({set}, id, payload: Partial<Plant>) => respond(() => {
          source = source.map(plant => plant.id === id ? {...plant, ...payload} : plant)

          return source.find(plant => plant.id === id)!
        })
          .then(plant => {
            // Puts the saved plant into every cached page that holds it.
            set(plant)

            return plant
          }),

        // In an app, a DELETE to `/plants/<id>/`.
        delete: (context, id) => respond(() => {
          source = source.filter(plant => plant.id !== id)
        })
          // Drops the plant from every cached page.
          .then(() => () => null),
      },
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Plant>,
      isQueryParams: (value: unknown): value is QueryParamsPlants | undefined => value === undefined || value instanceof Object,
      // In an app, a GET to `/plants/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterPlants(queryKey[2]), queryKey[2]?.page, 10)),
    },
  },
})
```

<!-- @source-end -->

:::

### Fields

Each field is a module with two exports: the component (default) renders the cell, and `meta` describes the column. Keep both in one file — the column cannot drift from what it renders.

- `label` is the column's stable id: it keys the saved column config and names the area in `cardAreas`.
- `field` makes the column sortable — its value is sent as `ordering` (`height`, `-height`).
- `textFormat` gives a plain-text value for CSV export and "copy as Markdown", for cells that render components or format the value for display — like the water-by date, which is shown short and exported in full.
- `allow-open` on `WListCardField` makes that cell toggle the expansion row.
- A cell can render anything inside `WListCardField` — a tag in the kind's tone, a sparkline, a meter. Keep it one line high so the row height stays the same, and give it a `textFormat` for export.

::: code-group

<!-- @source docs/examples/recipes/plant-list/fields/WFieldPlantName.vue WFieldPlantName.vue -->

```vue [WFieldPlantName.vue]
<template>
  <WListCardField
    :model-value="item.name"
    :skeleton="skeleton"
    allow-open
    class="font-semibold"
  />
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'name',
  cssClass: 'flex-1 basis-[12rem]',
  title: 'Name',
  field: 'name',
  allowResize: true,
} as const satisfies ListField<Plant>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/fields/WFieldPlantGrowth.vue WFieldPlantGrowth.vue -->

```vue [WFieldPlantGrowth.vue]
<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <span class="tone-data-green flex items-center gap-2">
      <!-- A sparkline of the last six months, scaled to the plant's own range. -->
      <svg
        viewBox="0 0 50 16"
        class="text-tone h-4 w-12 shrink-0 overflow-visible"
        fill="none"
      >
        <polyline
          :points="points"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-bind="last"
          r="2"
          fill="currentColor"
        />
      </svg>

      <span class="text-tone text-xs font-semibold tabular-nums">+{{ gain }} cm</span>
    </span>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import {computed} from 'vue'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

const props = defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()

const coordinates = computed(() => {
  const heights = props.item.growth.map(point => point.height)
  const min = Math.min(...heights)
  const range = Math.max(...heights) - min || 1

  return heights.map((height, index) => ({cx: index * 10, cy: 15 - (height - min) / range * 14}))
})

const points = computed(() => coordinates.value.map(({cx, cy}) => `${ cx },${ cy }`).join(' '))
const last = computed(() => coordinates.value[coordinates.value.length - 1])
const gain = computed(() => getGain(props.item))
</script>

<script lang="ts">
const getGain = (item: Plant) => item.height - item.growth[0]!.height

export const meta = {
  label: 'growth',
  cssClass: 'basis-[8rem]',
  title: 'Growth',
  textFormat: item => `+${ getGain(item) } cm`,
} as const satisfies ListField<Plant>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/fields/WFieldPlantStatus.vue WFieldPlantStatus.vue -->

```vue [WFieldPlantStatus.vue]
<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
  >
    <WChip
      :text="item.watered ? 'Watered' : 'Thirsty'"
      :semantic-type="item.watered ? SemanticType.POSITIVE : SemanticType.WARNING"
      :skeleton="skeleton"
    />
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'watered',
  cssClass: 'basis-[7rem]',
  title: 'Status',
  field: 'watered',
  textFormat: item => item.watered ? 'Watered' : 'Thirsty',
} as const satisfies ListField<Plant>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/fields/WFieldPlantWaterBy.vue WFieldPlantWaterBy.vue -->

```vue [WFieldPlantWaterBy.vue]
<template>
  <WListCardField
    :skeleton="skeleton"
    allow-open
    :class="{
      'text-description': !item.waterBy,
      'tone-negative text-tone': item.waterBy && item.waterBy < today,
    }"
    class="card:text-xs"
  >
    <template #inner>
      <span class="list:hidden">{{ meta.title }}: </span>
      {{ item.waterBy ? dateFormatShort(item.waterBy) : '-' }}
    </template>
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {dateFormat, dateFormatShort, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Plant>>()

defineEmits<{
  (e: 'update:item', value: Plant): void
  (e: 'delete:item'): void
}>()

// Overdue plants are shown in red.
const today = getStartOfDay()
</script>

<script lang="ts">
export const meta = {
  label: 'due',
  cssClass: 'basis-[8rem]',
  title: 'Water by',
  field: 'waterBy',
  textFormat: item => item.waterBy ? dateFormat(item.waterBy) : undefined,
} as const satisfies ListField<Plant>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/fields/index.ts fields/index.ts -->

```ts [fields/index.ts]
import type {QueryParamsPlants} from '../api/Plant'
import type {Plant} from '../models/Plant'

import type {ListFields} from 'eco-vue-js/dist/components/List/types'
import {getDefaultFieldConfigMap} from 'eco-vue-js/dist/utils/utils'

import * as FieldPlantCaretaker from './WFieldPlantCaretaker.vue'
import * as FieldPlantGrowth from './WFieldPlantGrowth.vue'
import * as FieldPlantHealth from './WFieldPlantHealth.vue'
import * as FieldPlantHeight from './WFieldPlantHeight.vue'
import * as FieldPlantHumidity from './WFieldPlantHumidity.vue'
import * as FieldPlantKind from './WFieldPlantKind.vue'
import * as FieldPlantLight from './WFieldPlantLight.vue'
import * as FieldPlantName from './WFieldPlantName.vue'
import * as FieldPlantSeeds from './WFieldPlantSeeds.vue'
import * as FieldPlantSpecies from './WFieldPlantSpecies.vue'
import * as FieldPlantStatus from './WFieldPlantStatus.vue'
import * as FieldPlantWater from './WFieldPlantWater.vue'
import * as FieldPlantWaterBy from './WFieldPlantWaterBy.vue'

export const listFieldsPlant = [
  FieldPlantName,
  FieldPlantSpecies,
  FieldPlantKind,
  FieldPlantLight,
  FieldPlantHeight,
  FieldPlantGrowth,
  FieldPlantHealth,
  FieldPlantWater,
  FieldPlantHumidity,
  FieldPlantSeeds,
  FieldPlantCaretaker,
  FieldPlantStatus,
  FieldPlantWaterBy,
] as const satisfies ListFields<Plant, QueryParamsPlants>

// Columns shown until the user changes them in the header settings. `species`, `height`, `water` and `seeds` start hidden.
export const defaultFieldConfigMapPlant = getDefaultFieldConfigMap(listFieldsPlant, [
  'name',
  'kind',
  'light',
  'growth',
  'health',
  'humidity',
  'caretaker',
  'watered',
  'due',
])
```

<!-- @source-end -->

:::

`as const satisfies ListFields<…>` keeps the tuple literal, which is what lets TypeScript check the labels in `getDefaultFieldConfigMap` and `cardAreas` — a typo in either is a type error.

### Filters

`WListFilter` edits the same query params the list reads. Wrap it in a `WUniform` over `queryParams` and pass the `scope` down; `search` adds the search field. Without `global`, the filters sit above the list as chips: the add button offers the rest, and each chip opens its control in a dropdown and shows how many values are set.

Each filter is a module like a field: the component renders the control inside a `WUniform` bound to its param, and `meta` gives the chip's `title`, `icon` and the `fields` it sets — removing the chip clears them. The control is the same one a form would use: a `WSelect` for kinds, a `WCheckboxGroupMultiple` for light, a radio `WCheckboxGroup` for watered, where `undefined` means "Any", and a `WSelectSingle` for the caretaker. The two selects reuse option components from the [Select](/components/select) examples — the tone tag and the gardener with their week of watering — so a kind looks the same in the filter as in its column.

`embedded: true` in `meta` drops the dropdown's padding, and `:embedded="!global"` drops the control's title and margin, so the control fills the dropdown edge to edge — the chip already names it. With `global` the filters go into the app shell's filter panel instead, where each control keeps its title.

::: code-group

<!-- @source docs/examples/recipes/plant-list/filter/WFilterPlantKind.vue WFilterPlantKind.vue -->

```vue [WFilterPlantKind.vue]
<template>
  <WUniform
    v-bind="scope"
    field="kind__in"
    title="Kind"
  >
    <template #field="scopeField">
      <WSelect
        v-bind="scopeField"
        :options="options"
        :value-getter="item => item.id"
        :search-fn="(item, search) => item.name.toLowerCase().includes(search)"
        :option-component="markRaw(OptionToneTag)"
        :readonly="readonly"
        placeholder="Search kinds"
        :embedded="!global"
        class="min-w-60"
      />
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from '../api/Plant'

import {markRaw} from 'vue'

import type {FilterEmits, FilterMeta, FilterProps} from 'eco-vue-js/dist/components/List/types'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconPlant from 'eco-vue-js/dist/assets/icons/IconPlant'

import OptionToneTag, {type ToneTag} from '../../../shared/OptionToneTag.vue'
import {Kind} from '../models/Plant'
import {kindDisplay} from '../models/PlantDisplay'

defineProps<FilterProps<QueryParamsPlants>>()
defineEmits<FilterEmits>()

// The same tags as the kind column, in the shape the shared tag option takes.
const options: ToneTag<Kind>[] = Object.values(Kind).map(id => ({id, ...kindDisplay[id]}))
</script>

<script lang="ts">
export const meta = {
  title: 'Kind',
  icon: markRaw(IconPlant),
  fields: ['kind__in'],
  // The control fills the filter's dropdown edge to edge, so the dropdown drops its padding.
  embedded: true,
} as const satisfies FilterMeta<QueryParamsPlants>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/filter/WFilterPlantWatered.vue WFilterPlantWatered.vue -->

```vue [WFilterPlantWatered.vue]
<template>
  <WUniform
    v-bind="scope"
    field="watered"
  >
    <template #field="scopeField">
      <!-- `undefined` is "Any": it drops the param, so the filter shows every plant. -->
      <WCheckboxGroup
        v-bind="scopeField"
        :list="[undefined, true, false]"
        radio
        :readonly="readonly"
        :embedded="!global"
        class="w-full"
        option-class="w-full"
      >
        <template #option="{option}">
          <div class="flex h-8 items-center">
            {{ option === true ? 'Watered' : option === false ? 'Thirsty' : 'Any' }}
          </div>
        </template>
      </WCheckboxGroup>
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from '../api/Plant'

import {markRaw} from 'vue'

import type {FilterEmits, FilterMeta, FilterProps} from 'eco-vue-js/dist/components/List/types'

import WCheckboxGroup from 'eco-vue-js/dist/components/Checkbox/WCheckboxGroup.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'

defineProps<FilterProps<QueryParamsPlants>>()
defineEmits<FilterEmits>()
</script>

<script lang="ts">
export const meta = {
  title: 'Watered',
  icon: markRaw(IconDrop),
  fields: ['watered'],
  embedded: true,
} as const satisfies FilterMeta<QueryParamsPlants>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/filter/index.ts filter/index.ts -->

```ts [filter/index.ts]
import type {QueryParamsPlants} from '../api/Plant'

import type {FilterComponent} from 'eco-vue-js/dist/components/List/types'

import * as FilterPlantCaretaker from './WFilterPlantCaretaker.vue'
import * as FilterPlantKind from './WFilterPlantKind.vue'
import * as FilterPlantLight from './WFilterPlantLight.vue'
import * as FilterPlantWatered from './WFilterPlantWatered.vue'

// In the order they are offered by the add-filter button.
export const listFilterPlant = [
  FilterPlantKind,
  FilterPlantLight,
  FilterPlantWatered,
  FilterPlantCaretaker,
] satisfies FilterComponent<QueryParamsPlants>[]
```

<!-- @source-end -->

:::

### Row menu

Menu items receive the row and call the model's actions. The actions update the cached pages themselves, so the list changes without a refetch. The menu also gets `updateItem` and `deleteItem`, which write the row to the cache or remove it without a request — e.g. to drop a row that was never saved.

Always type menu components with `MenuProps<T>` and `MenuEmits<T>` from the kit — a hand-written props shape breaks when the kit adds a prop.

::: code-group

<!-- @source docs/examples/recipes/plant-list/menu/WMenuPlantToggle.vue WMenuPlantToggle.vue -->

```vue [WMenuPlantToggle.vue]
<template>
  <WButtonMoreItem
    :text="item.watered ? 'Mark as dry' : 'Mark as watered'"
    :icon="markRaw(item.watered ? IconSun : IconDrop)"
    :disabled="readonly"
    @click="toggle"
  />
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {handleApiError} from 'eco-vue-js/dist/utils/api'
import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'
import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import {plantModelApi} from '../api/Plant'

const props = defineProps<MenuProps<Plant>>()

defineEmits<MenuEmits<Plant>>()

const toggle = () => plantModelApi.item.actions
  // The action puts the saved plant into every cached page that holds it, so the row updates without a refetch.
  .update(props.item.id, {
    watered: !props.item.watered,
    // Dry soil needs water within three days.
    waterBy: props.item.watered ? addDay(getStartOfDay(), 3) : null,
  })
  .then(plant => Notify.success({title: plant.watered ? 'Marked as watered' : 'Marked as dry'}))
  .catch(handleApiError)
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/plant-list/menu/WMenuPlantDelete.vue WMenuPlantDelete.vue -->

```vue [WMenuPlantDelete.vue]
<template>
  <WButtonMoreItem
    text="Remove"
    :icon="markRaw(IconTrash)"
    :disabled="readonly"
    @click="remove"
  />
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {handleApiError} from 'eco-vue-js/dist/utils/api'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

import {plantModelApi} from '../api/Plant'

const props = defineProps<MenuProps<Plant>>()

defineEmits<MenuEmits<Plant>>()

const remove = () => {
  Modal.addConfirm({
    title: 'Remove plant',
    description: `"${ props.item.name }" will be removed from the collection.`,
    acceptText: 'Remove',
    acceptSemanticType: SemanticType.NEGATIVE,
    // The modal shows a loading state until the action resolves, which also drops the plant from every cached page.
    onAccept: () => plantModelApi.item.actions.delete(props.item.id).catch(handleApiError),
  })
}
</script>
```

<!-- @source-end -->

:::

`Modal.addConfirm` keeps the dialog open with a spinner while `onAccept`'s promise is pending, closes it when the promise resolves, and leaves it open if it rejects — so return the action's promise.

### Expansion

The expansion gets the row's `item` and has the full width of the list, so it can hold what does not fit in a cell: here the care facts, a growth chart with a tooltip per month, a four-week watering calendar and the next tasks. While the row loads, `skeleton` is set and `item` may be `undefined` — each section shows its own placeholder.

<!-- @source docs/examples/recipes/plant-list/PlantContent.vue PlantContent.vue -->

```vue [PlantContent.vue]
<template>
  <div class="grid gap-4 py-2 md:grid-cols-3">
    <!-- Care: what the plant needs, each fact in its own tone. -->
    <section class="grid content-start gap-3 p-4 rounded-2xl bg-surface-subtle">
      <WSkeleton
        v-if="skeleton || !item"
        class="w-skeleton-h-20"
      />

      <template v-else>
        <p class="text-description text-sm">
          {{ item.description }}
        </p>

        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="fact in getFacts(item)"
            :key="fact.title"
            class="flex items-center gap-2"
            :class="fact.tone"
          >
            <span class="surface-soft text-tone flex size-8 shrink-0 items-center justify-center rounded-full">
              <component
                :is="fact.icon"
                class="square-4"
              />
            </span>

            <span class="grid min-w-0">
              <span class="text-description truncate text-xs">{{ fact.title }}</span>
              <span class="truncate text-sm font-semibold tabular-nums">{{ fact.value }}</span>
            </span>
          </div>
        </div>
      </template>
    </section>

    <!-- Growth: the six-month height as a chart, with a tooltip per month. -->
    <section class="grid content-start gap-1 p-4 rounded-2xl bg-surface-subtle">
      <h4 class="flex items-baseline justify-between text-sm font-semibold">
        Growth
        <span
          v-if="item && !skeleton"
          class="tone-data-green text-tone text-xs tabular-nums"
        >+{{ item.height - item.growth[0]!.height }} cm in 6 months</span>
      </h4>

      <WChartLinear
        :x-domain="xDomain"
        :height="176"
        :skeleton="skeleton || !item"
        y-hidden
      >
        <template #default="scope">
          <WChartLine
            v-if="item"
            v-bind="scope"
            :data="item.growth.toReversed()"
            x-key="date"
            y-key="height"
            has-area
            calc-min
            class="tone-data-green text-tone"
          >
            <template #tooltip="{d, prev}">
              <div class="grid text-sm text-start">
                <span class="text-description">{{ dateFormatShort(new Date(d.date)) }}</span>
                <span>
                  <span class="font-semibold">{{ d.height }} cm</span> <span
                    v-if="prev"
                    class="text-description"
                  >+{{ d.height - prev.height }} cm that month</span>
                </span>
              </div>
            </template>
          </WChartLine>
        </template>
      </WChartLinear>
    </section>

    <!-- Schedule: a four-week watering calendar and the next tasks. -->
    <section class="grid content-start gap-4 p-4 rounded-2xl bg-surface-subtle">
      <div class="grid gap-2">
        <h4 class="flex items-baseline justify-between gap-4 text-sm font-semibold">
          Watering
          <span
            v-if="item && !skeleton"
            class="text-description text-xs font-normal"
          >{{ item.waterings.length }} times in 4 weeks</span>
        </h4>

        <WSkeleton
          v-if="skeleton || !item"
          class="w-skeleton-h-16"
        />

        <!-- One square a day, oldest first, filled on the days it was watered. -->
        <div
          v-else
          class="tone-data-blue grid grid-cols-7 gap-1"
        >
          <span
            v-for="day in days"
            :key="+day"
            class="h-3.5 rounded-sm"
            :class="item.waterings.some(watering => isSameDate(watering, day)) ? 'bg-tone-fill' : 'bg-tone-soft'"
            :title="dateFormat(day)"
          />
        </div>
      </div>

      <div class="grid gap-1.5">
        <h4 class="text-sm font-semibold">
          Next up
        </h4>

        <WSkeleton
          v-if="skeleton || !item"
          class="w-skeleton-h-16"
        />

        <ul
          v-else
          class="grid gap-1"
        >
          <li
            v-for="task in item.tasks"
            :key="task.title"
            class="flex items-center justify-between gap-2 text-sm"
          >
            {{ task.title }}

            <WChip
              :text="getDueText(task.due)"
              :semantic-type="task.due < today ? SemanticType.NEGATIVE : task.due <= soon ? SemanticType.WARNING : SemanticType.SECONDARY"
            />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import type {QueryParamsPlants} from './api/Plant'
import type {Plant} from './models/Plant'

import {markRaw} from 'vue'

import type {FieldProps} from 'eco-vue-js/dist/components/List/types'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {addDay, addMonth, dateFormat, dateFormatShort, getStartOfDay, isSameDate} from 'eco-vue-js/dist/utils/dateTime'

import WChartLine from 'eco-vue-js/dist/components/Chart/WChartLine.vue'
import WChartLinear from 'eco-vue-js/dist/components/Chart/WChartLinear.vue'
import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'
import IconThermometer from 'eco-vue-js/dist/assets/icons/IconThermometer'
import IconWind from 'eco-vue-js/dist/assets/icons/IconWind'

import {lightDisplay} from './models/PlantDisplay'

defineProps<Omit<FieldProps<Plant | undefined, QueryParamsPlants>, 'config'>>()

const today = getStartOfDay()
const soon = addDay(today, 3)
const xDomain: [number, number] = [+addMonth(today, -5), +today]

// The last four weeks, oldest first.
const days = Array.from({length: 28}, (_, index) => addDay(today, index - 27))

const getFacts = (item: Plant) => [
  {title: 'Light', value: lightDisplay[item.light].name, tone: lightDisplay[item.light].tone, icon: lightDisplay[item.light].icon},
  {title: 'Water', value: `${ item.water } ml`, tone: 'tone-data-blue', icon: markRaw(IconDrop)},
  {title: 'Humidity', value: `${ item.humidity }%`, tone: 'tone-data-cyan', icon: markRaw(IconWind)},
  {title: 'Temperature', value: `${ item.temperature[0] }–${ item.temperature[1] } °C`, tone: 'tone-data-red', icon: markRaw(IconThermometer)},
]

const getDueText = (due: Date) => {
  const left = Math.round((+due - +today) / 86_400_000)

  if (left < 0) return `${ -left } d overdue`
  if (left === 0) return 'Today'
  return `In ${ left } d`
}
</script>
```

<!-- @source-end -->

## Why it is built this way

- **One component per column** makes columns reusable across lists of the same model, lets each cell own its formatting and loading state, and keeps the column list declarative, so `WList` can reorder, hide and resize columns without knowing what they render.
- **Query params are the whole state.** Search, filters and ordering go into `queryParams`; `WList` adds `page` and emits `update:query-params` when the user sorts. With `createUseQueryParams` they live in the route query, so the list is linkable and survives reloads.
- **Card layout is data, not markup.** `cardColumns` and `cardAreas` place the same field components into a CSS grid for the mobile card view, using the field labels as area names. `area_select` and `area_more` place the checkbox and the menu. Name every field, including ones hidden by default: a field left out still renders in card mode, in an extra column the grid adds for it. A row whose fields are all hidden drops out, so the `water`/`seeds` and `kind` rows cost nothing until the user shows those columns.
- **Cache updates instead of refetching.** The model's actions update the item in every cached page, so the user keeps their scroll position and loaded pages.

## Variations

- **Filters in the app shell**: pass `global` to `WListFilter` to put the filters into the actions bar's panel and the search into the header bar, with a button that resets them. `disabledFilterFields` leaves out filters for params the page fixes, e.g. `caretaker` on a caretaker's own page.
- **Bulk actions**: pass `bulk` with components typed by `BulkProps<QueryParams>`; they get a `queryParamsGetter` that describes the current selection.
- **Toolbar actions** (e.g. "Create"): pass `action` with components typed by `ActionProps<QueryParams>`.
- **Nested columns**: a field's `meta` can be `{keyEntity, fields}` or `{keyArray, fields}` to render columns of a related object or of every item in an array.
- **Embedded lists**: a list is sized as a page by default — it reserves the viewport height. Inside a card, tab or docs page like this one, pass `min-height` to drop that.
- **Read-only rows**: `readonlyGetter` marks individual rows read-only; menu items receive `readonly` and should disable themselves.
