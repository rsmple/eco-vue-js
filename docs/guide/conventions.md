---
group: Guide
order: 3
description: Rules every eco-vue-js consumer follows — import paths, markRaw for component props, inherited disabled/readonly/skeleton state, semantic types, and typing list extension components.
---

# Conventions

These hold across the kit; most mistakes come from breaking one.

## Import by path

Components: `eco-vue-js/dist/components/<Folder>/<Name>.vue`; types: `eco-vue-js/dist/components/<Folder>/types`; utilities: `eco-vue-js/dist/utils/<file>`; icons: `eco-vue-js/dist/assets/icons/<IconName>` (no extension).

```ts
import type {FieldProps} from 'eco-vue-js/dist/components/List/types'
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import IconEdit from 'eco-vue-js/dist/assets/icons/IconEdit'
```

## Wrap components passed as props in `markRaw`

Component props — icons, list fields, menus, bulk actions, option components — expect raw components so Vue doesn't make them reactive:

```vue
<WButtonMoreItem
  text="Edit"
  :icon="markRaw(IconEdit)"
/>
```

## Disabled, readonly and skeleton are inherited

When the prop is unset, inputs and buttons read `disabled`, `readonly` and `skeleton` from the nearest parent providing them (`useProvideDisabled`, `useProvideReadonly`, `useProvideSkeleton` from `eco-vue-js/dist/utils/provide`). A [form](/components/form) passes states to fields through the scope. Pass the prop only to override — `false` forces a control enabled inside a disabled form.

## Semantic types, not colors

Components take a `semanticType` (`primary`, `secondary`, `positive`, `negative`, `warning`, `info`) from `eco-vue-js/dist/utils/SemanticType`, not color classes. Apps rebrand by setting each type's classes once with the `setSemanticType*Map` functions.

## Type list extensions with the kit's types

Components plugged into `WList` — fields, menus, bulk actions, filters — must use the kit's prop types, not a restated shape, which drifts and breaks on upgrade when the kit adds a prop:

```ts
import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'

defineProps<MenuProps<Plant>>()
defineEmits<MenuEmits<Plant>>()
```

See [List with fields](../recipes/list-with-fields) for the full pattern.
