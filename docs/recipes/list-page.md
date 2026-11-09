---
group: Recipes
order: 3
layout: page
title: List page
description: A page whose WList scrolls with the window — a sticky toolbar under the header, a wide table that scrolls the window sideways, and page content above it that stays in place — and draws its own section in the card and glass layout styles.
---

<div class="grid grid-cols-[1fr]">
<div class="w-page pt-0! [--w-page-start:calc(var(--w-left-inner)-var(--inner-margin))]">
<div class="grid grid-cols-[minmax(0,1fr)] gap-6 pb-6">

<div class="docs-list-page-intro">

<section class="surface-section vp-doc docs-list-page-text">

# List page

**Problem:** the list is the page, not a block on it. The window scrolls it, its toolbar sticks under the header, a too-wide table scrolls the window sideways, and content above stays put — in every layout style.

**Pattern:** render `WList` directly in the main area. A list outside modals and scroll containers, without `min-height`, is a **page list**:

- It scrolls with the window; its toolbar sticks under the header (`--w-header-inner`).
- In card and glass it draws its own section — surface, rounded edges at the stuck toolbar and screen bottom, sticky column backdrop. Don't wrap it in `WSection`.
- A too-wide table scrolls the window sideways, with sticky columns and section edges fixed.

The rest is the app shell and the content beside the list.

## The app shell

The main area is `w-page` in a `1fr` grid track. Sticky boxes stay inside their parent, so content sticking beside a wide list needs a parent as wide as the list: the track grows with the list.

```vue
<template>
  <WHeaderBar />
  <WNavBar />

  <div class="grid grid-cols-[1fr]">
    <main class="w-page">
      <RouterView />
    </main>
  </div>
</template>
```

## Content beside the list

While a page list is present, everything beside it — sections, headings, filters and their wrappers at any depth — sticks to the left inset at page width during horizontal scroll, with no class needed. The list's toolbar, empty and error states stay in view too.

```vue
<template>
  <div class="grid gap-6">
    <WSection title="Plants" />

    <div class="w-page-bleed grid grid-cols-2 gap-3 lg:grid-cols-4">
      <WCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
      />
    </div>
  </div>

  <WList
    :use-query-fn="plantModelApi.paginated.use"
    :fields="listFieldsPlant"
  />
</template>
```

The list is from [List with fields](/recipes/list-with-fields), without `min-height`.

## Try it

Switch the layout style, then scroll the list down past its toolbar, and sideways once columns exceed the screen. This text and the cards above stay put.

<div class="vp-raw max-w-80">
  <ClientOnly>
    <ThemeLayoutSwitch />
  </ClientOnly>
</div>

</section>

<ClientOnly>
  <DocsPageOutline selector=".docs-list-page-text" class="docs-list-page-outline surface-section" />
</ClientOnly>

</div>

</div>

<ClientOnly>
  <ListPage />
</ClientOnly>

</div>
</div>

<script setup>
import DocsPageOutline from '../.vitepress/theme/components/DocsPageOutline.vue'
import ListPage from '../examples/recipes/list-page/ListPage.vue'
</script>
