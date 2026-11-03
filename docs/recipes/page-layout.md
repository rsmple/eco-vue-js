---
group: Recipes
order: 0
description: The rules every page follows — the main area is w-page, a page is a stack of sections, page lists, tabs and rows of cards, and the kit places them at every width and in every layout style, so a page sets no padding or positioning of its own.
---

# Page layout

**Problem:** a page has to line up with the app's bars, span the screen on phones, keep clear of the screen's bottom edge, stay in view while a wide list scrolls sideways, and look right as flat content, as cards and as glass. Done by hand, every page carries its own padding, sticky wrappers and phone fixes, and they drift apart.

**Pattern:** the app's main area is `w-page`, and a page is built only from the blocks below. The kit places them, so a page sets no padding, margin or positioning of its own.

## The main area

`w-page` goes on the element the router renders pages into (see [App shell](/guide/app-shell#layout-component)). It:

- pads the page by the frame: under the header bar, between the nav and the actions bar, `--w-left-inner` and `--w-right-inner` at every width;
- leaves room under the last block: `--w-page-end` (`4rem`) in flat, where the page ends on the canvas, and the bars' gap, `--w-chrome-gap`, when they float;
- sets the phone inset, `--w-page-inset`, that sections and page lists reach out by to span the screen;
- keeps what is beside a wide list in view (see [Content beside a wide list](#content-beside-a-wide-list)).

When the app's layout already puts something before the main area, such as a grid column for the nav, `--w-page-start` is its width, and the padding leaves it out:

```vue
<main class="w-page col-start-2 [--w-page-start:var(--nav-bar-width)]">
  <RouterView />
</main>
```

## Blocks

Blocks one after another on the page are the theme's section gap apart, through any wrappers: a page needs no stack only to keep them from touching. Put them in `surface-stack-divided` when they should read apart in flat too, such as the groups of a settings page, or in `surface-stack` when other content between them, such as a line of text, should keep the gap too. Each block is one of these:

| Block | For | How |
| --- | --- | --- |
| Section | A form, a settings group, text, a grid of cards that belong together | `WSection` |
| Page list | The list the page is about, scrolling with the window | `WList` straight on the page, not in a section |
| Tabs over lists | Several lists, one per tab | `WTabs` with `section`: the tab row is the top of the open list's section |
| Form in tabs | A long form whose tabs are all shown on the page | `WTabs` with `flat`: each tab is a section |
| Danger zone | An action that can't be undone, such as deleting the item | `WSection` with `semanticType` `NEGATIVE`, last on the page. When a page list ends the page, it scrolls on and on: the button goes in the `footer` of the item's section instead |
| Row of cards | Stats or tiles on the canvas, not in a section | `WCard`s in a grid with `w-page-bleed` |

Content fills its section: the frame stops growing at `--w-content-max-width`, so a section is never too wide for fields, and a `max-w-*` on a page's content only leaves an empty side. A group of fields or text with a heading of its own is a section of its own, not a heading inside one.

A heading goes in its section, as `title`. The one exception is a line above a page list, such as a description or a counter: it is not in a section, and it stays in view beside the list.

### Side by side

Sections side by side are a grid with `surface-columns`, which spaces them by `--w-section-gap` in card and glass, with room for the parts that reach into the gutter, and by `--w-columns-gap` (`2rem`) in flat. When the first column is a page list, such as a list of items beside the open one, wrap the list in `w-page-column`: its section, stuck toolbar and bottom edge keep to the column.

```vue
<template>
  <div class="surface-columns grid lg:grid-cols-[24rem_1fr] lg:items-start">
    <WSection title="Sequence" />

    <WSection title="Job" />
  </div>
</template>
```

## Variants

**Form page.** Sections in `surface-stack-divided`, a danger zone last, the Save in a section's `footer` (see [Settings page](/recipes/settings-page)).

```vue
<div class="surface-stack-divided">
  <WSection title="General" />
  <WSection title="Notifications" />
  <WSection title="Danger zone" :semantic-type="SemanticType.NEGATIVE" />
</div>
```

**List page.** The page list, with a description or filters above it when it needs them (see [List page](/recipes/list-page)).

```vue
<p class="text-description">Every plant in the garden.</p>

<WList :use-query-fn="plantModelApi.paginated.use" :fields="listFieldsPlant" />
```

**Item page with tabs.** A section with the item's header, then tabs over its lists, or a form in a tab as a stack of sections.

```vue
<div class="surface-stack">
  <WSection :title="plant.name" />

  <WTabs section>
    <WTabsItem name="beds" title="Beds">
      <BedList />
    </WTabsItem>
  </WTabs>
</div>
```

**Dashboard.** Rows of cards and sections in a stack.

```vue
<div class="surface-stack">
  <div class="w-page-bleed grid grid-cols-2 gap-3 lg:grid-cols-4">
    <WCard v-for="stat in stats" :key="stat.title" :title="stat.title" />
  </div>

  <WSection title="Recent" />
</div>
```

## What the kit does

- **Phones.** Sections and page lists span the screen, their content at the page inset, and a section's edges and corners go. Rows of cards and other content keep the inset.
- **The bottom.** The main area leaves the room under the page, in every layout style.
- **Between blocks.** Sections, page lists, rows of cards and tab sections one after another are the section gap apart, unless they are in a grid or a flex box, which spaces them itself.
- **Content beside a wide list.** A list wider than the screen scrolls the window sideways. Everything beside it, a section, a description, a filter or a form, and the wrappers around them however deep the list is, sticks to the left inset and keeps the page's width. The list's own toolbar, header, empty state and error stay in view too. The same holds in a modal, for content beside a list in it.
- **Stuck to the bottom.** A bar stuck to the bottom of the screen, such as an item's actions in a list row, is `sticky bottom---bottom-inner bg-surface`. `--w-bottom-inner` is the room the kit keeps at the bottom: a page list's bottom edge in card and glass, a modal's footer in a modal, none in flat. In a page list the bar paints the section behind it, as the stuck header does.
- **Nesting.** A section in a section, or in a modal, is a part of it: no surface, a smaller heading and a line above it. A card in a section is filled and flat.

## Don't

- Padding or margins for the page's edges on a page or its wrappers: `px-*`, `pb-*`, `sm-not:px---inner-margin`. The main area and the blocks set them.
- `---left-inner`, `---width-inner` and `sticky` to keep content in view beside a list, or a wrapper for it. They stay for what the kit doesn't place, such as a fixed overlay over the page.
- A `WSection` around a page list: the list draws its own section.
- `max-w-*` on a page's content, or headings and `pb-*` spacers between groups in one section: split them into sections.
- A `WInfoCard` as the only content of a section, such as a danger zone: give the section a `semanticType`.
- A gap of your own between sections side by side: in card and glass they reach into it, and touch. Use `surface-columns`.
