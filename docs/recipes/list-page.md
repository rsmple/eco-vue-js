---
group: Recipes
order: 3
layout: page
title: List page
description: A page whose WList scrolls with the window — a sticky toolbar under the header, a wide table that scrolls the window sideways, and page content above it that stays in place — and draws its own section in the card and glass layout styles.
---

<div class="px-(--inner-margin)">
<div class="grid grid-cols-[1fr]">
<div class="w-page-pb">
<div class="grid grid-cols-[minmax(0,1fr)] gap-6 pb-6">

<div class="docs-list-page-intro">

<section class="surface-section vp-doc docs-list-page-text">

# List page

**Problem:** a list is the page itself, not a block on it. The window should scroll it, its toolbar should stick under the app header, a table wider than the screen should scroll the window sideways, and the page content above it should stay in place while it does — in every layout style.

**Pattern:** render `WList` straight in the app's main area. A list that is not inside a modal or a scroll container, and has no `min-height`, is a **page list**:

- It scrolls with the window and its toolbar sticks under the header (`--w-header-inner`).
- In the card and glass layout styles it draws its own section: the surface behind the rows, rounded edges at the top of the stuck toolbar and at the bottom of the screen, and the backdrop of its sticky columns. Don't put it inside a `WSection`.
- A table wider than the screen scrolls the window sideways, and the sticky columns and the section's edges stay in place.

The rest is in the app shell and the content beside the list.

## The app shell

The main area sits in a `1fr` grid track. A sticky box stays inside its parent, so content that sticks beside a wide list needs a parent as wide as the list: the track grows to the list's width, and the main area with it. `w-page-pb` keeps the last section a gap off the screen's bottom when the bars float.

```vue
<template>
  <WHeaderBar />
  <WNavBar />

  <div class="grid grid-cols-[1fr] pt-(--w-header-inner) pl---left-inner pr---right-inner">
    <main class="w-page-pb">
      <RouterView />
    </main>
  </div>
</template>
```

## Content beside the list

While a page list is on the page, page content sticks to the page's left inset and keeps the page's width when the window scrolls sideways. Sections and rows that bleed into the gutter do this on their own:

| Content | Class |
| --- | --- |
| A section — a form, a settings group, this text | `WSection` or `surface-section` |
| A row of cards on the canvas, reaching into the gutter like a section | `w-page-bleed` |
| Anything else, such as a page title or a toolbar | `w-page-sticky` |

```vue
<template>
  <div class="grid gap-6">
    <WSection title="Plants" />

    <div class="sm:w-page-bleed grid grid-cols-2 gap-3 lg:grid-cols-4">
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

The list is the one from [List with fields](/recipes/list-with-fields), without `min-height`.

## Try it

Switch the layout style, then scroll the list below: down past its toolbar, and sideways once columns are added or widened past the screen. This text and the cards above the list stay in place.

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
</div>

<script setup>
import DocsPageOutline from '../.vitepress/theme/components/DocsPageOutline.vue'
import ListPage from '../examples/recipes/list-page/ListPage.vue'
</script>
