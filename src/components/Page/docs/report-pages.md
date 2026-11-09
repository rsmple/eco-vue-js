---
group: Data
description: WPage — A4 pages for printable reports, with numbered sections, a footer with logo, date and page number, and content that continues on the next page; WPageTitle, WPageNumerator and WPageBreadcrumbs.
---

# Report pages

`WPage` is an A4 report page for screen and browser print: 21 × 29.7 cm with print margins, one sheet per page. The footer has a logo (`logoComponent` or `logo` slot), the `date` and the page number; `watermark` adds large faint text like "Draft".

A `title` starts a numbered section, with the number and an `eyebrow` above and the `meta` slot beside. `WPageTitle` is an in-page heading in the same sequence; `big` makes a cover heading. Wrap pages in `WPageNumerator` to number from 1; `empty` excludes a page (e.g. the cover) from the count.

`WPageBreadcrumbs` lists page titles, marks the one in view and scrolls on click — put it in the report view's header.

<!-- @example Page/Basic -->

<DocsDemo name="Page/Basic" />

```vue
<template>
  <div class="grid gap-4">
    <WPageBreadcrumbs />

    <div class="h-[40rem] overflow-auto rounded-xl bg-surface-muted p-4">
      <WPageNumerator class="grid justify-center gap-4 [zoom:0.5]">
        <WPage
          :date="date"
          watermark="Draft"
          empty
        >
          <div class="grid h-full content-center gap-4">
            <WPageTitle
              title="Greenhouse survey"
              big
            />

            <span class="text-2xl text-subtle">Riverside community garden</span>
          </div>
        </WPage>

        <WPage
          title="Summary"
          eyebrow="Overview"
          :date="date"
          watermark="Draft"
        >
          <template #meta>
            Site: greenhouse 2<br>
            Surveyor: J. Doe
          </template>

          <div class="grid gap-4 text-lg">
            <p>{{ observations.length }} observations, a third of them high priority.</p>

            <p>
              <WPageTitle title="Method" />
            </p>

            <p>A walk along every bench, checking the leaves, roots and soil, with readings from the moisture sensors.</p>
          </div>
        </WPage>

        <WPage
          title="Observations"
          :date="date"
          watermark="Draft"
        >
          <template #header>
            <div class="grid grid-cols-[4rem_1fr_6rem] border-b border-solid border-line-subtle py-2 font-semibold">
              <span>#</span><span>Observation</span><span>Priority</span>
            </div>
          </template>

          <!-- Rows of a `w-page-inner` element move one by one, so the table continues on the next page. -->
          <div class="w-page-inner">
            <div
              v-for="(item, index) in observations"
              :key="index"
              class="border-b border-solid border-line-raised py-3 text-lg"
            >
              <!-- One element inside, so the row moves whole. -->
              <div class="grid grid-cols-[4rem_1fr_6rem]">
                <span class="text-subtle">{{ index + 1 }}</span>
                <span>{{ item.title }}</span>
                <span>{{ item.priority }}</span>
              </div>
            </div>
          </div>
        </WPage>
      </WPageNumerator>
    </div>
  </div>
</template>

<script lang="ts" setup>
import WPage from 'eco-vue-js/dist/components/Page/WPage.vue'
import WPageBreadcrumbs from 'eco-vue-js/dist/components/Page/WPageBreadcrumbs.vue'
import WPageNumerator from 'eco-vue-js/dist/components/Page/WPageNumerator.vue'
import WPageTitle from 'eco-vue-js/dist/components/Page/WPageTitle.vue'

const date = new Date(2026, 8, 30)

const TITLES = ['Root rot in the aloe', 'Spider mites on the monstera', 'Powdery mildew on the courgettes', 'Leggy basil seedlings', 'Yellow tips on the fern', 'Aphids on the roses']
const PRIORITIES = ['High', 'High', 'Medium', 'Low', 'Low', 'Medium']

const observations = Array.from({length: 36}, (_, index) => ({title: TITLES[index % TITLES.length]!, priority: PRIORITIES[index % PRIORITIES.length]!}))
</script>
```

<!-- @example-end -->

## Content that doesn't fit

Content is measured after render. Blocks that don't fit move to a continuation page, which repeats the title (small) and the `header` slot (e.g. a table header), until everything fits. Blocks move whole by default. Children of a `w-page-inner` element (the slot's `INNER_CLASS`) move one by one into a copy of it, so long lists continue. A child with zero or one element moves whole; one with several is a group whose children move individually — wrap a row's cells in one element to keep it together.

While loading, set `skeleton`: overflow stays put until it's `false`. If content resizes later, call the slot's `updateOverflow`.

Content is moved as DOM elements outside Vue, so keep it static after splitting. To show new data, re-render with a new `key`.

## API

<!-- @api WPage -->

### WPage

```ts
import WPage from 'eco-vue-js/dist/components/Page/WPage.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Title of the section the page starts, numbered and listed in WPageBreadcrumbs. Continuation pages repeat it small at the top. |
| `eyebrow` | `string` | — | Caption after the section number above the title. |
| `empty` | `boolean` | — | Leaves the page out of the page count and hides its number, e.g. for a cover. |
| `centerLogo` | `boolean` | — | Centers the logo in the footer, in place of the date. |
| `logoComponent` | `Component` | — | Logo in the footer. The `logo` slot replaces it. |
| `topTitle` | `boolean` | — | Shows `title` small at the top instead of as a heading. Set on continuation pages. |
| `date` | `Date` | — | Date in the middle of the footer, such as the date of the report. |
| `prerendered` | `HTMLElement[]` | — | Elements moved from the previous page because they didn't fit. Set on continuation pages. |
| `skeleton` | `boolean` | — | While `true`, content that doesn't fit stays on the page. It is split into continuation pages once loading ends. |
| `watermark` | `string` | — | Large faint text across the page, such as "Draft". |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ updateOverflow: () => void; INNER_CLASS: string; }` | Content of the page. Blocks that don't fit move to a continuation page. Children of an element with the `INNER_CLASS` class (`w-page-inner`) move one by one, so a long list or table continues on the next page. Call `updateOverflow` when the content changes size after loading. |
| `header` | — | Content above the page's content, repeated on continuation pages, such as a table header. |
| `intro` | — | Content under the title, on the first page only. |
| `meta` | — | Content to the right of the title, such as the report's details. |
| `logo` | — | Logo in the footer, replacing `logoComponent`. |

<!-- @api-end -->

<!-- @api WPageTitle -->

### WPageTitle

```ts
import WPageTitle from 'eco-vue-js/dist/components/Page/WPageTitle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | **required** | Text of the heading, after its section number. |
| `big` | `boolean` | — | A large heading, with the number in two digits, e.g. for a cover. |

<!-- @api-end -->

<!-- @api WPageNumerator -->

### WPageNumerator

```ts
import WPageNumerator from 'eco-vue-js/dist/components/Page/WPageNumerator.vue'
```

#### Props

_No props._

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | WPage pages and WPageTitle headings, numbered from 1. |

<!-- @api-end -->

<!-- @api WPageBreadcrumbs -->

### WPageBreadcrumbs

```ts
import WPageBreadcrumbs from 'eco-vue-js/dist/components/Page/WPageBreadcrumbs.vue'
```

#### Props

_No props._

<!-- @api-end -->
