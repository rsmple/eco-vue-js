---
group: Recipes
order: 0
description: The rules every page follows — the main area is w-page, a page is a stack of sections, page lists, tabs and rows of cards, and the kit places them at every width and in every layout style, so a page sets no padding or positioning of its own.
---

# Page layout

**Problem:** a page must line up with the app's bars, span the screen on phones, clear the bottom edge, stay in view while a wide list scrolls sideways, and work in flat, card and glass. By hand, every page carries its own padding, sticky wrappers and phone fixes, and they drift.

**Pattern:** the main area is `w-page`, and pages use only the blocks below. The kit places them — pages set no padding, margin or positioning.

## The main area

Put `w-page` on the router's page outlet (see [App shell](/guide/app-shell#layout-component)). It:

- pads the page inside the frame: under the header, between nav and actions bar, by `--w-left-inner` and `--w-right-inner`;
- leaves room at the end: `--w-page-end` (`4rem`) in flat, `--w-chrome-gap` when bars float;
- sets `--w-page-inset`, the phone inset sections and page lists reach out by;
- keeps content beside a wide list in view (see [below](#content-beside-a-wide-list)).

If the layout puts something before the main area (e.g. a nav grid column), set `--w-page-start` to its width and the padding excludes it:

```vue
<main class="w-page col-start-2 [--w-page-start:var(--nav-bar-width)]">
  <RouterView />
</main>
```

## Blocks

Consecutive blocks are spaced through any wrappers, so pages need no stack: the section gap in card and glass; in flat, `--w-stack-divide` (`2rem`) with a line between sections. Use `surface-stack` only to run blocks together in flat, or to keep the gap around other content between them. Blocks:

| Block | For | How |
| --- | --- | --- |
| Section | A form, settings group, text, a grid of related cards | `WSection` |
| Page list | The page's main list, scrolling with the window | `WList` directly on the page, not in a section |
| Tabs over lists | One list per tab | `WTabs` with `section`: the tab row tops the open list's section |
| Form in tabs | A long form with all tabs shown | `WTabs` with `flat`: each tab is a section |
| Danger zone | Irreversible actions, like deleting the item | `WSection` with `semanticType` `NEGATIVE`, last: a `description` of the consequences, the button in `footer`. If a page list ends the page, put the button in the item section's `footer` instead |
| Row of cards | Stats or tiles on the canvas | `WCard`s in a grid with `w-page-bleed` |

Content fills its section: the frame caps at `--w-content-max-width`, so a `max-w-*` only leaves an empty side. A group with its own heading is its own section, not a heading inside one.

Headings go in their section as `title`. Exception: a line above a page list (description, counter) sits outside a section and stays in view beside the list.

### Side by side

Side-by-side sections are a `surface-columns` grid: `--w-section-gap` in card and glass (leaving room for parts reaching into the gutter), `--w-columns-gap` (`2rem`) in flat. If the first column is a page list, wrap it in `w-page-column` so its section, sticky toolbar and bottom edge keep to the column.

```vue
<template>
  <div class="surface-columns grid lg:grid-cols-[24rem_1fr] lg:items-start">
    <WSection title="Sequence" />

    <WSection title="Job" />
  </div>
</template>
```

## Variants

**Form page.** Sections, a danger zone last, Save in a section's `footer` (see [Settings page](/recipes/settings-page)).

```vue
<WSection title="General" />
<WSection title="Notifications" />
<WSection title="Danger zone" :semantic-type="SemanticType.NEGATIVE" />
```

**List page.** The page list, optionally with a description or filters above (see [List page](/recipes/list-page)).

```vue
<p class="text-description">Every plant in the garden.</p>

<WList :use-query-fn="plantModelApi.paginated.use" :fields="listFieldsPlant" />
```

**Item page with tabs.** A section with the item header, then tabs over lists, or a form tab as stacked sections.

```vue
<WSection :title="plant.name" />

<WTabs section>
  <WTabsItem name="beds" title="Beds">
    <BedList />
  </WTabsItem>
</WTabs>
```

**Dashboard.** Rows of cards and sections.

```vue
<div class="w-page-bleed grid grid-cols-2 gap-3 lg:grid-cols-4">
  <WCard v-for="stat in stats" :key="stat.title" :title="stat.title" />
</div>

<WSection title="Recent" />
```

## What the kit does

- **Phones.** Sections and page lists span the screen with content at the page inset, dropping edges and corners. Card rows and other content keep the inset.
- **The bottom.** The main area leaves room under the page in every style.
- **Between blocks.** Consecutive blocks get the section gap, unless a grid or flex box spaces them.
- **Content beside a wide list.** A list wider than the screen scrolls the window sideways. Everything beside it, and its wrappers at any depth, sticks to the left inset at page width; the list's toolbar, header, empty and error states stay in view. Same in modals.
- **Stuck to the bottom.** A bottom-sticky bar (e.g. row actions) is `sticky bottom---bottom-inner bg-surface`. `--w-bottom-inner` is the reserved bottom room: a page list's bottom edge in card and glass, a modal footer in a modal, none in flat. In a page list the bar paints the section behind it, like the sticky header.
- **Nesting.** A section inside a section or modal becomes a part: no surface, smaller heading, a line above. A card in a section is filled and flat (glass in glass).

## Don't

- Edge padding or margins on a page or its wrappers (`px-*`, `pb-*`, `sm-not:px---inner-margin`) — the main area and blocks set them.
- `---left-inner`, `---width-inner` or `sticky` to keep content beside a list in view. Keep those for what the kit doesn't place, like fixed overlays.
- A `WSection` around a page list — it draws its own.
- `max-w-*` on page content, or headings and `pb-*` spacers inside one section — split into sections.
- A `WInfoCard` as a section's only content (e.g. danger zone) — use the section's `semanticType`.
- Custom gaps between side-by-side sections — use `surface-columns`.
