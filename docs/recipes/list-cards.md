---
group: Recipes
order: 2.5
description: Make a WList look finished on the first pass — loading rows as tall as loaded ones in the table and the card, photo-first cards with the select box and menu over the photo, short card lines, fields that share a card row without overlapping, and controls readable on any photo.
---

# List cards and skeletons

**Problem:** a list built only from [List with fields](/recipes/list-with-fields) works, but its loading rows jump when the data arrives, and its cards look like a table row wrapped onto several lines.

**Pattern:** each field's `meta` carries its loading shape, and its own `list:` and `card:` look. The card layout puts the most telling field (usually a photo) first and full-width, with the select box and menu over it, then two or three short lines.

## Loading rows as tall as loaded ones

A loading row does not mount the field components: each cell is a plain placeholder, one text line tall, with the cell's `cssClass` and `skeletonClass`. Make the placeholder take the loaded cell's space:

| Loaded cell | `skeletonClass` |
| --- | --- |
| One line of text | nothing — `cssClass` text size sizes the bar too |
| Two lines (title and subline) | `w-skeleton-box-h-10`: a one-line bar centred in a 2.5rem box |
| A block (thumbnail, avatar, chart) | `w-skeleton-h-11 w-skeleton-w-15 w-skeleton-rounded-md`, its size and corners |

Use the `list:` and `card:` variants when the table and the card differ, such as a two-line cell that is one line in a card:

```ts
export const meta = {
  label: 'place',
  title: 'Place',
  cssClass: 'card:text-sm',
  skeletonClass: 'w-skeleton-box-h-12 card:w-skeleton-box-h-6',
} as const satisfies ListField<Property>
```

A photo that fills the card's width keeps its aspect ratio while loading:

```ts
skeletonClass: 'w-skeleton-h-11 w-skeleton-w-15 w-skeleton-rounded-md card:w-skeleton-w-full card:w-skeleton-h-[auto] card:w-skeleton-rounded-lg card:[&_.w-skeleton]:aspect-3/2'
```

Set `customSkeleton` only when the field draws a placeholder of its own worth mounting the component for. Check: measure a loading and a loaded row in both modes — they should be the same height.

## Photo first, short lines

Marketplace cards (shops, food delivery, listings) share one shape: a big photo, then a headline (price or title), then one or two lines of small, muted facts. Keep the card's width (`w-list-card-w-*`) and let the photo fill it.

```ts
const cardColumns = ['1fr', 'auto'] as const satisfies GridCol[]
const cardAreas = [
  ['photo', 'photo'],
  ['price', AREA_SELECT],
  ['size', 'price_per_m2'],
  ['place', 'place'],
  ['status', 'status'],
  ['updated', 'updated'], // hidden by default: still listed, on a row of its own
] as const satisfies CardAreas<typeof fields, typeof cardColumns.length>
```

```vue
<WList
  :card-columns="cardColumns"
  :card-areas="cardAreas"
  :card-overlay="{[AREA_MORE]: 'photo'}"
  card-class="sm:card:p-3 sm-not:card:py-3 card:gap-x-2 card:gap-y-0.5"
/>
```

- **One field per row**, unless two are short and belong together (price and €/m²). A field that is hidden by default gets a row of its own: in a row with another field, the shown one keeps only its column.
- **A card line, not the table cell.** The table has room for a title with a subline, the card has one line: hide the subline with `card:hidden`, and join small facts into one line (`68 m² · 3 rooms · floor 4/6`) shown with `list:hidden`.
- **Sizes:** the headline `card:text-lg`, the facts `card:text-sm`, the least important `card:text-xs card:text-description`.
- **Fields in one row share it:** card cells can shrink, so the less important one truncates (`truncate` inside, `card:shrink-0` on the part that must stay whole).

## Select box and menu

Both have an area of their own by default (`AREA_SELECT`, `AREA_MORE`). With a photo, put the menu over it (`cardOverlay`): it is a white icon with a dark halo, which reads on any photo and covers little of it. Keep the select box in the headline row: its solid box would hide more of the photo, and it reads as "pick this item" next to the item's data. Over a hidden field, the controls go back to their areas, so list those areas in `cardAreas` too when the field can be hidden.

`cardSelectClass` and `cardMoreClass` style them further. `w-button-more-color-*` sets the menu icon's idle colour, `w-list-card-overlay-inset-*` its distance from the field's corner.

## Controls over a photo

Use `black` and `white` for what sits on a photo — arrows, dots, counters, scrims (`bg-black/55 text-white`). They are the same in both modes, unlike `default` and the gray scale. Show the arrows on hover and always on touch screens (`[@media(hover:none)]:opacity-100`), and stop their click from reaching the row's link (`@click.stop.prevent`).

## Pitfalls

- **`_` in an arbitrary value is a space.** `[&>[style*=area_more]]` matches nothing; escape it (`area\_more`), or better use `cardMoreClass`.
- **A colour the theme does not define renders nothing.** The kit replaces Tailwind's palette: use the kit's tokens.
