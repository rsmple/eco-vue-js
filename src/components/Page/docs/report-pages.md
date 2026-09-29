---
group: Data
description: WPage — A4 pages for printable reports, with numbered sections, a footer with logo, date and page number, and content that continues on the next page; WPageTitle, WPageNumerator and WPageBreadcrumbs.
---

# Report pages

`WPage` is an A4 page for a report that is read on screen and printed from the browser. Each page is 21 × 29.7 cm with print margins, and breaks to a new sheet when printed. Its footer has a logo (`logoComponent` or the `logo` slot), the `date` and the page number; `watermark` writes large faint text across it, such as "Draft".

A page with a `title` starts a numbered section: the number and an `eyebrow` caption go above the title, and the `meta` slot to the right of it. `WPageTitle` is a heading inside a page, numbered in the same sequence; `big` makes it a large cover heading. Wrap the pages in `WPageNumerator` so the numbers start from 1. `empty` leaves a page, such as the cover, out of the page count.

`WPageBreadcrumbs` lists the titles of the pages on the screen, marks the one in view and scrolls to a page when clicked — put it in the header of the report view.

<!-- @example Page/Basic -->

<DocsDemo name="Page/Basic" />

```vue
<template>
  <div class="grid gap-4">
    <WPageBreadcrumbs />

    <div class="h-[40rem] overflow-auto rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
      <WPageNumerator class="grid justify-center gap-4 [zoom:0.5]">
        <WPage
          :date="date"
          watermark="Draft"
          empty
        >
          <div class="grid h-full content-center gap-4">
            <WPageTitle
              title="Security review"
              big
            />

            <span class="text-2xl text-gray-400">Acme web app</span>
          </div>
        </WPage>

        <WPage
          title="Summary"
          eyebrow="Overview"
          :date="date"
          watermark="Draft"
        >
          <template #meta>
            Scope: acme.example<br>
            Reviewer: J. Doe
          </template>

          <div class="grid gap-4 text-lg">
            <p>{{ findings.length }} findings, 4 of them high.</p>

            <p>
              <WPageTitle title="Method" />
            </p>

            <p>Manual review of the web app and its API, with automated scans of the dependencies.</p>
          </div>
        </WPage>

        <WPage
          title="Findings"
          :date="date"
          watermark="Draft"
        >
          <template #header>
            <div class="grid grid-cols-[4rem_1fr_6rem] border-b border-solid border-gray-200 py-2 font-semibold">
              <span>#</span><span>Finding</span><span>Severity</span>
            </div>
          </template>

          <!-- Rows of a `w-page-inner` element move one by one, so the table continues on the next page. -->
          <div class="w-page-inner">
            <div
              v-for="(item, index) in findings"
              :key="index"
              class="border-b border-solid border-gray-100 py-3 text-lg"
            >
              <!-- One element inside, so the row moves whole. -->
              <div class="grid grid-cols-[4rem_1fr_6rem]">
                <span class="text-gray-400">{{ index + 1 }}</span>
                <span>{{ item.title }}</span>
                <span>{{ item.severity }}</span>
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

const TITLES = ['SQL injection in search', 'Stored XSS in comments', 'Missing rate limit on login', 'Outdated TLS configuration', 'Verbose error pages', 'Session cookie without Secure']
const SEVERITIES = ['High', 'High', 'Medium', 'Low', 'Low', 'Medium']

const findings = Array.from({length: 36}, (_, index) => ({title: TITLES[index % TITLES.length]!, severity: SEVERITIES[index % SEVERITIES.length]!}))
</script>
```

<!-- @example-end -->

## Content that doesn't fit

Content is measured once it renders. Blocks that don't fit move to a continuation page, which repeats the title small at the top and the `header` slot, such as a table header, and so on until everything fits. By default a block moves whole. The children of an element with the `w-page-inner` class — the slot's `INNER_CLASS` — move one by one instead, so a long list continues where the page ends, inside a copy of that element. A child with one element inside or none moves whole; a child with several is a group, and its own children move one by one into a copy of it — so wrap a row's cells in one element to keep the row together.

While the data loads, set `skeleton`: content that doesn't fit stays on the page until it turns `false`. When content changes size later, call the slot's `updateOverflow`.

Content is moved as DOM elements, outside Vue: after it is split, keep it static. To show new data, re-render the page with a new `key`.

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
