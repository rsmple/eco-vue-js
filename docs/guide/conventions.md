---
description: Rules every eco-vue-js consumer follows — import paths, markRaw for component props, inherited disabled/readonly/skeleton state, semantic types, and typing list extension components.
---

# Conventions

These patterns hold across the whole kit. Most mistakes when using it come from breaking one of them.

## Import by path

Components live at `eco-vue-js/dist/components/<Folder>/<Name>.vue`, their types at `eco-vue-js/dist/components/<Folder>/types`, utilities at `eco-vue-js/dist/utils/<file>` and icons at `eco-vue-js/dist/assets/icons/<IconName>` (no extension).

```ts
import type {FieldProps} from 'eco-vue-js/dist/components/List/types'
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import IconEdit from 'eco-vue-js/dist/assets/icons/IconEdit'
```

## Wrap components passed as props in `markRaw`

Props that take a component — icons, list fields, menus, bulk actions, option components — expect a raw component, so Vue does not make it reactive:

```vue
<WButtonMoreItem
  text="Edit"
  :icon="markRaw(IconEdit)"
/>
```

## Disabled, readonly and skeleton are inherited

Inputs and buttons read `disabled`, `readonly` and `skeleton` from the nearest parent that provides them (a form, a list row, a modal) when the prop is left unset. Only pass the prop to override the inherited state — passing `false` forces the control enabled even inside a disabled form.

## Semantic types, not colors

Components take a `semanticType` (`primary`, `secondary`, `positive`, `negative`, `warning`, `info`) from `eco-vue-js/dist/utils/SemanticType` instead of color classes. The classes behind each type are set once per app with the `setSemanticType*Map` functions, which is how an app rebrands the kit.

## Type list extensions with the kit's types

Components plugged into `WList` — fields, menus, bulk actions, filters — must declare their props with the kit's types instead of restating the shape. When the kit adds a prop, a restated shape silently drifts and breaks on the next upgrade:

```ts
import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'

defineProps<MenuProps<Book>>()
defineEmits<MenuEmits<Book>>()
```

See the [List with fields](../recipes/list-with-fields) recipe for the full pattern.
