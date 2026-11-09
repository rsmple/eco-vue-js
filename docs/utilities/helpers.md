---
group: Utilities
description: Plain helpers from eco-vue-js — validators for inputs and forms, URL param parsers, debounce and throttle, deep equality, scrolling, and browser setup such as preventDragFile and the scrollbar width.
---

# Helpers

Stateless functions, each imported from its own file under `eco-vue-js/dist/utils/`. Query, cache and pagination helpers are in [Data layer](/guide/data-layer#lower-level-helpers).

## Validation

```ts
import {validateForbiddenRegexp, validateRequired, validateRequiredSymbols} from 'eco-vue-js/dist/utils/validate'
```

Validators return an error message, or `undefined` when valid — the shape of the `validate` prop on [inputs](/components/input#validation), toggles and [form](/components/form) fields.

- `validateRequired(value)` — "A value is required" for `undefined`, `null`, `''` or `[]`.
- `validateForbiddenRegexp(regexp, value)` — names each forbidden character found, e.g. "whitespace". Needs the `g` flag to find more than one.
- `validateRequiredSymbols(required, value)` — names each character of `required` missing from the value.

Bind the extra argument per field: `:validate="value => validateForbiddenRegexp(/\s/g, value)"`.

## URL params

```ts
import {parseBoolean, parseIdList, parseInteger, parseString} from 'eco-vue-js/dist/utils/utils'
```

Parsers convert a URL value back to its type, or return `undefined` — `createUseQueryParams` takes one per param ([Filters in the URL](/guide/data-layer#filters-in-the-url)).

| Parser | Reads |
| --- | --- |
| `parseString`, `parseBoolean`, `parseInteger` | One value; booleans are `true` or `false`. |
| `parseStringList`, `parseIntegerList`, `parseIdList` | Comma-separated lists; `parseIdList` keeps positive integers. |
| `parseSliceIndexes` | Two integers, `from,to`. |
| `parseJson(isValid)` | JSON, checked by the given type guard. |

`parseId` and `parseIndex` read an id (positive integer) or index (≥ 0) from a route param, else `NaN`; `isId`, `isIdArray` and `isIndex` are the matching guards.

Sort orders look like `ordering=name,-created`: `parseOrdering` (`eco-vue-js/dist/utils/order`) reads `{field, order}` items with `Order.ASC`/`Order.DESC`; `encodeOrdering` writes them.

## Functions

```ts
import {debounce, get, isEqualObj, set, throttle} from 'eco-vue-js/dist/utils/utils'
```

- `debounce(fn, delay = 200)` calls `fn` with the last arguments once calls stop for `delay` ms. `throttle(fn, delay = 200)` calls immediately, then ignores calls for `delay` ms.
- `isEqualObj(a, b, exclude?, include?)` deep-compares objects, e.g. a form model with the saved one. `exclude` skips keys; `include` compares only those. Arrays compare unordered; an empty array equals `null`/`undefined`; a key present on one side only differs.
- `isEqualArr(a, b)` compares arrays of plain values, unordered.
- `get(data, path)` reads by dotted path (`'address.city'`); `set(data, path, value)` writes, creating missing objects.
- `genId()` returns a page-unique number, e.g. for an element `id`.

## Scrolling

```ts
import {getScrollParent, scrollInParent} from 'eco-vue-js/dist/utils/utils'
```

- `scrollInParent(element, {block, behavior, ifNeeded})` scrolls only the nearest scrolling ancestor (or the page), unlike `scrollIntoView`. `block`: `nearest` (default), `start` or `center`; `ifNeeded` skips fully visible elements.
- `getScrollParent(node)` returns the nearest scrolling ancestor; `getAllScrollParents(node)` all of them.

## Browser

```ts
import {preventDragFile} from 'eco-vue-js/dist/utils/preventDragFile'
import {appendScrollbarStyles} from 'eco-vue-js/dist/utils/scrollbarStyles'
```

Call once at startup:

- `preventDragFile()` stops the browser opening files dropped outside a drop zone, and keeps `isDragging` `true` while a file is over the page — the [file picker](/components/file-picker)'s drop zone uses it.
- `appendScrollbarStyles()` sets `--scroll-bar-width` on `<html>` to the page scrollbar's width (0 for overlay scrollbars), which the kit subtracts in modals. It also sets `--vw-scroll-bar-width` — how far `100vw` exceeds the page box — subtracted from `--w-width-inner`. Both update as the scrollbar appears or the window resizes.

`getIsClientSide()` is `false` during SSR, for code touching `window` or `document`.
