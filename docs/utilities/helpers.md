---
group: Utilities
description: Plain helpers from eco-vue-js — validators for inputs and forms, URL param parsers, debounce and throttle, deep equality, scrolling, and browser setup such as preventDragFile and the scrollbar width.
---

# Helpers

Plain functions with no component state, imported from their own file under `eco-vue-js/dist/utils/`. For the data layer's helpers — queries, cache updates and pagination — see [Data layer](/guide/data-layer#lower-level-helpers).

## Validation

```ts
import {validateForbiddenRegexp, validateRequired, validateRequiredSymbols} from 'eco-vue-js/dist/utils/validate'
```

Validators return an error message, or `undefined` when the value is valid — the shape the `validate` prop of [inputs](/components/input#validation), toggles and [form](/components/form) fields takes.

- `validateRequired(value)` — "A value is required" for `undefined`, `null`, an empty string or an empty array.
- `validateForbiddenRegexp(regexp, value)` — names each forbidden character found, e.g. "whitespace". The regexp needs the `g` flag to find more than the first one.
- `validateRequiredSymbols(required, value)` — names each character of `required` missing from the value.

Bind the extra argument for a field: `:validate="value => validateForbiddenRegexp(/\s/g, value)"`.

## URL params

```ts
import {parseBoolean, parseIdList, parseInteger, parseString} from 'eco-vue-js/dist/utils/utils'
```

Parsers turn a value read from the URL back into its type, or `undefined` when it doesn't fit — `createUseQueryParams` takes one per param, see [Filters in the URL](/guide/data-layer#filters-in-the-url).

| Parser | Reads |
| --- | --- |
| `parseString`, `parseBoolean`, `parseInteger` | One value; a boolean is `true` or `false`. |
| `parseStringList`, `parseIntegerList`, `parseIdList` | A comma-separated list. `parseIdList` keeps positive integers only. |
| `parseSliceIndexes` | Two integers, `from,to`. |
| `parseJson(isValid)` | JSON, checked by the type guard passed in. |

`parseId` and `parseIndex` read an id (a positive integer) or an index (zero or more) from a route param, and return `NaN` otherwise; `isId`, `isIdArray` and `isIndex` are the matching type guards.

Sort orders are kept as `ordering=name,-created`: `parseOrdering` from `eco-vue-js/dist/utils/order` reads one into `{field, order}` items with `Order.ASC` or `Order.DESC`, and `encodeOrdering` writes them back.

## Functions

```ts
import {debounce, get, isEqualObj, set, throttle} from 'eco-vue-js/dist/utils/utils'
```

- `debounce(fn, delay = 200)` calls `fn` once calls stop for `delay` ms, with the last arguments. `throttle(fn, delay = 200)` calls it at once, then ignores calls for `delay` ms.
- `isEqualObj(a, b, exclude?, include?)` compares two objects deeply, e.g. a form's model with the saved one. Keys in `exclude` are skipped, and with `include` only those keys are compared. Arrays are equal when they have the same items in any order, and an empty array equals `null` or `undefined`; a key present in only one of them makes them differ.
- `isEqualArr(a, b)` compares two arrays of plain values, in any order.
- `get(data, path)` reads a nested value by a dotted path such as `'address.city'`, and `set(data, path, value)` writes one, creating the objects on the way that are missing.
- `genId()` returns a number unique within the page, e.g. for an element `id`.

## Scrolling

```ts
import {getScrollParent, scrollInParent} from 'eco-vue-js/dist/utils/utils'
```

- `scrollInParent(element, {block, behavior, ifNeeded})` scrolls only the nearest scrolling ancestor — or the page — to bring the element into view, where `scrollIntoView` would scroll every ancestor. `block` is `nearest` by default, or `start` or `center`; `ifNeeded` leaves an element that is already fully in view alone.
- `getScrollParent(node)` returns the nearest ancestor that scrolls, and `getAllScrollParents(node)` all of them.

## Browser

```ts
import {preventDragFile} from 'eco-vue-js/dist/utils/preventDragFile'
import {appendScrollbarStyles} from 'eco-vue-js/dist/utils/scrollbarStyles'
```

Call these once when the app starts:

- `preventDragFile()` stops the browser from opening a file dropped outside a drop zone, and keeps `isDragging` from the same file `true` while a file is dragged over the page — the [file picker](/components/file-picker)'s drop zone lights up with it.
- `appendScrollbarStyles()` sets `--scroll-bar-width` on `<html>` to the width of the page's scrollbar — 0 with overlay scrollbars. The kit subtracts it from the content box in modals, and layouts that must line up with the scrolled content can use it too.

`getIsClientSide()` is `false` during a server render, for code that touches `window` or `document`.
