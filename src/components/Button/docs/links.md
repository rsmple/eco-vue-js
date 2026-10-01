---
group: Actions
description: WLink and WLinkArrow text links, WRouterLink that works with or without vue-router, WButtonCopy to copy a value and WButtonInput, an icon button the size of an input.
---

# Links and small buttons

## Links

`WLink` is a link inside text, with an icon in a colored chip before it — a link icon by default, or `icon`. The text is `text` or the default slot. It is a router link with `to` and a plain link with `href`; `target` and `rel` go on the link either way. `semanticType` sets the color, primary by default.

`WLinkArrow` is a quiet "more" link with an arrow after the text, e.g. under a short list: `<WLinkArrow :to="{name: RouteName.FINDINGS}" text="All findings" />`.

`WRouterLink` renders the app's `RouterLink` with `to`, and a plain `a` with `href` otherwise — also in an app without vue-router. The kit's links and buttons are built on it.

## Small buttons

`WButtonCopy` copies `value` to the clipboard. Its icon turns into a check for a moment after copying.

`WButtonInput` is a square icon button as tall as an input (`--w-input-height`), with the input's border and corners, to sit next to an input or in its `right` slot. `tooltipText` names it, `loading` swaps the icon for a spinner, and `to` makes it a router link.

<!-- @example Button/Links -->

<DocsDemo name="Button/Links" />

```vue
<template>
  <div class="grid gap-6">
    <p class="max-w-xl leading-relaxed">
      The scanner reports each finding with a
      <WLink
        href="https://cwe.mitre.org/data/definitions/79.html"
        text="CWE-79"
        target="_blank"
        rel="noopener"
      />
      reference. The
      <WLink
        href="https://owasp.org/www-project-top-ten/"
        target="_blank"
        rel="noopener"
        :semantic-type="SemanticType.INFO"
        :icon="markRaw(IconArchiveBook)"
      >
        OWASP guide
      </WLink>
      explains how to fix it.
    </p>

    <div class="flex items-center gap-2">
      <code class="rounded-lg bg-surface-muted px-2 py-1">{{ token }}</code>

      <WButtonCopy :value="token" />
    </div>

    <div class="flex max-w-md items-center gap-2">
      <WInput
        v-model="search"
        placeholder="Repository"
        class="flex-1"
        no-margin
      />

      <WButtonInput
        :icon="markRaw(IconRefresh)"
        tooltip-text="Sync repositories"
        :loading="syncing"
        @click="sync"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButtonCopy from 'eco-vue-js/dist/components/Button/WButtonCopy.vue'
import WButtonInput from 'eco-vue-js/dist/components/Button/WButtonInput.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WLink from 'eco-vue-js/dist/components/Link/WLink.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconRefresh from 'eco-vue-js/dist/assets/icons/IconRefresh'

const token = 'wsp_4f9c2e1a7b'
const search = ref<string>()
const syncing = ref(false)

const sync = () => {
  syncing.value = true
  setTimeout(() => syncing.value = false, 1500)
}
</script>
```

<!-- @example-end -->

## API

<!-- @api WLink -->

### WLink

```ts
import WLink from 'eco-vue-js/dist/components/Link/WLink.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | — | URL of the link, when there is no `to`. |
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | `target` attribute of the link. |
| `rel` | `string` | — | `rel` attribute of the link. |
| `text` | `string` | — | Text of the link. The default slot replaces it. |
| `semanticType` | `SemanticType` | `SemanticType.PRIMARY` | Color of the text and the icon's chip. |
| `icon` | `SVGComponent` | — | Icon before the text, in a chip. Defaults to a link icon. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Text of the link, replacing `text`. |

<!-- @api-end -->

<!-- @api WLinkArrow -->

### WLinkArrow

```ts
import WLinkArrow from 'eco-vue-js/dist/components/Link/WLinkArrow.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Text of the link. The default slot replaces it. |
| `to` | `RouteLocationRaw` | **required** | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Text of the link, replacing `text`. |

<!-- @api-end -->

<!-- @api WRouterLink -->

### WRouterLink

```ts
import WRouterLink from 'eco-vue-js/dist/components/RouterLink/WRouterLink.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `href` | `string` | — | URL of a plain link, used when `to` is empty. |
| `to` | `RouteLocationRaw` | **required** | Router location — renders a router link. Needs vue-router installed in the app. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content of the link. |

<!-- @api-end -->

<!-- @api WButtonCopy -->

### WButtonCopy

```ts
import WButtonCopy from 'eco-vue-js/dist/components/Button/WButtonCopy.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | **required** | Text copied to the clipboard on click. |

<!-- @api-end -->

<!-- @api WButtonInput -->

### WButtonInput

```ts
import WButtonInput from 'eco-vue-js/dist/components/Button/WButtonInput.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `SVGComponent` | **required** | Icon of the button. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |
| `tooltipText` | `string` | — | Tooltip text, which also names the button. |
| `loading` | `boolean` | — | Shows a spinner instead of the icon and ignores clicks. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the button. |
| `disabled` | `boolean` | — | Grays the button out and ignores clicks. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The button was clicked, unless it is disabled or loading. |

<!-- @api-end -->
