---
group: Assets
description: Every icon shipped with eco-vue-js, with a searchable gallery and the import path for each.
---

# Icons

Icons are Vue functional components compiled from SVG. They inherit `currentColor` and are sized with classes:

```vue
<template>
  <IconAdd class="square-5 text-primary" />
</template>

<script setup lang="ts">
import IconAdd from 'eco-vue-js/dist/assets/icons/IconAdd'
</script>
```

When passing an icon to a prop, wrap it in `markRaw` — `:icon="markRaw(IconAdd)"`.

<llm-exclude>

<IconGallery />

</llm-exclude>

## All icons

<!-- @icons -->

All 98 icons, importable as `import Name from 'eco-vue-js/dist/assets/icons/Name'`:

`IconAdd`, `IconAddCircle`, `IconAddSquare`, `IconAlarm`, `IconArchiveBook`, `IconArrow`, `IconBack`, `IconBold`, `IconCancel`, `IconCandle`, `IconCelery`, `IconChart`, `IconCheck`, `IconCheckCircle`, `IconCheckSecret`, `IconClose`, `IconCloseCircle`, `IconCodeBlock`, `IconCodeInline`, `IconCopy`, `IconCopySuccess`, `IconCopyright`, `IconDanger`, `IconDojo`, `IconDrag`, `IconEdit`, `IconEditCircle`, `IconEditSquare`, `IconElement`, `IconExport`, `IconEye`, `IconEyeSlash`, `IconFilter`, `IconFilterRemove`, `IconFinding`, `IconFolder`, `IconFolderAdd`, `IconFolderCross`, `IconGrid`, `IconHeading`, `IconItalic`, `IconJira`, `IconKey`, `IconKeySquare`, `IconLayer`, `IconLink`, `IconLinkBold`, `IconLinkOutline`, `IconLinkedIn`, `IconList`, `IconListBullet`, `IconListCheckbox`, `IconListDecrease`, `IconListIncrease`, `IconListNumbered`, `IconListSettings`, `IconLock`, `IconLockOff`, `IconLogout`, `IconMarkdown`, `IconMenu`, `IconMinusCircle`, `IconMoon`, `IconMore`, `IconNegate`, `IconNegativeInfo`, `IconNote`, `IconPaste`, `IconProfile`, `IconQuote`, `IconRadar`, `IconRange`, `IconRedo`, `IconRefresh`, `IconSearch`, `IconSettings`, `IconShift`, `IconSlash`, `IconSort`, `IconStar`, `IconStrikethrough`, `IconSuccess`, `IconSummary`, `IconSun`, `IconTable`, `IconTableCollapsed`, `IconTag`, `IconTask`, `IconTime`, `IconTo`, `IconTrash`, `IconUnderline`, `IconUndo`, `IconUpload`, `IconUser`, `IconVersionControl`, `IconWarn`, `IconWeight`

<!-- @icons-end -->
